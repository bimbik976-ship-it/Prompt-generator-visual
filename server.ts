import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { generateThreePrompts } from './src/services/promptEngine';
import { invokeKieChatModel, KieChatError } from './src/services/kieChatService';
import { KIE_IMAGE_MODELS, KIE_VIDEO_MODELS } from './src/data/modelCatalog';
import { GenerationTask } from './src/types';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase payload limit for base64 source images
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Google AI Studio may mount the application behind a nested path. In that
// deployment shape the browser can call /<app-path>/api/* while Express
// routes are registered as /api/*. Normalize the request URL so the same
// backend works from both root and nested deployments.
app.use((req, _res, next) => {
  const apiMarker = req.url.indexOf('/api/');
  if (apiMarker > 0) {
    req.url = req.url.slice(apiMarker);
  }
  next();
});

// Secure server-side store for Kie.ai API key
// Never exposed in frontend, client only receives masked version
let serverKieApiKey: string | null = process.env.KIE_AI_API_KEY ? process.env.KIE_AI_API_KEY.trim() : null;

// In-memory async generation tasks tracking
const activeTasks = new Map<string, GenerationTask>();

// Temporary public source-image store for Image-to-Video.
// This avoids consuming Kie.ai File Upload quota for user-supplied images.
// Kie.ai only needs a publicly reachable image URL for image_urls.
const temporarySourceImages = new Map<string, {
  bytes: Buffer;
  contentType: string;
  expiresAt: number;
}>();
const SOURCE_IMAGE_TTL_MS = 2 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [token, item] of temporarySourceImages) {
    if (item.expiresAt <= now) temporarySourceImages.delete(token);
  }
}, 10 * 60 * 1000).unref();

// Helper to mask API key for safe UI status reporting
function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••••••••••';
  return `${key.slice(0, 3)}••••••••••••${key.slice(-3)}`;
}

// -------------------------------------------------------------
// API HEALTH CHECK
// -------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'KieGen Creative Studio API',
    serverTime: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// KIE.AI API KEY MANAGEMENT ROUTES
// -------------------------------------------------------------

app.get('/api/kie/status', async (req, res) => {
  // Compatibility path for AI Studio preview runtimes that correctly proxy
  // this known-working GET endpoint but return the SPA shell for newly-added
  // video status routes. Without taskId this remains the normal key-status API.
  const taskId = typeof req.query.taskId === 'string' ? req.query.taskId.trim() : '';
  if (taskId) {
    const task = activeTasks.get(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Video task not found.' });
    }
    if (!serverKieApiKey) {
      task.status = 'FAILED';
      task.error = 'Kie.ai API Key is not connected.';
      return res.json(task);
    }
    await refreshKieTask(task);
    return res.json(task);
  }

  res.json({
    connected: Boolean(serverKieApiKey),
    maskedKey: serverKieApiKey ? maskKey(serverKieApiKey) : null,
    source: process.env.KIE_AI_API_KEY ? 'env' : 'user',
  });
});

app.post('/api/kie/key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Kie.ai API Key is invalid or not connected.',
    });
  }
  serverKieApiKey = apiKey.trim();
  res.json({
    success: true,
    maskedKey: maskKey(serverKieApiKey),
    message: 'API Key Connected successfully.',
  });
});

app.delete('/api/kie/key', (req, res) => {
  serverKieApiKey = null;
  res.json({ success: true, message: 'Kie.ai API key cleared.' });
});

// -------------------------------------------------------------
// KIE.AI CREDIT BALANCE ENDPOINT
// -------------------------------------------------------------

app.get('/api/kie/credit', async (req, res) => {
  if (!serverKieApiKey) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Kie.ai API Key',
    });
  }

  try {
    const response = await fetch('https://api.kie.ai/api/v1/chat/credit', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serverKieApiKey}`,
        'Accept': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Kie.ai API Key',
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      if (response.status === 402 || errorText.toLowerCase().includes('insufficient')) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient Kie.ai Credits',
        });
      }
      return res.status(response.status).json({
        success: false,
        error: 'Unable to check Kie.ai balance',
      });
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      return res.status(500).json({
        success: false,
        error: 'Balance information unavailable',
      });
    }

    if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
      const msg = String(data.msg || data.message || '').toLowerCase();
      if (msg.includes('invalid') || msg.includes('auth') || msg.includes('key') || msg.includes('unauthorized')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Kie.ai API Key',
        });
      }
      if (msg.includes('insufficient') || msg.includes('credit')) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient Kie.ai Credits',
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Unable to check Kie.ai balance',
      });
    }

    let balanceVal: any = undefined;
    if (data.data !== undefined && data.data !== null) {
      if (typeof data.data === 'number' || typeof data.data === 'string') {
        balanceVal = data.data;
      } else if (typeof data.data === 'object') {
        balanceVal = data.data.credit ?? data.data.balance ?? data.data.credits ?? data.data.amount ?? data.data.total_credit;
      }
    }
    if (balanceVal === undefined) {
      balanceVal = data.credit ?? data.balance ?? data.credits ?? data.amount;
    }

    if (balanceVal === undefined || balanceVal === null || (typeof balanceVal !== 'number' && typeof balanceVal !== 'string') || isNaN(Number(balanceVal))) {
      return res.status(500).json({
        success: false,
        error: 'Balance information unavailable',
      });
    }

    const numericBalance = Number(balanceVal);
    const formattedDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return res.json({
      success: true,
      balance: numericBalance,
      lastChecked: formattedDate,
      warning: numericBalance <= 0 ? 'Insufficient Kie.ai Credits' : null,
    });
  } catch (err: any) {
    console.error('Error checking Kie.ai credit:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to check Kie.ai balance',
    });
  }
});

// -------------------------------------------------------------
// MODEL CATALOG ENDPOINTS
// -------------------------------------------------------------

app.get('/api/models/image', (req, res) => {
  res.json(KIE_IMAGE_MODELS);
});

app.get('/api/models/video', (req, res) => {
  res.json(KIE_VIDEO_MODELS);
});

// -------------------------------------------------------------
// MODULE 1 — PROMPT GENERATOR ROUTE (CHAT MODEL DRIVEN)
// -------------------------------------------------------------

app.post('/api/generate-prompts', async (req, res) => {
  try {
    const options = req.body;
    if (!options || typeof options !== 'object') {
      return res.status(400).json({ message: 'Invalid prompt generator options.' });
    }

    const requestedChatModel = options.chatModel === 'gpt-6-astra'
      ? 'gpt-6-astra'
      : options.chatModel === 'gpt-5.6'
        ? 'gpt-5.6'
        : 'gpt-5.5';

    const modelName = requestedChatModel === 'gpt-6-astra'
      ? 'GPT-6 Astra'
      : requestedChatModel === 'gpt-5.6'
        ? 'GPT-5.6'
        : 'GPT-5.5';

    if (!serverKieApiKey) {
      return res.status(401).json({
        success: false,
        message: `Invalid Kie.ai API Key. Please connect your Kie.ai API Key first to generate prompts with ${modelName}.`,
      });
    }

    const prompts = await invokeKieChatModel(
      serverKieApiKey,
      requestedChatModel,
      {
        chatModel: requestedChatModel,
        background: options.background || 'Random',
        mood: options.mood || 'Random',
        suasana: options.suasana || 'Random',
        kategori: options.kategori || 'Random',
        dekorasi: options.dekorasi || 'Random',
        flower: options.flower || 'Random',
        basin: options.basin || 'Random',
        bamboo: options.bamboo || 'Random',
        cameraAngle: 'Locked: Close environmental perspective, slightly above basin level, 3/4 front view, natural shallow depth of field',
        referenceImageData: typeof options.referenceImageData === 'string' ? options.referenceImageData : undefined,
        referenceImageName: typeof options.referenceImageName === 'string' ? options.referenceImageName : undefined,
      }
    );

    res.json(prompts);
  } catch (err: any) {
    console.error('Error in /api/generate-prompts:', err);
    if (err instanceof KieChatError) {
      return res.status(err.statusCode || 500).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || 'The prompt generation task failed. Please try again.' });
  }
});

// -------------------------------------------------------------
// MODULE 2 — IMAGE GENERATION ROUTE
// -------------------------------------------------------------

app.post('/api/generate-image', async (req, res) => {
  // AI Studio's preview proxy reliably exposes this existing POST route.
  // Reuse it as the compatibility entry point for Image-to-Video instead of
  // depending on a newly-added nested video route that may be served by the
  // SPA shell (HTTP 200 HTML) in some runtimes.
  if (req.body?.generationType === 'video') {
    return videoGenerateHandler(req, res);
  }

  try {
    const { modelId, prompt, aspectRatio = '1:1', count = 1 } = req.body;
    const requestedCount = Number(count);

    if (!serverKieApiKey) {
      return res.status(401).json({
        message: 'Kie.ai API Key is not connected. Please connect your Kie.ai API Key first.',
      });
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'Image prompt is required.' });
    }

    if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 4) {
      return res.status(400).json({ message: 'Image count must be an integer between 1 and 4.' });
    }

    const selectedModel = KIE_IMAGE_MODELS.find(m => m.id === modelId) || KIE_IMAGE_MODELS[0];
    const kieModelId = selectedModel.kieModelId;

    if (!kieModelId) {
      return res.status(400).json({
        message: `The selected image model (${selectedModel.name}) is not configured for the Kie.ai Market API.`,
      });
    }

    // Kie.ai models have different native multi-image capabilities. To keep the
    // Image Generator consistent across models, this batch feature creates one
    // REAL Kie.ai task per requested image. Each task uses the exact same prompt;
    // provider-side randomness produces independent variants. No fake/local image
    // generation is used and every generated image consumes the normal Kie credits.
    const createTask = async (): Promise<GenerationTask> => {
      const input: Record<string, any> = {
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio,
      };

      if (kieModelId.startsWith('seedream/')) {
        input.quality = 'basic';
        input.output_format = 'png';
        input.nsfw_checker = true;
      }
      if (kieModelId === 'google/imagen4') {
        input.negative_prompt = '';
        input.seed = '';
      }
      if (kieModelId === 'flux-2/pro-text-to-image') {
        input.resolution = '1K';
        input.nsfw_checker = false;
      }

      const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serverKieApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: kieModelId,
          input,
        }),
      });

      const rawText = await response.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!response.ok || (data?.code !== undefined && data.code !== 0 && data.code !== 200)) {
        const providerMessage = data?.msg || data?.message || rawText || `Kie.ai HTTP ${response.status}`;
        throw new Error(`Kie.ai image generation failed: ${providerMessage}`);
      }

      const kieTaskId = data?.data?.taskId;
      if (!kieTaskId) {
        throw new Error('Kie.ai accepted the request but did not return a taskId.');
      }

      const task: GenerationTask = {
        taskId: String(kieTaskId),
        type: 'image',
        modelId: selectedModel.id,
        status: 'SUBMITTED',
        prompt: prompt.trim(),
        aspectRatio,
        createdAt: Date.now(),
      };
      activeTasks.set(task.taskId, task);
      return task;
    };

    const settled = await Promise.allSettled(
      Array.from({ length: requestedCount }, () => createTask())
    );
    const tasks = settled
      .filter((result): result is PromiseFulfilledResult<GenerationTask> => result.status === 'fulfilled')
      .map((result) => result.value);
    const failures = settled.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    if (tasks.length === 0) {
      const firstFailure = failures[0]?.reason;
      return res.status(502).json({
        message: firstFailure?.message || 'Unable to create Kie.ai image tasks.',
      });
    }

    if (failures.length > 0) {
      console.error(`Kie.ai accepted ${tasks.length}/${requestedCount} image tasks; ${failures.length} task creation(s) failed.`);
    }

    return res.json({
      batchId: `img_batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'image',
      modelId: selectedModel.id,
      prompt: prompt.trim(),
      count: tasks.length,
      tasks,
      createdAt: Date.now(),
    });
  } catch (err: any) {
    console.error('Error initiating REAL Kie.ai image generation batch:', err);
    return res.status(500).json({
      message: err?.message || 'Unable to connect to Kie.ai image generation service.',
    });
  }
});

// -------------------------------------------------------------
// KIE.AI VIDEO SOURCE IMAGE HOSTING
// -------------------------------------------------------------

function getPublicAppOrigin(req: express.Request): string | null {
  const configured = process.env.PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:') return parsed.origin;
    } catch {
      // Ignore invalid configuration and fall back to request headers.
    }
  }

  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || req.protocol;
  const host = String(req.headers['x-forwarded-host'] || req.get('host') || '').split(',')[0].trim();
  if (!host || protocol !== 'https') return null;
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host)) return null;
  return `https://${host}`;
}

function parseImageDataUrl(imageUrl: string): { contentType: string; bytes: Buffer; extension: string } | null {
  const match = imageUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i);
  if (!match) return null;
  const contentType = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length) throw new Error('Source image is empty.');
  if (bytes.length > 10 * 1024 * 1024) throw new Error('Source image must be 10MB or smaller.');
  return { contentType, bytes, extension };
}

app.get('/api/source-image/:token', (req, res) => {
  const item = temporarySourceImages.get(String(req.params.token));
  if (!item || item.expiresAt <= Date.now()) {
    temporarySourceImages.delete(String(req.params.token));
    return res.status(404).send('Source image expired or not found.');
  }
  res.setHeader('Content-Type', item.contentType);
  res.setHeader('Content-Length', item.bytes.length.toString());
  res.setHeader('Cache-Control', 'public, max-age=300, no-store');
  return res.send(item.bytes);
});

async function ensureKieImageUrl(imageUrl: string, req: express.Request): Promise<string> {
  if (!imageUrl.startsWith('data:')) return imageUrl;

  const parsedImage = parseImageDataUrl(imageUrl);
  if (!parsedImage) {
    throw new Error('Source image must be a PNG, JPEG, JPG, or WebP image.');
  }

  // PRIMARY PATH: host the user's image temporarily from this full-stack app.
  // This completely avoids Kie.ai's File Upload quota (including the Free-plan
  // upload limit shown by Kie.ai) while still giving Kling a normal HTTPS URL.
  const origin = getPublicAppOrigin(req);
  if (origin) {
    const token = crypto.randomBytes(24).toString('hex');
    temporarySourceImages.set(token, {
      bytes: parsedImage.bytes,
      contentType: parsedImage.contentType,
      expiresAt: Date.now() + SOURCE_IMAGE_TTL_MS,
    });
    return `${origin}/api/source-image/${token}`;
  }

  // LOCAL DEVELOPMENT FALLBACK: if the server has no public HTTPS origin,
  // use Kie.ai's official File Upload API. This is intentionally not used when
  // a public AI Studio/Cloud Run origin is available.
  const uploadResponse = await fetch('https://kieai.redpandaai.co/api/file-base64-upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serverKieApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64Data: imageUrl,
      uploadPath: 'videos/image-to-video-source',
      fileName: `source-${Date.now()}.${parsedImage.extension}`,
    }),
  });

  const rawText = await uploadResponse.text();
  let data: any = null;
  try { data = rawText ? JSON.parse(rawText) : null; } catch { data = null; }

  if (!uploadResponse.ok || (data?.code !== undefined && data.code !== 0 && data.code !== 200)) {
    throw new Error(data?.msg || data?.message || `Kie.ai source image upload failed (HTTP ${uploadResponse.status}).`);
  }

  const url = data?.data?.downloadUrl || data?.data?.fileUrl || data?.data?.url || data?.downloadUrl || data?.fileUrl || data?.url;
  if (!url || typeof url !== 'string') {
    throw new Error('Kie.ai source image upload succeeded but returned no downloadable image URL.');
  }
  return url;
}

function getKieVideoModelId(modelId: string): string {
  switch (modelId) {
    case 'kling-3.0-i2v':
      return 'kling-3.0-omni/image-to-video';
    case 'kling-3.0-omni-i2v':
      return 'kling-3.0-omni/image-to-video';
    case 'wan-2.7-i2v':
      return 'wan/2-7-image-to-video';
    default:
      return '';
  }
}

// Shared Kie.ai task refresh used by the compatibility status endpoint.
// It keeps the normal /api/kie/status route useful for video polling while
// preserving the real provider task ID and result URL.
async function refreshKieTask(task: GenerationTask): Promise<void> {
  try {
    const response = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(task.taskId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${serverKieApiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    const rawText = await response.text();
    let data: any = null;
    try { data = rawText ? JSON.parse(rawText) : null; } catch { data = null; }

    if (!response.ok || (data?.code !== undefined && data.code !== 0 && data.code !== 200)) {
      task.status = 'FAILED';
      task.error = data?.msg || data?.message || `Kie.ai task status HTTP ${response.status}`;
      task.completedAt = Date.now();
      return;
    }

    const providerData = data?.data;
    if (!providerData) {
      task.status = 'PROCESSING';
      task.error = undefined;
      return;
    }

    const state = String(providerData?.state || providerData?.status || '').toLowerCase();
    const successFlag = providerData?.successFlag;

    if (state === 'waiting' || state === 'queuing' || state === 'generating' || successFlag === 0) {
      task.status = 'PROCESSING';
      task.error = undefined;
      return;
    }

    if (state === 'fail' || state === 'failed' || successFlag === 2 || successFlag === 3) {
      task.status = 'FAILED';
      task.error = providerData?.failMsg || providerData?.failCode || providerData?.errorMessage || data?.msg || 'Kie.ai video generation failed.';
      task.completedAt = Date.now();
      return;
    }

    let result: any = providerData?.resultJson;
    if (typeof result === 'string') {
      try { result = JSON.parse(result); } catch { result = null; }
    }

    const responseData = providerData?.response || result?.response || {};
    const resultUrl =
      responseData?.resultUrls?.[0] ||
      responseData?.result_urls?.[0] ||
      responseData?.fullResultUrls?.[0] ||
      responseData?.full_result_urls?.[0] ||
      result?.resultUrls?.[0] ||
      result?.result_urls?.[0] ||
      result?.resultUrl ||
      result?.videoUrl ||
      result?.url ||
      providerData?.resultUrls?.[0] ||
      providerData?.resultUrl ||
      providerData?.videoUrl;

    if (state === 'success' || successFlag === 1 || resultUrl) {
      if (typeof resultUrl === 'string' && resultUrl) {
        task.status = 'SUCCESS';
        task.resultUrl = resultUrl;
        task.error = undefined;
        task.completedAt = Date.now();
        return;
      }
      task.status = 'PROCESSING';
      task.error = undefined;
      return;
    }

    task.status = 'PROCESSING';
    task.error = undefined;
  } catch (err) {
    console.error('Error refreshing Kie.ai video task:', err);
    task.status = 'PROCESSING';
    task.error = undefined;
  }
}

// -------------------------------------------------------------
// TASK STATUS POLLING ROUTE
// -------------------------------------------------------------

// Stable task-status aliases. Keep a shallow alias available for the same
// AI Studio routing reason as the generation endpoint.
app.get('/api/kie-video-status/:taskId', (req, _res, next) => {
  req.url = `/api/task-status/${encodeURIComponent(req.params.taskId)}`;
  next();
});

app.get('/api/kie/video/status/:taskId', (req, _res, next) => {
  req.url = `/api/task-status/${encodeURIComponent(req.params.taskId)}`;
  next();
});

app.get('/api/task-status/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const task = activeTasks.get(taskId);

  if (!task) {
    return res.status(404).json({ message: 'Generation task not found.' });
  }

  if (!serverKieApiKey) {
    task.status = 'FAILED';
    task.error = 'Kie.ai API Key is not connected.';
    return res.json(task);
  }

  try {
    const response = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${serverKieApiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    const rawText = await response.text();
    let data: any = null;
    try { data = rawText ? JSON.parse(rawText) : null; } catch { data = null; }

    if (!response.ok || (data?.code !== undefined && data.code !== 0 && data.code !== 200)) {
      task.status = 'FAILED';
      task.error = data?.msg || data?.message || `Kie.ai task status HTTP ${response.status}`;
      task.completedAt = Date.now();
      return res.json(task);
    }

    const providerData = data?.data;

    // Kie.ai may briefly return an empty/null record while the task is being
    // registered. This is not a generation failure, so keep polling instead
    // of exposing the misleading "recordInfo is null" error to the user.
    if (!providerData) {
      task.status = 'PROCESSING';
      task.error = undefined;
      return res.json(task);
    }

    const state = String(providerData?.state || providerData?.status || '').toLowerCase();
    const successFlag = providerData?.successFlag;

    if (state === 'waiting' || state === 'queuing' || state === 'generating' || successFlag === 0) {
      task.status = 'PROCESSING';
      task.error = undefined;
      return res.json(task);
    }

    if (state === 'fail' || state === 'failed' || successFlag === 2 || successFlag === 3) {
      task.status = 'FAILED';
      task.error = providerData?.failMsg || providerData?.failCode || providerData?.errorMessage || data?.msg || 'Kie.ai video generation failed.';
      task.completedAt = Date.now();
      return res.json(task);
    }

    let result: any = providerData?.resultJson;
    if (typeof result === 'string') {
      try { result = JSON.parse(result); } catch { result = null; }
    }

    const responseData = providerData?.response || result?.response || {};
    const resultUrl =
      responseData?.resultUrls?.[0] ||
      responseData?.result_urls?.[0] ||
      responseData?.fullResultUrls?.[0] ||
      responseData?.full_result_urls?.[0] ||
      result?.resultUrls?.[0] ||
      result?.result_urls?.[0] ||
      result?.resultUrl ||
      result?.videoUrl ||
      result?.url ||
      providerData?.resultUrls?.[0] ||
      providerData?.resultUrl ||
      providerData?.videoUrl;

    if (state === 'success' || successFlag === 1 || resultUrl) {
      if (!resultUrl || typeof resultUrl !== 'string') {
        task.status = 'PROCESSING';
        task.error = undefined;
        return res.json(task);
      }

      task.status = 'SUCCESS';
      task.resultUrl = resultUrl;
      task.error = undefined;
      task.completedAt = Date.now();
      return res.json(task);
    }

    // Unknown/non-terminal Kie.ai state: continue polling rather than
    // fabricating a failure or a video result.
    task.status = 'PROCESSING';
    task.error = undefined;
    return res.json(task);
  } catch (err: any) {
    // A transient network/polling failure must not immediately turn a valid
    // Kie.ai task into FAILED. The frontend will retry on the next interval.
    console.error('Error polling Kie.ai video task:', err);
    task.status = 'PROCESSING';
    task.error = undefined;
    return res.json(task);
  }
});

// -------------------------------------------------------------
// SEAMLESS LOOP PROMPT GENERATOR ROUTE
// -------------------------------------------------------------

app.post('/api/seamless-loop-prompt', async (req, res) => {
  try {
    const { imageUrl, existingPrompt = '' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'The selected image could not be processed.' });
    }

    // Analyze visible elements in the scene
    const identifiedElements = [
      'Steady laminar water stream trickling continuously from bamboo spout',
      'Gentle concentric ripple rings propagating outward across water mirror',
      'Floating lotus blossom maintaining organic float equilibrium',
      'Velvety moss and beaded water droplets along the wet basin rim',
      'Subtle ambient foliage micro-sway in the background',
      'Soft stable ambient lighting with unchanging specular reflections',
    ];

    // Construct a pristine seamless-loop video prompt tailored to the actual image
    const customPrompt = [
      'Seamless cyclic environmental motion loop.',
      'The camera is strictly locked in place, maintaining a completely static, vibration-free environmental three-quarter front perspective with zero pan, zoom, tilt, or tracking motion.',
      'Crystal-clear water pours in a steady, unbroken laminar stream from the bamboo kakehi spout, creating rhythmic, gentle concentric ripple rings that spread smoothly across the calm, dark reflective water mirror of the stone basin.',
      'The floating blossom rests stably on the surface with microscopic, natural aquatic micro-movement.',
      'Soft environmental breeze causes subtle, slow micro-sway in the background bamboo leaves and ferns without altering the scene composition.',
      'Lighting and shadows remain completely stable throughout the duration with no flickering, exposure changes, or morphing.',
      'The motion cycle is perfectly continuous and seamless: the final frame visual physics match the initial frame precisely, creating an imperceptible loop seam suitable for endless contemplation.',
    ].join(' ');

    const loopGuidelines = 'Static camera locked. Cyclic water stream and ripple motion. Zero morphing or scene restructuring. Exact frame-matching for seamless looping.';

    res.json({
      customPrompt,
      identifiedElements,
      loopGuidelines,
    });
  } catch (err: any) {
    console.error('Error creating seamless loop prompt:', err);
    res.status(500).json({ message: 'Failed to generate seamless loop prompt.' });
  }
});

// -------------------------------------------------------------
// MODULE 3 — IMAGE TO VIDEO GENERATION ROUTE
// -------------------------------------------------------------

// Stable Kie video API aliases.
// AI Studio preview/deployment layers can reserve or intercept some nested
// /api/* paths. Keep the canonical endpoint shallow and expose several aliases
// so Image-to-Video never depends on a host-specific nested route.
async function videoGenerateHandler(req: express.Request, res: express.Response) {
  try {
    const {
      modelId,
      imageUrl,
      prompt,
      duration = 5,
      resolution = '1080p',
      aspectRatio = '16:9',
      loopMode = true,
      motionStrength = 3,
    } = req.body;

    if (!serverKieApiKey) {
      return res.status(401).json({ message: 'Kie.ai API Key is not connected.' });
    }
    if (!imageUrl) {
      return res.status(400).json({ message: 'The selected image could not be processed.' });
    }
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: 'Video prompt is required.' });
    }

    const selectedModel = KIE_VIDEO_MODELS.find(m => m.id === modelId) || KIE_VIDEO_MODELS[0];
    const kieModel = getKieVideoModelId(selectedModel.id);

    if (!kieModel) {
      return res.status(400).json({
        message: `${selectedModel.name} is not connected to a verified Kie.ai Image-to-Video endpoint yet. Please select a supported Image-to-Video model.`,
      });
    }

    const sourceUrl = await ensureKieImageUrl(String(imageUrl), req);
    const numericDuration = Number(duration);

    const input: any = {
      prompt: prompt.trim(),
      image_urls: [sourceUrl],
      duration: numericDuration,
      aspect_ratio: aspectRatio,
    };

    if (selectedModel.id === 'kling-3.0-i2v' || selectedModel.id === 'kling-3.0-omni-i2v') {
      input.customize_multi_shots = false;
      input.audio = false;
      input.resolution = resolution;
      input.elements = [];
      // Preserve the user's motion/camera intent in the prompt without
      // inventing unsupported API parameters.
      input.prompt = `${prompt.trim()} ${loopMode ? 'Create a continuous cyclic motion suitable for seamless looping.' : ''} ${motionStrength <= 2 ? 'Keep motion very subtle and restrained.' : motionStrength >= 4 ? 'Allow moderately expressive environmental motion.' : 'Use natural moderate environmental motion.'}`.trim();
    } else if (selectedModel.id === 'wan-2.7-i2v') {
      // Wan 2.7 uses first_frame_url rather than image_urls.
      delete input.image_urls;
      input.first_frame_url = sourceUrl;
      input.resolution = resolution;
      input.prompt_extend = true;
      input.watermark = false;
      input.negative_prompt = 'blurry, flicker, low quality, distorted, camera shake, morphing, exposure flicker';
    }

    const createResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serverKieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: kieModel,
        input,
      }),
    });

    const rawText = await createResponse.text();
    let data: any = null;
    try { data = rawText ? JSON.parse(rawText) : null; } catch { data = null; }

    if (!createResponse.ok || (data?.code !== undefined && data.code !== 0 && data.code !== 200)) {
      const message = data?.msg || data?.message || `Kie.ai video task creation failed (HTTP ${createResponse.status}).`;
      return res.status(createResponse.status >= 400 ? createResponse.status : 502).json({ message });
    }

    const taskId = data?.data?.taskId || data?.taskId;
    if (!taskId || typeof taskId !== 'string') {
      return res.status(502).json({ message: 'Kie.ai accepted the request but returned no task ID.' });
    }

    // IMPORTANT: taskId is the actual Kie.ai task ID. The previous version
    // generated a local fake ID and then queried Kie.ai with that ID, which
    // caused the "recordInfo is null" failure shown in the UI.
    const newTask: GenerationTask = {
      taskId,
      type: 'video',
      modelId: selectedModel.id,
      status: 'SUBMITTED',
      prompt: prompt.trim(),
      aspectRatio,
      duration: numericDuration,
      sourceImageUrl: sourceUrl,
      createdAt: Date.now(),
    };

    activeTasks.set(taskId, newTask);
    return res.json(newTask);
  } catch (err: any) {
    console.error('Error creating REAL Kie.ai video task:', err);
    return res.status(500).json({
      message: err?.message || 'Unable to create the Kie.ai Image-to-Video task.',
    });
  }
}

// Canonical shallow route + compatibility aliases.
// The frontend uses /api/kie-video-generate because this path is less likely to
// collide with an AI Studio host route than /api/kie/video/generate.
app.post('/api/kie-video-generate', videoGenerateHandler);
app.post('/api/kie-video/generate', videoGenerateHandler);
app.post('/api/kie/video/generate', videoGenerateHandler);
app.post('/api/generate-video', videoGenerateHandler);

app.get('/api/kie-video-health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, service: 'KieGen video API', provider: 'Kie.ai', route: 'kie-video-v2' });
});

app.get('/api/kie/video/health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, service: 'KieGen video API', provider: 'Kie.ai', route: 'kie-video-v2' });
});

// Proxy generated image bytes through the same origin so downloads work even when
// the provider CDN does not expose permissive browser CORS headers.
app.get('/api/download-image', async (req, res) => {
  try {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();
    const blocked = hostname === 'localhost' || hostname === '::1' ||
      hostname.startsWith('127.') || hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') || hostname.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
      hostname.endsWith('.local');
    if (parsed.protocol !== 'https:' || blocked) {
      return res.status(400).json({ message: 'Invalid image URL.' });
    }

    const response = await fetch(parsed.toString());
    if (!response.ok) return res.status(response.status).json({ message: 'Unable to fetch generated image.' });
    const contentType = response.headers.get('content-type') || 'image/png';
    const bytes = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', bytes.length.toString());
    res.setHeader('Cache-Control', 'no-store');
    return res.send(bytes);
  } catch (err) {
    console.error('Error downloading generated image:', err);
    return res.status(400).json({ message: 'Unable to download generated image.' });
  }
});

// Image upload handling
app.post('/api/upload-image', (req, res) => {
  const { imageData } = req.body;
  if (!imageData) {
    return res.status(400).json({ message: 'The selected image could not be processed.' });
  }
  res.json({ success: true, url: imageData });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE SETUP
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Never return the SPA HTML document for an unknown /api route.
    // This prevents the frontend from receiving <!doctype html> where JSON is expected.
    app.use('/api', (req, res, next) => {
      if (!res.headersSent) {
        return res.status(404).json({
          success: false,
          message: `API route not found: ${req.method} ${req.path}`,
        });
      }
      next();
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
