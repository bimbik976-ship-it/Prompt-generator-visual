import {
  PromptOptions,
  GeneratedPromptItem,
} from '../types';
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

    // 7. Resolve Basin (Multi-dimensional 3-level system)
    let basinMaterial: string;
    let basinForm: string;
    let basinSurface: string;

    if (options.basin && options.basin !== 'Random') {
      // User specified fixed basin in UI (e.g., 'Hand-carved Granite Chōzubachi')
      basinMaterial = options.basin.toLowerCase();
      basinForm = pickRandomString(BASIN_INTERNAL_FORMS, batchUsedBasinForms, 'basinForm');
      basinSurface = pickRandomString(BASIN_INTERNAL_SURFACES, batchUsedBasinSurfaces);
    } else {
      // Random basin: draw from expansive multi-dimensional pool
      basinMaterial = pickRandomString(BASIN_INTERNAL_MATERIALS, batchUsedBasinMaterials, 'basinMaterial');
      basinForm = pickRandomString(BASIN_INTERNAL_FORMS, batchUsedBasinForms, 'basinForm');
      basinSurface = pickRandomString(BASIN_INTERNAL_SURFACES, batchUsedBasinSurfaces);
    }

    const basinDescription = `${basinForm} crafted from ${basinMaterial}, characterized by a ${basinSurface}. Prioritize the specified silhouette; do not automatically reinterpret it as a round, circular, or cylindrical basin.`;

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

    results.push({
      id: promptId,
      index: i + 1,
      title: `Prompt 0${i + 1} — ${bambooVariation.title} & ${basinForm}`,
      prompt: standalonePrompt,
      sceneDetails: {
        composition: composition.name,
        bambooPosition: bambooVariation.positionAndPlacement,
        basinDetails: `${basinMaterial} | ${basinForm} | ${basinSurface}`,
        lightingAndAtmosphere: `${moodVariation.title} with ${moodVariation.lightingDirective}`,
        focalPoint: composition.focalPointDetail,
      },
      timestamp: Date.now(),
    });
  }

  return results;
}
