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

2. CAMERA DISTANCE & FRAMING CONTROL:
   - The Camera Distance controls CAMERA DISTANCE / FRAMING ONLY (distance to subject, subject scale within the frame, and visible environment).
   - It does NOT represent camera direction, camera height, camera rotation, or camera tilt.
   - Available options: Random, Extreme Close-Up, Close-Up, Medium Close-Up, Medium Shot, Medium Wide Shot, Wide Shot, Very Wide Shot.

   A. WITHOUT REFERENCE IMAGE:
      - Use the selected Camera Distance from the configuration.
      - The selected Camera Distance determines how close or far the camera is from the main visual subject (water basin / hydro feature) and how much surrounding environment is visible.
      - Strictly follow the selected Camera Distance. Do not reinterpret Camera Distance as camera direction or tilt.
      - If a specific distance is selected (e.g., "Close-Up", "Wide Shot"), ALL 3 prompts must strictly follow that distance.
      - If "Random" is selected, choose an appropriate Camera Distance for each generated prompt (each prompt may use a different appropriate distance, remaining visually fitting for the scene).

   B. WITH REFERENCE IMAGE (HIGHEST PRIORITY):
      - The user's Reference Image is the PRIMARY SOURCE for Camera Distance and Framing.
      - Analyze the actual visual distance between the camera and the main subject in the Reference Image.
      - Analyze the subject's apparent size within the frame.
      - Analyze how much surrounding environment is visible.
      - Analyze the overall framing scale and spatial relationship between the subject and frame.
      - Determine the closest appropriate Camera Distance category based on the Reference Image (Extreme Close-Up, Close-Up, Medium Close-Up, Medium Shot, Medium Wide Shot, Wide Shot, or Very Wide Shot).
      - Follow the Reference Image's Camera Distance and Framing in ALL 3 generated prompts.
      - The Camera Distance menu must NOT override the Reference Image.
        REFERENCE IMAGE PRIORITY:
        REFERENCE IMAGE CAMERA DISTANCE / FRAMING > CAMERA DISTANCE MENU
      - Do NOT randomly change the Camera Distance.
      - Do NOT create different Camera Distances between the generated prompts. All 3 prompts MUST maintain the uniform Camera Distance and framing scale observed in the Reference Image.

   C. REFERENCE IMAGE DOES NOT MEAN EXACT COPYING:
      - Preserve the Camera Distance and framing relationship.
      - Preserve the approximate subject scale within the frame.
      - Preserve the approximate amount of environment visible.
      - Preserve the overall spatial depth and framing structure.
      - Do NOT copy the exact scene.
      - Do NOT duplicate the exact objects or object arrangement.
      - Do NOT reproduce the exact environment.
      - Create a new but visually related scene based on the user's selected parameters.

3. BASIN SHAPE CONTROL (GEOMETRIC SILHOUETTE ENFORCEMENT):
   - The Basin Shape menu controls the ACTUAL GEOMETRIC SILHOUETTE of the water basin.
   - Available Basin Shape options:
     * Perfect Round
     * Perfect Oval
     * Heart / Love
     * Five-Point Star
     * Six-Point Star
     * Flower
     * Leaf
     * Crescent
     * Hexagonal
     * Square
     * Rectangular
     * Four-Lobed
     * Organic Freeform
     * Random

   A. STRICT SHAPE COMPLIANCE:
      - When the user selects a specific Basin Shape:
        * Strictly preserve the selected basin silhouette.
        * The basin must visibly and clearly match the selected shape.
        * Do NOT automatically convert the selected shape into a generic round basin.
        * Do NOT use a circular basin when another shape is explicitly selected.
        * The selected shape applies to the basin's overall outer silhouette, not merely to decorative details or carvings.

   B. SPECIFIC SHAPE ARCHITECTURAL DIRECTIVES:
      - Perfect Round: The basin must have a clearly circular silhouette. Maintain a symmetrical round shape. Do not make it oval, irregular, asymmetrical, or organically distorted.
      - Perfect Oval: The basin must have a clearly elliptical/oval silhouette with visibly different long and short axes. Do not reinterpret the oval as a circle. Maintain a smooth, symmetrical oval perimeter.
      - Heart / Love: The basin must have a recognizable heart-shaped outer silhouette. The two upper lobes and central indentation must be clearly visible. Do NOT use a circular basin with a heart decoration inside it. The heart shape MUST define the actual basin body.
      - Star Shapes (Five-Point Star or Six-Point Star): The basin's outer silhouette clearly forms the selected number of star points as part of the actual basin perimeter. Do not place a star decoration inside a round basin. Do not replace the selected star shape with a circular basin.
      - Other Shapes (Flower, Leaf, Crescent, Hexagonal, Square, Rectangular, Four-Lobed, Organic Freeform): The selected shape must define the actual outer basin silhouette. Preserve the recognizable geometry of the selected shape. Decorative elements must not replace or obscure the primary basin shape.
      - Random: Choose a basin shape from the available shape library. Do NOT repeatedly default to Perfect Round. Produce meaningful shape variation across generated prompts. Each selected shape must remain clearly recognizable.

   C. REFERENCE IMAGE:
      - If a Reference Image is provided:
        * Analyze the visible basin shape in the reference image.
        * Preserve the basin's recognizable silhouette when the user has NOT explicitly selected another Basin Shape.
        * If the user EXPLICITLY selects a Basin Shape, the user's selected Basin Shape takes priority over the reference basin shape.
        * Do not copy the exact basin design or decorative details from the reference; preserve only the relevant structural characteristics.

   D. THREE PROMPTS CONSISTENCY:
      - When generating 3 prompts:
        * If a specific Basin Shape is selected (or derived from the reference image when Random), ALL 3 prompts MUST use that same Basin Shape.
        * Do NOT change the basin shape between prompts merely to create variation. Variation must come from materials, textures, water appearance, decorations, flowers, bamboo details, lighting, and environment.
        * If Random is selected WITHOUT a reference image, different basin shapes may be used across the 3 prompts.

   E. SHAPE PRIORITY (STRICT ORDER):
      EXPLICIT USER BASIN SHAPE > REFERENCE IMAGE BASIN SHAPE > RANDOM BASIN SHAPE
      Never override an explicit Basin Shape selection with a generic round basin.

4. ATMOSPHERE SEPARATION:
   - Treat "Suasana" as a distinct environmental/time/weather/illumination layer, separate from "Mood".
   - If Suasana is fixed, preserve it in all 3 prompts. If Random, vary it across the 3 prompts without changing fixed selections.
   - Do not let Mood override a fixed Suasana; combine them naturally.

5. STANDALONE PROMPT RULE:
   - NEVER use phrases like "reference image", "based on reference", "same as reference", "as shown in the reference", or "same composition as reference".
   - The prompts must be 100% self-contained and descriptive so any image generator can generate the image without conversation history.

6. REFERENCE IMAGE ANALYSIS — SIMILAR, NOT IDENTICAL:
   - When a reference image is supplied, analyze it before composing the prompts. Automatically understand and internally classify its Mood, Suasana, Kategori, Background character, Dekorasi, Flower/vegetation, Basin form/material/shape, Bamboo characteristics, color relationships, lighting, materials, spatial relationships, water behavior, and other relevant visual elements.
   - If Mood, Suasana, Kategori, or Basin Shape is Random/empty, derive those attributes from the reference image instead of inventing an unrelated direction. The same principle applies to other Random/empty visual controls when the reference clearly provides enough evidence.
   - The reference image is an aesthetic/visual guide only. Do NOT reproduce it literally. The 3 generated prompts MUST be similar in overall visual direction and recognizable visual DNA, but MUST NOT be identical copies.
   - Do not copy the exact composition, exact camera framing beyond the locked camera rule, exact object arrangement, exact decorative set, exact flower placement, exact background layout, exact lighting pattern, or other distinctive details one-to-one.
   - Create meaningful variation across the 3 prompts by changing secondary objects, spatial arrangement, background architecture, flower selection/placement, decorative details, water behavior, material nuances, and lighting while preserving the inferred visual identity of the reference.
   - Never mention the reference image, image analysis, inferred attributes, or reference-based reasoning inside the final prompts.

7. COMPOSITION & NARRATIVE DIVERSITY:
   - Each of the 3 prompts MUST feature a different compositional framework:
     * Prompt 1: Asymmetric Rule of Thirds anchor with crisp foreground tactile textures
     * Prompt 2: Centered contemplative balance with serene water reflections
     * Prompt 3: Dynamic diagonal hydro-flow or sheltered alcove depth
   - DO NOT use repetitive sentence structures or prompt templates. Write 3 rich, naturally flowing photographic descriptions.

8. HYDRO-AESTHETIC & MATERIAL FIDELITY:
   - Detail the basin's material (chiselled granite, weathered basalt, porous volcanic rock, glazed ceramic), silhouette shape, and surface condition (water-smoothed rim, velvety moss, mineral streaks).
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
        "basinShape": "<e.g., Heart / Love, Five-Point Star, Perfect Oval, Hexagonal, etc.>",
        "lightingAndAtmosphere": "<Lighting and atmospheric mood>",
        "focalPoint": "<Primary focal element description>",
        "cameraDistance": "<e.g., Extreme Close-Up, Close-Up, Medium Close-Up, Medium Shot, Medium Wide Shot, Wide Shot, or Very Wide Shot>"
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
        "basinShape": "<e.g., Heart / Love, Five-Point Star, Perfect Oval, Hexagonal, etc.>",
        "lightingAndAtmosphere": "<Lighting and atmospheric mood>",
        "focalPoint": "<Primary focal element description>",
        "cameraDistance": "<e.g., Extreme Close-Up, Close-Up, Medium Close-Up, Medium Shot, Medium Wide Shot, Wide Shot, or Very Wide Shot>"
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
        "basinShape": "<e.g., Heart / Love, Five-Point Star, Perfect Oval, Hexagonal, etc.>",
        "lightingAndAtmosphere": "<Lighting and atmospheric mood>",
        "focalPoint": "<Primary focal element description>",
        "cameraDistance": "<e.g., Extreme Close-Up, Close-Up, Medium Close-Up, Medium Shot, Medium Wide Shot, Wide Shot, or Very Wide Shot>"
      }
    }
  ]
}`;

  const cameraDistSelection = options.cameraDistance || options.cameraAngle || 'Random';
  const userPrompt = `Generate 3 distinct Text-to-Image prompts using the following configuration:
- Active Chat Model: ${modelName} (ID: ${cleanModelId})
- Background: ${options.background}
- Mood: ${options.mood}
- Suasana: ${options.suasana || 'Random'}
- Kategori: ${options.kategori}
- Dekorasi: ${options.dekorasi}
- Flower: ${options.flower}
- Basin Material/Style: ${options.basin}
- Basin Shape: ${options.basinShape || 'Random'} (Controls actual outer geometric silhouette of water basin. STRICT PRIORITY: Explicit User Basin Shape > Reference Image Basin Shape > Random Basin Shape. Never default to a round basin if another shape is chosen.)
- Bamboo: ${options.bamboo || 'Random'}
- Camera Distance / Framing: ${cameraDistSelection} (Controls subject distance & framing scale only, NOT camera angle/tilt)
- Reference Image: ${options.referenceImageData ? 'Provided separately as primary source for Camera Distance & Framing, and visual guidance.' : 'None'}

Requirements:
- Preserve all fixed selections strictly.
- BASIN SHAPE PRIORITY & ENFORCEMENT:
  * If a specific Basin Shape is chosen (e.g. Heart / Love, Five-Point Star, Perfect Oval, Leaf, Hexagonal, etc.), ALL 3 prompts must strictly feature that exact geometric silhouette. The basin vessel body itself must form that shape. Do NOT convert into a generic circular basin.
  * If Basin Shape is "Random" and a Reference Image is provided, infer the basin shape from the reference image and keep it consistent across all 3 prompts.
  * If Basin Shape is "Random" and NO Reference Image is provided, use different recognizable shapes across the prompts without repeatedly defaulting to Perfect Round.
- CAMERA DISTANCE & FRAMING PRIORITY:
  * When a Reference Image is provided, it is the PRIMARY SOURCE for Camera Distance and Framing (Reference Image Camera Distance / Framing > Camera Distance Menu). Analyze the distance between camera and main subject and apparent subject scale in the reference image. All 3 prompts MUST follow that uniform Camera Distance and framing scale without variation.
  * When no Reference Image is provided, strictly follow the selected Camera Distance (or vary appropriately if "Random").
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
            basinShape: item.sceneDetails?.basinShape || (options.basinShape && options.basinShape !== 'Random' ? options.basinShape : 'Sculpted Silhouette'),
            lightingAndAtmosphere: item.sceneDetails?.lightingAndAtmosphere || options.mood || 'Ambient Lighting',
            focalPoint: item.sceneDetails?.focalPoint || 'Water cascade and floating petals',
            cameraDistance: item.sceneDetails?.cameraDistance || options.cameraDistance || options.cameraAngle || 'Medium Shot',
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
          basinShape: options.basinShape && options.basinShape !== 'Random' ? options.basinShape : 'Sculpted Silhouette',
          lightingAndAtmosphere: options.mood || 'Soft Ambient Lighting',
          focalPoint: 'Water surface reflections and natural petals',
          cameraDistance: options.cameraDistance || options.cameraAngle || 'Medium Shot',
        },
        timestamp: Date.now(),
      });
    }
  }

  return results;
}
