import { PromptOptions, GeneratedPromptItem } from '../types';

export class KieChatError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'KieChatError';
    this.statusCode = statusCode;
  }
}

async function uploadReferenceImageToKie(apiKey: string, dataUrl: string, fileName?: string): Promise<string> {
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(dataUrl)) {
    throw new KieChatError('Reference image must be a JPG, PNG, or WebP data URL.', 400);
  }

  const response = await fetch('https://kieai.redpandaai.co/api/file-base64-upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      base64Data: dataUrl,
      uploadPath: 'images/prompt-generator-reference',
      fileName: fileName || `reference-${Date.now()}.png`,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    const msg = data?.msg || data?.message || data?.error?.message || `Reference image upload failed (HTTP ${response.status}).`;
    if (response.status === 401 || response.status === 403) {
      throw new KieChatError('Invalid Kie.ai API Key', 401);
    }
    throw new KieChatError(msg, response.status || 502);
  }

  const url = data?.data?.downloadUrl || data?.data?.fileUrl || data?.data?.url;
  if (!url || typeof url !== 'string') {
    throw new KieChatError('Kie.ai did not return a usable reference image URL.', 502);
  }
  return url;
}

/**
 * Invokes the specified Chat Model (gpt-6-astra, gpt-5.6, or gpt-5.5)
 * through the Kie.ai API gateway to synthesize exactly 3 Text-to-Image prompts.
 *
 * Strict requirements:
 * - No silent fallback to other models.
 * - Explicit error reporting.
 * - Standalone prompt rule: No references to external images.
 * - Camera angle strictly locked.
 */
export async function invokeKieChatModel(
  apiKey: string,
  modelId: string,
  options: PromptOptions
): Promise<GeneratedPromptItem[]> {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 6) {
    throw new KieChatError('Invalid Kie.ai API Key', 401);
  }

  // UI IDs are stable aliases; these are the actual Kie.ai Responses API model IDs.
  // GPT-5.6 is represented by the flagship Sol tier.
  const modelMap: Record<string, { apiId: string; name: string }> = {
    'gpt-6-astra': { apiId: 'gpt-6-astra', name: 'GPT-6 Astra' },
    'gpt-5.6': { apiId: 'gpt-5-6-sol', name: 'GPT-5.6' },
    'gpt-5.5': { apiId: 'gpt-5-5', name: 'GPT-5.5' },
  };

  const selected = modelMap[modelId] || modelMap['gpt-5.5'];
  const cleanModelId = selected.apiId;
  const modelName = selected.name;

  let referenceImageUrl: string | undefined;
  if (options.referenceImageData) {
    if (options.referenceImageData.length > 15_000_000) {
      throw new KieChatError('Reference image is too large. Please use an image under 10MB.', 400);
    }
    referenceImageUrl = await uploadReferenceImageToKie(
      apiKey,
      options.referenceImageData,
      options.referenceImageName
    );
  }

  const systemPrompt = `You are an elite Japanese Zen Garden & Hydro-Aesthetic Visual Director specialized in crafting production-ready Text-to-Image prompts for advanced photorealistic diffusion models.

Your task is to generate EXACTLY 3 DISTINCT Text-to-Image prompts based on the user's category configuration.

MANDATORY ARCHITECTURAL RULES:
1. FIXED VS RANDOM / REFERENCE-AWARE ENFORCEMENT:
   - Any parameter that has a specific value (NOT "Random") MUST be strictly honored in all 3 prompts, including Background, Mood, Suasana, Dekorasi, Flower, Kategori, Basin, and Bamboo.
   - When a reference image is supplied, any parameter set to "Random" or left empty MUST NOT be treated as an unrelated random choice. First infer the most appropriate Mood, Suasana, Kategori, Background, Dekorasi, Flower, Basin, Bamboo characteristics, and other relevant visual attributes directly from the reference image.
   - Use the reference-derived interpretation as the visual baseline, then create 3 meaningfully different prompts that remain recognizably connected to that baseline.
   - When there is NO reference image, parameters set to "Random" MUST be creatively varied across each of the 3 prompts.

2. CAMERA ANGLE IS STRICTLY LOCKED:
   - In ALL 3 prompts, you MUST use the exact perspective:
     "Close environmental perspective, slightly above basin level, 3/4 front view, natural shallow depth of field"
   - Do NOT change the camera angle. Create dramatic visual variety through spatial composition, foreground/mid-ground/background layering, hydro-dynamics, lighting, and object placement.

3. ATMOSPHERE SEPARATION:
   - Treat "Suasana" as a distinct environmental/time/weather/illumination layer, separate from "Mood".
   - If Suasana is fixed, preserve it in all 3 prompts. If Random, vary it across the 3 prompts without changing fixed selections.
   - Do not let Mood override a fixed Suasana; combine them naturally.

4. STANDALONE PROMPT RULE:
   - NEVER use phrases like "reference image", "based on reference", "same as reference", "as shown in the reference", or "same composition as reference".
   - The prompts must be 100% self-contained and descriptive so any image generator can generate the image without conversation history.

5. REFERENCE IMAGE ANALYSIS — SIMILAR, NOT IDENTICAL:
   - When a reference image is supplied, analyze it before composing the prompts. Automatically understand and internally classify its Mood, Suasana, Kategori, Background character, Dekorasi, Flower/vegetation, Basin form/material, Bamboo characteristics, color relationships, lighting, materials, spatial relationships, water behavior, and other relevant visual elements.
   - If Mood, Suasana, or Kategori is Random/empty, derive those attributes from the reference image instead of inventing an unrelated direction. The same principle applies to other Random/empty visual controls when the reference clearly provides enough evidence.
   - The reference image is an aesthetic/visual guide only. Do NOT reproduce it literally. The 3 generated prompts MUST be similar in overall visual direction and recognizable visual DNA, but MUST NOT be identical copies.
   - Do not copy the exact composition, exact camera framing beyond the locked camera rule, exact object arrangement, exact decorative set, exact flower placement, exact background layout, exact lighting pattern, or other distinctive details one-to-one.
   - Create meaningful variation across the 3 prompts by changing secondary objects, spatial arrangement, background architecture, flower selection/placement, decorative details, water behavior, material nuances, and lighting while preserving the inferred visual identity of the reference.
   - Never mention the reference image, image analysis, inferred attributes, or reference-based reasoning inside the final prompts.

6. COMPOSITION & NARRATIVE DIVERSITY:
   - Each of the 3 prompts MUST feature a different compositional framework:
     * Prompt 1: Asymmetric Rule of Thirds anchor with crisp foreground tactile textures
     * Prompt 2: Centered contemplative balance with serene water reflections
     * Prompt 3: Dynamic diagonal hydro-flow or sheltered alcove depth
   - DO NOT use repetitive sentence structures or prompt templates. Write 3 rich, naturally flowing photographic descriptions.

7. HYDRO-AESTHETIC & MATERIAL FIDELITY:
   - Detail the basin's material (chiselled granite, weathered basalt, porous volcanic rock, glazed ceramic), form, and surface condition (water-smoothed rim, velvety moss, mineral streaks).
   - Detail the bamboo's characteristics (green bamboo, aged golden flume, node rings), position, and water dynamics (glassy laminar trickle, rhythmic droplets, gentle cascade).
   - Describe water clarity, surface ripples, floating blossoms/petals, and lighting (Kelvin color temperature, diffuse softbox, dusk glow, or dappled sunbeams).

OUTPUT FORMAT:
You MUST respond with a valid JSON object matching this schema with EXACTLY 3 prompts:
{
  "prompts": [
    {
      "index": 1,
      "title": "Prompt 01 — <Descriptive Theme / Subtitle>",
      "prompt": "<Full, highly descriptive standalone Text-to-Image prompt>",
      "sceneDetails": {
        "composition": "<e.g., Asymmetric Tactile Anchor (Rule of Thirds)>",
        "bambooPosition": "<Bamboo location and hydro-dynamics>",
        "basinDetails": "<Material, form, and surface condition>",
        "lightingAndAtmosphere": "<Lighting and atmospheric mood>",
        "focalPoint": "<Primary focal element description>"
      }
    },
    {
      "index": 2,
      "title": "Prompt 02 — <Descriptive Theme / Subtitle>",
      "prompt": "<Full, highly descriptive standalone Text-to-Image prompt>",
      "sceneDetails": {
        "composition": "<e.g., Centered Contemplative Balance>",
        "bambooPosition": "<Bamboo location and hydro-dynamics>",
        "basinDetails": "<Material, form, and surface condition>",
        "lightingAndAtmosphere": "<Lighting and atmospheric mood>",
        "focalPoint": "<Primary focal element description>"
      }
    },
    {
      "index": 3,
      "title": "Prompt 03 — <Descriptive Theme / Subtitle>",
      "prompt": "<Full, highly descriptive standalone Text-to-Image prompt>",
      "sceneDetails": {
        "composition": "<e.g., Dynamic Diagonal Hydro-Flow>",
        "bambooPosition": "<Bamboo location and hydro-dynamics>",
        "basinDetails": "<Material, form, and surface condition>",
        "lightingAndAtmosphere": "<Lighting and atmospheric mood>",
        "focalPoint": "<Primary focal element description>"
      }
    }
  ]
}`;

  const userPrompt = `Generate 3 distinct Text-to-Image prompts using the following configuration:
- Active Chat Model: ${modelName} (ID: ${cleanModelId})
- Background: ${options.background}
- Mood: ${options.mood}
- Suasana: ${options.suasana || 'Random'}
- Kategori: ${options.kategori}
- Dekorasi: ${options.dekorasi}
- Flower: ${options.flower}
- Basin: ${options.basin}
- Bamboo: ${options.bamboo || 'Random'}
- Camera Angle: Locked: Close environmental perspective, slightly above basin level, 3/4 front view, natural shallow depth of field
- Reference Image: ${options.referenceImageData ? 'Provided separately as visual guidance for similarity-with-variation analysis.' : 'None'}

Requirements:
- Preserve all fixed selections strictly.
- If a reference image is provided, analyze it first. For every Random/empty control, especially Mood, Suasana, and Kategori, derive the most appropriate value or visual direction from the image before generating the prompts.
- Do not let Random controls produce an unrelated scene when a reference image supplies clear visual evidence.
- Generate exactly 3 prompts that are similar to the reference's visual DNA but not identical copies. Vary composition details, secondary elements, decorative details, flower placement, water behavior, and lighting while maintaining the core visual identity.
- If no reference image is provided, Random controls may be freely and creatively varied across the 3 prompts.
- Ensure all 3 prompts are standalone without reference image phrases.
- Return ONLY valid JSON with exactly 3 prompts in the "prompts" array.`;

  // Kie.ai OpenAI-compatible chat models use the unified Responses API.
  // Do not use /v1/chat/completions here: that route does not accept these model IDs.
  const endpoint = 'https://api.kie.ai/codex/v1/responses';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: cleanModelId,
        stream: false,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
              ...(referenceImageUrl ? [{ type: 'input_image', image_url: referenceImageUrl }] : []),
            ],
          },
        ],
        reasoning: { effort: 'high' },
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new KieChatError('Invalid Kie.ai API Key', 401);
    }

    if (response.status === 402) {
      throw new KieChatError('Insufficient Kie.ai Credits', 402);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const rawText = data ? JSON.stringify(data) : '';
      const lowerText = rawText.toLowerCase();
      if (lowerText.includes('insufficient') || lowerText.includes('credit')) {
        throw new KieChatError('Insufficient Kie.ai Credits', 402);
      }
      if (lowerText.includes('invalid') && (lowerText.includes('key') || lowerText.includes('token') || lowerText.includes('auth'))) {
        throw new KieChatError('Invalid Kie.ai API Key', 401);
      }
      const msg = data?.error?.message || data?.message || data?.msg || `HTTP ${response.status}`;
      throw new KieChatError(`Chat Model (${modelName}) error: ${msg}`, response.status);
    }

    if (!data) {
      throw new KieChatError(`Chat Model (${modelName}) returned an empty response.`, 502);
    }

    const rawContent = extractResponsesApiText(data);
    if (!rawContent) {
      throw new KieChatError(`Chat Model (${modelName}) returned no generated content.`, 502);
    }

    const parsedItems = parseChatModelPrompts(rawContent, modelName, options);
    if (parsedItems.length < 3) {
      throw new KieChatError(`Chat Model (${modelName}) returned only ${parsedItems.length} of 3 prompts. Please try generating again.`, 502);
    }

    return parsedItems.slice(0, 3);
  } catch (err: any) {
    if (err instanceof KieChatError) throw err;
    throw new KieChatError(
      err?.message || `Unable to reach Chat Model (${modelName}) via Kie.ai.`,
      500
    );
  }
}

/** Extract text from Kie.ai's Responses API output format. */
function extractResponsesApiText(data: any): string {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const parts: string[] = [];
  for (const item of output) {
    if (!Array.isArray(item?.content)) continue;
    for (const content of item.content) {
      if (typeof content?.text === 'string' && content.text.trim()) {
        parts.push(content.text);
      }
    }
  }
  return parts.join('\n').trim();
}

/**
 * Robust parser extracting exactly 3 prompts from Chat Model output.
 * Handles pure JSON, markdown-wrapped JSON, or structured text blocks.
 */
function parseChatModelPrompts(
  content: string,
  modelName: string,
  options: PromptOptions
): GeneratedPromptItem[] {
  const cleanContent = content.trim();

  // 1. Try extracting JSON
  let jsonString = cleanContent;
  const jsonMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    jsonString = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonString);
    const rawList = Array.isArray(parsed) ? parsed : parsed.prompts;

    if (Array.isArray(rawList) && rawList.length >= 3) {
      return rawList.slice(0, 3).map((item: any, idx: number) => {
        const index = idx + 1;
        const promptText = String(item.prompt || item.text || item.description || '').trim();
        return {
          id: `prompt_${Date.now()}_${index}`,
          index,
          title: item.title || `Prompt 0${index} — ${modelName}`,
          prompt: promptText,
          chatModelUsed: modelName,
          sceneDetails: {
            composition: item.sceneDetails?.composition || (index === 1 ? 'Asymmetric Tactile Anchor' : index === 2 ? 'Centered Contemplative Balance' : 'Dynamic Diagonal Hydro-Flow'),
            bambooPosition: item.sceneDetails?.bambooPosition || options.bamboo || 'Organic Placement',
            basinDetails: item.sceneDetails?.basinDetails || options.basin || 'Hand-carved Stone Basin',
            lightingAndAtmosphere: item.sceneDetails?.lightingAndAtmosphere || options.mood || 'Ambient Lighting',
            focalPoint: item.sceneDetails?.focalPoint || 'Water cascade and floating petals',
          },
          timestamp: Date.now(),
        };
      });
    }
  } catch {
    // Fall back to regex block parsing
  }

  // 2. Regex block parser for PROMPT 1 / PROMPT 2 / PROMPT 3
  const results: GeneratedPromptItem[] = [];
  const promptRegex = /(?:PROMPT\s*(?:0?[1-3]|\bI{1,3}\b)[:\s\-\*#]+)([\s\S]*?)(?=(?:PROMPT\s*(?:0?[1-3]|\bI{1,3}\b)[:\s\-\*#]+)|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = promptRegex.exec(cleanContent)) !== null) {
    const block = match[1].trim();
    if (block.length > 30) {
      const idx = results.length + 1;
      // Strip scene detail labels if mixed in prompt
      const promptOnly = block
        .replace(/Title:.*$/im, '')
        .replace(/Scene Details:[\s\S]*$/im, '')
        .trim();

      results.push({
        id: `prompt_${Date.now()}_${idx}`,
        index: idx,
        title: `Prompt 0${idx} — ${modelName}`,
        prompt: promptOnly || block,
        chatModelUsed: modelName,
        sceneDetails: {
          composition: idx === 1 ? 'Asymmetric Tactile Anchor' : idx === 2 ? 'Centered Contemplative Balance' : 'Dynamic Diagonal Hydro-Flow',
          bambooPosition: options.bamboo || 'Natural Bamboo Conduit',
          basinDetails: options.basin || 'Hand-carved Stone Basin',
          lightingAndAtmosphere: options.mood || 'Soft Ambient Lighting',
          focalPoint: 'Water surface reflections and natural petals',
        },
        timestamp: Date.now(),
      });
    }
  }

  return results;
}
