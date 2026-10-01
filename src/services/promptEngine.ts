import {
  PromptOptions,
  GeneratedPromptItem,
} from '../types';
import {
  BASIN_SHAPE_OPTIONS,
  BASIN_SHAPE_DESCRIPTIONS,
} from '../data/promptOptions';
import {
  INTERNAL_BACKGROUND_POOL,
  INTERNAL_MOOD_POOL,
  INTERNAL_KATEGORI_POOL,
  INTERNAL_DEKORASI_POOL,
  INTERNAL_FLOWER_POOL,
  BASIN_INTERNAL_MATERIALS,
  BASIN_INTERNAL_FORMS,
  BASIN_INTERNAL_SURFACES,
  INTERNAL_BAMBOO_POOL,
  COMPOSITION_FRAMEWORKS,
  DIVERSE_SENTENCE_ARCHITECTURES,
  BackgroundVariation,
  MoodVariation,
  KategoriVariation,
  DekorasiVariation,
  FlowerVariation,
  BambooVariationDetail,
  CompositionFramework,
} from '../data/internalVariations';

// Session history memory tracking signatures of generated scenes to prevent repetitive combinations
interface GenerationSignature {
  backgroundId: string;
  moodId: string;
  kategoriId: string;
  basinMaterial: string;
  basinForm: string;
  bambooId: string;
  compositionId: string;
  flowerId: string;
}

const sessionHistory: GenerationSignature[] = [];
const promptTextHistory: Set<string> = new Set();

/**
 * Filter pool based on user selection.
 * If user selected 'Random', return the whole pool.
 * If user selected a specific UI category, match items with that uiCategory.
 * If none match directly, find closest match or fallback to items.
 */
function resolveSubPool<T extends { uiCategory: string }>(
  pool: T[],
  userChoice: string
): T[] {
  if (!userChoice || userChoice === 'Random') {
    return pool;
  }
  const filtered = pool.filter(
    item => item.uiCategory.toLowerCase() === userChoice.toLowerCase()
  );
  return filtered.length > 0 ? filtered : pool;
}

/**
 * Intelligent weighted random picker that penalizes recently used items in sessionHistory
 */
function pickDiverse<T extends { id: string }>(
  items: T[],
  usedInCurrentBatch: string[],
  historyField?: keyof GenerationSignature
): T {
  // Exclude items already chosen in this generation batch of 3
  let candidatePool = items.filter(item => !usedInCurrentBatch.includes(item.id));
  if (candidatePool.length === 0) {
    candidatePool = items;
  }

  // If we have history for this field, prefer items not used in recent session history
  if (historyField && sessionHistory.length > 0 && candidatePool.length > 1) {
    const recentHistoryValues = sessionHistory.slice(-9).map(h => h[historyField]);
    const fresherCandidates = candidatePool.filter(item => !recentHistoryValues.includes(item.id));
    if (fresherCandidates.length > 0) {
      candidatePool = fresherCandidates;
    }
  }

  const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];
  usedInCurrentBatch.push(selected.id);
  return selected;
}

function pickRandomString(
  pool: string[],
  usedInBatch: string[],
  historyKey?: keyof GenerationSignature
): string {
  let candidates = pool.filter(p => !usedInBatch.includes(p));
  if (candidates.length === 0) candidates = pool;

  if (historyKey && sessionHistory.length > 0 && candidates.length > 1) {
    const recentVals = sessionHistory.slice(-9).map(h => h[historyKey]);
    const fresh = candidates.filter(c => !recentVals.includes(c));
    if (fresh.length > 0) candidates = fresh;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  usedInBatch.push(chosen);
  return chosen;
}

export function generateThreePrompts(options: PromptOptions): GeneratedPromptItem[] {
  const results: GeneratedPromptItem[] = [];

  // Batch-level collision avoidance tracking
  const batchUsedBackgroundIds: string[] = [];
  const batchUsedMoodIds: string[] = [];
  const batchUsedSuasana: string[] = [];
  const batchUsedKategoriIds: string[] = [];
  const batchUsedDekorasiIds: string[] = [];
  const batchUsedFlowerIds: string[] = [];
  const batchUsedBambooIds: string[] = [];
  const batchUsedCompositionIds: string[] = [];
  const batchUsedBasinMaterials: string[] = [];
  const batchUsedBasinForms: string[] = [];
  const batchUsedBasinSurfaces: string[] = [];

  // Shuffled compositions array for guaranteed compositional diversity across the 3 prompts
  const shuffledCompositions = [...COMPOSITION_FRAMEWORKS].sort(() => Math.random() - 0.5);

  // Camera Distance / Framing resolution adhering to Reference Image priority
  const selectedCameraDist = options.cameraDistance || options.cameraAngle || 'Random';
  const hasRefImage = Boolean(options.referenceImageData);
  const validDistances = [
    'Extreme Close-Up',
    'Close-Up',
    'Medium Close-Up',
    'Medium Shot',
    'Medium Wide Shot',
    'Wide Shot',
    'Very Wide Shot',
  ];

  let resolvedCameraDistances: string[] = [];
  if (hasRefImage) {
    // When Reference Image is provided:
    // 1. Reference Image is the PRIMARY SOURCE for Camera Distance and Framing.
    // 2. Camera Distance menu must NOT override the Reference Image.
    // 3. All 3 prompts MUST use the uniform Camera Distance and framing scale observed in the Reference Image.
    const inferredRefDistance = 'Medium Close-Up';
    resolvedCameraDistances = [inferredRefDistance, inferredRefDistance, inferredRefDistance];
  } else if (selectedCameraDist && selectedCameraDist !== 'Random' && validDistances.includes(selectedCameraDist)) {
    // Without Reference Image with specific Camera Distance: all 3 follow the selected distance
    resolvedCameraDistances = [selectedCameraDist, selectedCameraDist, selectedCameraDist];
  } else {
    // Without Reference Image with 'Random': each prompt may use a distinct appropriate distance
    const variedOptions = ['Close-Up', 'Medium Close-Up', 'Medium Shot', 'Medium Wide Shot'];
    const shuffled = [...variedOptions].sort(() => Math.random() - 0.5);
    resolvedCameraDistances = [shuffled[0], shuffled[1], shuffled[2]];
  }

  // Basin Shape resolution adhering to Shape Priority:
  // EXPLICIT USER BASIN SHAPE > REFERENCE IMAGE BASIN SHAPE > RANDOM BASIN SHAPE
  // Never override an explicit Basin Shape selection with a generic round basin.
  const allShapes = BASIN_SHAPE_OPTIONS.filter((s) => s !== 'Random');
  const selectedBasinShape = options.basinShape || 'Random';
  const isExplicitShape = selectedBasinShape !== 'Random' && allShapes.includes(selectedBasinShape as any);

  let resolvedBasinShapes: string[] = [];
  if (isExplicitShape) {
    // 1. Explicit user selection: strictly preserve selected shape in ALL 3 prompts
    resolvedBasinShapes = [selectedBasinShape, selectedBasinShape, selectedBasinShape];
  } else if (hasRefImage) {
    // 2. Reference image basin shape: preserve structural silhouette across all 3 prompts
    const inferredRefShape = 'Organic Freeform';
    resolvedBasinShapes = [inferredRefShape, inferredRefShape, inferredRefShape];
  } else {
    // 3. Random basin shape: meaningful shape variation across prompts without repeatedly defaulting to round
    const nonRoundShapes = allShapes.filter((s) => s !== 'Perfect Round');
    const shuffledNonRound = [...nonRoundShapes].sort(() => Math.random() - 0.5);
    resolvedBasinShapes = [
      shuffledNonRound[0],
      shuffledNonRound[1],
      Math.random() < 0.2 ? 'Perfect Round' : shuffledNonRound[2],
    ];
  }

  for (let i = 0; i < 3; i++) {
    const promptId = `prompt_${Date.now()}_${i + 1}`;

    // 1. Resolve Background
    const backgroundPool = resolveSubPool(INTERNAL_BACKGROUND_POOL, options.background);
    const bgVariation: BackgroundVariation = pickDiverse(
      backgroundPool,
      batchUsedBackgroundIds,
      'backgroundId'
    );

    // 2. Resolve Mood
    const moodPool = resolveSubPool(INTERNAL_MOOD_POOL, options.mood);
    const moodVariation: MoodVariation = pickDiverse(
      moodPool,
      batchUsedMoodIds,
      'moodId'
    );

    // 3. Resolve Suasana as an independent environmental layer
    const suasanaPool = [
      'Morning', 'Late Morning', 'Afternoon', 'Golden Hour', 'Sunset', 'Blue Hour',
      'Twilight', 'Moonlight', 'Deep Night', 'Rainy', 'After Rain', 'Misty',
      'Dewy Freshness', 'Candlelit', 'Lanternlit', 'Dreamlike', 'Magical', 'Quiet Overcast'
    ];
    const selectedSuasana = options.suasana && options.suasana !== 'Random'
      ? options.suasana
      : pickRandomString(suasanaPool, batchUsedSuasana);

    // 4. Resolve Kategori
    const kategoriPool = resolveSubPool(INTERNAL_KATEGORI_POOL, options.kategori);
    const kategoriVariation: KategoriVariation = pickDiverse(
      kategoriPool,
      batchUsedKategoriIds,
      'kategoriId'
    );

    // 5. Resolve Dekorasi (harmonized with mood & kategori)
    let dekorasiPool = resolveSubPool(INTERNAL_DEKORASI_POOL, options.dekorasi);
    // If night/twilight and dekorasi is Random, prefer illumination elements (lanterns, candles)
    if (options.dekorasi === 'Random' && (options.mood.toLowerCase().includes('twilight') || options.mood.toLowerCase().includes('moonlit') || options.mood.toLowerCase().includes('nocturnal'))) {
      const glowingDekorasi = dekorasiPool.filter(d => d.primaryElements.toLowerCase().includes('lantern') || d.primaryElements.toLowerCase().includes('candle') || d.primaryElements.toLowerCase().includes('lamp'));
      if (glowingDekorasi.length > 0) {
        dekorasiPool = glowingDekorasi;
      }
    }
    const dekorasiVariation: DekorasiVariation = pickDiverse(
      dekorasiPool,
      batchUsedDekorasiIds
    );

    // 6. Resolve Flower
    const flowerPool = resolveSubPool(INTERNAL_FLOWER_POOL, options.flower);
    const flowerVariation: FlowerVariation = pickDiverse(
      flowerPool,
      batchUsedFlowerIds,
      'flowerId'
    );

    // 7. Resolve Basin (Multi-dimensional 3-level system with geometric silhouette enforcement)
    const currentBasinShape = resolvedBasinShapes[i] || 'Organic Freeform';
    const shapeDescription = BASIN_SHAPE_DESCRIPTIONS[currentBasinShape] || `${currentBasinShape} shaped water basin`;

    let basinMaterial: string;
    let basinSurface: string;

    if (options.basin && options.basin !== 'Random') {
      // User specified fixed basin material/style in UI
      basinMaterial = options.basin.toLowerCase();
      basinSurface = pickRandomString(BASIN_INTERNAL_SURFACES, batchUsedBasinSurfaces);
    } else {
      // Random basin material: draw from expansive multi-dimensional pool
      basinMaterial = pickRandomString(BASIN_INTERNAL_MATERIALS, batchUsedBasinMaterials, 'basinMaterial');
      basinSurface = pickRandomString(BASIN_INTERNAL_SURFACES, batchUsedBasinSurfaces);
    }

    const basinForm = currentBasinShape;
    const basinDescription = `a ${shapeDescription} masterfully crafted from ${basinMaterial}, accented with a ${basinSurface}. The outer geometric silhouette visibly matches the exact ${currentBasinShape} profile as the actual basin vessel body (never replace the selected silhouette with a generic round basin).`;

    // 8. Resolve Bamboo
    const bambooPool = resolveSubPool(INTERNAL_BAMBOO_POOL, options.bamboo || 'Random');
    const bambooVariation: BambooVariationDetail = pickDiverse(
      bambooPool,
      batchUsedBambooIds,
      'bambooId'
    );
    const bambooDescription = `${bambooVariation.architecture} with ${bambooVariation.stalkCharacteristics}, ${bambooVariation.positionAndPlacement}, ${bambooVariation.waterDynamics}`;

    // 9. Resolve Composition (Guaranteed different framework for each prompt)
    const composition: CompositionFramework = pickDiverse(
      shuffledCompositions,
      batchUsedCompositionIds,
      'compositionId'
    );

    // 10. Flower Description
    const flowerDescription = `A fresh, pristine ${flowerVariation.speciesScientific} (${flowerVariation.title.toLowerCase()}) is ${flowerVariation.bloomState} with ${flowerVariation.colorAndPetals}, ${flowerVariation.spatialPlacement}. ${flowerVariation.relationshipToWaterAndStone}`;

    // 11. Dekorasi Description
    const dekorasiDescription = `${dekorasiVariation.primaryElements}, ${dekorasiVariation.placementHarmony}. ${dekorasiVariation.lightingRole}`;

    // 12. Narrative Structure Architecture (Avoid repetitive template openings)
    const sentenceArchitecture = DIVERSE_SENTENCE_ARCHITECTURES[i % DIVERSE_SENTENCE_ARCHITECTURES.length];

    const standalonePrompt = sentenceArchitecture.render({
      kategori: kategoriVariation.title,
      background: `${bgVariation.environmentStructure} (${bgVariation.spatialDepth}, ${bgVariation.terrainAndSurfaces})`,
      mood: `${moodVariation.title} (${moodVariation.atmosphericNuance})`,
      suasana: selectedSuasana,
      basinDescription,
      bambooDescription,
      flowerDescription,
      dekorasiDescription,
      composition,
      lighting: `${moodVariation.lightingDirective}. ${moodVariation.specularAndReflection}.`,
      specular: moodVariation.specularAndReflection,
    });

    // Record in history
    promptTextHistory.add(standalonePrompt);
    sessionHistory.push({
      backgroundId: bgVariation.id,
      moodId: moodVariation.id,
      kategoriId: kategoriVariation.id,
      basinMaterial,
      basinForm,
      bambooId: bambooVariation.id,
      compositionId: composition.id,
      flowerId: flowerVariation.id,
    });

    const currentCameraDist = resolvedCameraDistances[i] || 'Medium Shot';

    results.push({
      id: promptId,
      index: i + 1,
      title: `Prompt 0${i + 1} — ${currentBasinShape} Basin & ${bambooVariation.title}`,
      prompt: standalonePrompt,
      sceneDetails: {
        composition: composition.name,
        bambooPosition: bambooVariation.positionAndPlacement,
        basinDetails: `${basinMaterial} | ${currentBasinShape} | ${basinSurface}`,
        basinShape: currentBasinShape,
        lightingAndAtmosphere: `${moodVariation.title} with ${moodVariation.lightingDirective}`,
        focalPoint: composition.focalPointDetail,
        cameraDistance: currentCameraDist,
      },
      timestamp: Date.now(),
    });
  }

  return results;
}
