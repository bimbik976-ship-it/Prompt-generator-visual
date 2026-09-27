import {
  KieKeyStatus,
  ImageModelConfig,
  VideoModelConfig,
  PromptOptions,
  GeneratedPromptItem,
  GenerationTask,
  ImageGenerationBatch,
  SeamlessLoopPromptResult,
} from '../types';

function getApiBaseCandidates(): string[] {
  const candidates = ['/api'];

  // AI Studio previews can expose the app under a nested URL. Generate several
  // standards-compliant relative candidates instead of assuming pathname is the
  // deployment root. The first successful JSON endpoint wins.
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname || '/';
    const trimmed = pathname.replace(/\/+$/, '');
    const parentPath = trimmed.includes('/') ? trimmed.slice(0, trimmed.lastIndexOf('/')) : '';

    const relativeCandidates = [
      new URL('./api', window.location.href).pathname,
      new URL('../api', window.location.href).pathname,
    ];

    if (trimmed) {
      relativeCandidates.push(`${trimmed}/api`);
      if (parentPath) relativeCandidates.push(`${parentPath}/api`);
    }

    for (const candidate of relativeCandidates) {
      if (candidate && candidate !== '/api') candidates.push(candidate.replace(/\/+$/, ''));
    }
  }

  return [...new Set(candidates)];
}

function apiUrl(path: string, base: string): string {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  const bases = getApiBaseCandidates();
  let lastResponse: Response | null = null;

  for (let i = 0; i < bases.length; i += 1) {
    const base = bases[i];
    const res = await fetch(apiUrl(path, base), init);
    lastResponse = res;

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const looksLikeHtml = contentType.includes('text/html') || contentType.includes('application/xhtml');
    const likelyMissingRoute = res.status === 404;
    const hasFallback = i < bases.length - 1;

    // If the first candidate returns the AI Studio HTML shell (often HTTP 200)
    // or a 404, retry against the nested application path before failing.
    if ((looksLikeHtml || likelyMissingRoute) && hasFallback) {
      continue;
    }

    return res;
  }

  return lastResponse as Response;
}

async function readApiResponse<T = any>(res: Response, fallbackMessage: string): Promise<T> {
  const raw = await res.text();
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  let data: any = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      const looksLikeHtml = contentType.includes('text/html') || /^\s*<!doctype html/i.test(raw) || /^\s*<html/i.test(raw);
      if (looksLikeHtml) {
        throw new Error(
          `API endpoint returned HTML instead of JSON (HTTP ${res.status}). The KieGen Image-to-Video backend did not return JSON. The app will report the exact backend route problem instead of attempting a fake video.`
        );
      }
      throw new Error(`API returned an invalid response (HTTP ${res.status}). ${raw.slice(0, 180)}`);
    }
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || fallbackMessage);
  }

  return data as T;
}


export async function fetchKieStatus(): Promise<KieKeyStatus> {
  try {
    const res = await fetchApi('/kie/status');
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (err) {
    console.error('Error checking Kie.ai status:', err);
    return { connected: false };
  }
}

export async function saveKieKey(apiKey: string): Promise<{ success: boolean; maskedKey?: string; message?: string }> {
  try {
    const res = await fetchApi('/kie/key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to save API key');
    }
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || 'Kie.ai API Key is invalid or not connected.' };
  }
}

export async function disconnectKieKey(): Promise<boolean> {
  try {
    const res = await fetchApi('/kie/key', { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchKieCredit(): Promise<{
  success: boolean;
  balance?: number;
  lastChecked?: string;
  error?: string;
  warning?: string;
}> {
  try {
    const res = await fetchApi('/kie/credit');
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Unable to check Kie.ai balance',
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'Unable to check Kie.ai balance',
    };
  }
}

export async function fetchImageModels(): Promise<ImageModelConfig[]> {
  try {
    const res = await fetchApi('/models/image');
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Using local image models catalog fallback:', err);
  }
  const { KIE_IMAGE_MODELS } = await import('../data/modelCatalog');
  return KIE_IMAGE_MODELS;
}

export async function fetchVideoModels(): Promise<VideoModelConfig[]> {
  try {
    const res = await fetchApi('/models/video');
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Using local video models catalog fallback:', err);
  }
  const { KIE_VIDEO_MODELS } = await import('../data/modelCatalog');
  return KIE_VIDEO_MODELS;
}

export async function requestPrompts(options: PromptOptions): Promise<GeneratedPromptItem[]> {
  const res = await fetchApi('/generate-prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to generate prompts');
  }
  return await res.json();
}

export async function requestImageGeneration(params: {
  modelId: string;
  prompt: string;
  aspectRatio: string;
  quality?: string;
  count?: number;
}): Promise<ImageGenerationBatch> {
  const res = await fetchApi('/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'The generation task failed. Please try again or select another model.');
  }
  return data;
}

export async function pollTaskStatus(taskId: string): Promise<GenerationTask> {
  // Use the already-proven Kie status endpoint as the first compatibility path.
  // Some AI Studio preview proxies return the SPA HTML shell for newer nested
  // routes even though existing /api/kie/* endpoints are active.
  const encoded = encodeURIComponent(taskId);
  const routeCandidates = [
    `/kie/status?taskId=${encoded}`,
    `/kie-video-status/${encoded}`,
    `/kie/video/status/${encoded}`,
    `/task-status/${encoded}`,
  ];
  let lastResponse: Response | null = null;

  for (const route of routeCandidates) {
    const res = await fetchApi(route, { headers: { 'Accept': 'application/json' } });
    lastResponse = res;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const raw = await res.clone().text();
    const looksLikeHtml = contentType.includes('text/html') || /^\s*<!doctype html/i.test(raw) || /^\s*<html/i.test(raw);
    if ((looksLikeHtml || res.status === 404) && route !== routeCandidates[routeCandidates.length - 1]) continue;
    return await readApiResponse<GenerationTask>(res, 'Failed to retrieve task status.');
  }

  return await readApiResponse<GenerationTask>(lastResponse as Response, 'Failed to retrieve task status.');
}

export async function requestSeamlessLoopPrompt(imageUrl: string, existingPrompt?: string): Promise<SeamlessLoopPromptResult> {
  const res = await fetchApi('/seamless-loop-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, existingPrompt }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to analyze image for seamless loop prompt.');
  }
  return data;
}

export async function requestVideoGeneration(params: {
  modelId: string;
  imageUrl: string;
  prompt: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  loopMode?: boolean;
  motionStrength?: number;
}): Promise<GenerationTask> {
  // /generate-image is an existing POST route already known to work in the
  // AI Studio preview. The server detects generationType='video' and forwards
  // it to the real Kie.ai video handler, avoiding the HTML-shell route issue.
  const routeCandidates = [
    '/generate-image',
    '/kie-video-generate',
    '/kie-video/generate',
    '/kie/video/generate',
    '/generate-video',
  ];

  let lastResponse: Response | null = null;
  for (const route of routeCandidates) {
    const res = await fetchApi(route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ ...params, generationType: 'video' }),
    });
    lastResponse = res;

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const raw = await res.clone().text();
    const looksLikeHtml = contentType.includes('text/html') || /^\s*<!doctype html/i.test(raw) || /^\s*<html/i.test(raw);

    if ((looksLikeHtml || res.status === 404) && route !== routeCandidates[routeCandidates.length - 1]) {
      continue;
    }

    return await readApiResponse<GenerationTask>(
      res,
      'The video generation task failed. Please try again or select another model.'
    );
  }

  return await readApiResponse<GenerationTask>(
    lastResponse as Response,
    'The KieGen Image-to-Video backend route is unavailable in the current AI Studio runtime.'
  );
}
