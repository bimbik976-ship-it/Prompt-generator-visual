/**
 * Comprehensive Internal Creative Variation System
 * 
 * Large internal option pool for:
 * 1. Background
 * 2. Mood
 * 3. Kategori
 * 4. Dekorasi
 * 5. Flower
 * 6. Basin (Multi-dimensional 3-level)
 * 7. Bamboo
 * 
 * Includes composition frameworks, descriptive structures, and anti-repetition signatures.
 */

// ==========================================
// 1. BACKGROUND INTERNAL CREATIVE POOL
// ==========================================
export interface BackgroundVariation {
  id: string;
  uiCategory: string; // which UI option this belongs to, or 'All'
  title: string;
  environmentStructure: string;
  spatialDepth: string;
  vegetationDensity: string;
  terrainAndSurfaces: string;
  atmosphericEnclosure: string;
}

export const INTERNAL_BACKGROUND_POOL: BackgroundVariation[] = [
  // Zen Garden Variants
  {
    id: 'zen_raked_gravel_terrace',
    uiCategory: 'Japanese Zen Garden',
    title: 'Raked Quartz Gravel & Moss Island Terrace',
    environmentStructure: 'an authentic karesansui dry landscape terrace with concentric raked white quartz gravel ripples encircling moss-crested anchor stones',
    spatialDepth: 'shallow foreground leading to a low charred cedar veranda wall, with soft Japanese black pine silhouettes framing the distant background',
    vegetationDensity: 'sparse, disciplined bonsai-pruned dwarf pines and velvety hummocks of kyoto moss',
    terrainAndSurfaces: 'immaculately raked fine granite gravel meeting dark, wet flagstone stepping paths',
    atmosphericEnclosure: 'open contemplative sky balanced by an austere low clay-and-timber boundary wall',
  },
  {
    id: 'zen_secluded_tea_courtyard',
    uiCategory: 'Japanese Zen Garden',
    title: 'Wabi-Sabi Tea Pavilion Alcove',
    environmentStructure: 'a quiet alcove beside a weathered earthen plaster wall with exposed bamboo laths and antique roof tiles',
    spatialDepth: 'intimate mid-ground depth with soft focus paper shoji screens glowing faintly in the upper-left periphery',
    vegetationDensity: 'scattered cushions of hair-cap moss and a solitary weeping Japanese maple leaning gracefully',
    terrainAndSurfaces: 'dark blue-gray slate stepping stones sunken into fine gray river gravel',
    atmosphericEnclosure: 'sheltered tranquil corner shielded from wind by thick woven bamboo fencing',
  },
  {
    id: 'zen_temple_moss_corridor',
    uiCategory: 'Japanese Zen Garden',
    title: 'Kyoto Temple Moss Cloister',
    environmentStructure: 'an ancient temple garden corridor bordered by rounded granite curb stones and centuries-old cedar pillars',
    spatialDepth: 'deep linear perspective of mossy mounds receding toward a distant stone pagoda silhouette',
    vegetationDensity: 'dense, unbroken carpet of emerald velvet moss shaded by soaring cryptomeria trees',
    terrainAndSurfaces: 'damp charcoal river stones polished by footsteps, flanked by rich organic loam',
    atmosphericEnclosure: 'deeply shaded, cool cathedral-like woodland canopy filtering ambient sky light',
  },

  // Mountain Spring Variants
  {
    id: 'mountain_limestone_ravine',
    uiCategory: 'Misty Mountain Spring',
    title: 'Alpine Limestone Spring Grotto',
    environmentStructure: 'a secluded mountain rock face where fresh mineral spring water seeps continuously from natural limestone fissures',
    spatialDepth: 'tiered rocky cliff rising in the middle ground, with soft mountain mist swirling through the upper ravine',
    vegetationDensity: 'wild maidenhair ferns and moisture-loving saxifrage nestled in rock crevices',
    terrainAndSurfaces: 'water-washed basalt shelves, damp gravel banks, and tumbled crystalline river stones',
    atmosphericEnclosure: 'high natural rock enclosure with cool, humid micro-climate and swirling updrafts of mist',
  },
  {
    id: 'mountain_fern_cascade_glen',
    uiCategory: 'Misty Mountain Spring',
    title: 'Highland Fern & Spring Glen',
    environmentStructure: 'a quiet mountain shelf positioned near a gentle subterranean natural spring runoff',
    spatialDepth: 'layered depth with nearby moss boulders giving way to mist-veiled silhouettes of highland larch trees',
    vegetationDensity: 'lush feathery mountain ferns, wild alpine moss, and delicate mountain lichen',
    terrainAndSurfaces: 'dark slate scree beds interspersed with damp, spongy humus soil',
    atmosphericEnclosure: 'open mountain air with drifting low-altitude cloud tendrils curling through the clearing',
  },
  {
    id: 'mountain_ancient_spring_shelf',
    uiCategory: 'Misty Mountain Spring',
    title: 'Mossy Spring Escarpment',
    environmentStructure: 'an ancient stone terrace built into a natural slope where spring water feeds a calm pool',
    spatialDepth: 'graduated vertical elevation with towering damp rock faces behind and open valley mist beyond',
    vegetationDensity: 'hanging tendrils of mountain moss and dwarf alpine rhododendrons in crevice niches',
    terrainAndSurfaces: 'rough-cleaved stone ledges glistening with perpetual moisture and mineral patina',
    atmosphericEnclosure: 'sheltered hollow beneath an overhanging rock ledge, protected yet filled with mountain air',
  },

  // Tropical Bamboo Sanctuary Variants
  {
    id: 'tropical_shaded_bamboo_glen',
    uiCategory: 'Tropical Bamboo Sanctuary',
    title: 'Sunken Tropical Bamboo Glen',
    environmentStructure: 'a sunken botanical sanctuary surrounded by towering golden and emerald bamboo culms',
    spatialDepth: 'dense vertical layering of bamboo stalks creating rhythmic depth planes receding into emerald gloom',
    vegetationDensity: 'luxuriant tropical understory with broad elephant ear leaves, dwarf fishtail palms, and climbing philodendron',
    terrainAndSurfaces: 'dark volcanic cinder soil scattered with fallen bamboo leaves and wet porous lava rock',
    atmosphericEnclosure: 'dense vaulted bamboo canopy creating an organic cathedral ceiling of dappled emerald light',
  },
  {
    id: 'tropical_stream_bamboo_haven',
    uiCategory: 'Tropical Bamboo Sanctuary',
    title: 'Riverside Tropical Bamboo Haven',
    environmentStructure: 'a tranquil clearing along a slow-moving tropical garden stream bordered by giant moso bamboo',
    spatialDepth: 'diagonal water path receding into soft-focus tropical foliage and towering bamboo silhouettes',
    vegetationDensity: 'dense clusters of bird-of-paradise foliage, wild ginger blossoms, and velvety river moss',
    terrainAndSurfaces: 'smooth river-tumbled black basalt boulders and wet, compacted volcanic sand',
    atmosphericEnclosure: 'warm, humid greenhouse-like stillness with gentle breezes rustling upper culm tips',
  },

  // Minimalist Water Atrium Variants
  {
    id: 'minimalist_reflecting_atrium',
    uiCategory: 'Minimalist Water Atrium',
    title: 'Architectural Polished Concrete & Water Court',
    environmentStructure: 'a refined modern architectural atrium featuring monolithic board-formed concrete planes and dark reflecting pools',
    spatialDepth: 'crisp rectilinear sightlines receding past floor-to-ceiling frameless glass into an open sky void',
    vegetationDensity: 'austere and singular: a single sculptural black pine or solitary Japanese maple in a stone well',
    terrainAndSurfaces: 'honed gray basalt pavers, dark river pebble perimeter drains, and still sheet-water planes',
    atmosphericEnclosure: 'semi-enclosed skywell courtyard focusing daylight directly into the tranquil interior',
  },
  {
    id: 'minimalist_cedar_glass_pavilion',
    uiCategory: 'Minimalist Water Atrium',
    title: 'Hinoki Cedar & Shaded Water Sanctum',
    environmentStructure: 'a quiet modern pavilion with horizontal slatted hinoki wood screens and a cantilevered stone basin shelf',
    spatialDepth: 'layered architectural screens filtering light between interior stone platforms and an exterior bamboo garden',
    vegetationDensity: 'restrained: miniature moss mound with a solitary micro-fern in a shallow stone incision',
    terrainAndSurfaces: 'matte charcoal granite floor tiles with narrow water channels flowing flush with the stone',
    atmosphericEnclosure: 'sheltered architectural portico with controlled soft ambient perimeter illumination',
  },

  // Moss Rock Tea Garden Variants
  {
    id: 'moss_rock_roji_clearing',
    uiCategory: 'Moss Rock Tea Garden',
    title: 'Chaniwa Inner Tea Path Clearing',
    environmentStructure: 'an intimate inner tea garden (roji) nestled between ancient weathered stone borders and rustic cedar bark fences',
    spatialDepth: 'meandering stepping stone path (tobi-ishi) curling behind a large moss-cushioned boulder into soft shadows',
    vegetationDensity: 'thick cushions of star moss, wild camellia shrubs, and delicate maidenhair fern fronds',
    terrainAndSurfaces: 'naturally water-worn river stepping stones bedded in dark organic forest floor loam',
    atmosphericEnclosure: 'intimate, enclosed contemplation space shaded by weeping cherry branches and mountain maple',
  },
  {
    id: 'moss_ancient_boulder_nook',
    uiCategory: 'Moss Rock Tea Garden',
    title: 'Lichen-Dappled Boulder Sanctuary',
    environmentStructure: 'a quiet garden nook framed by massive, millennia-old glacial boulders draped in thick emerald bryophyte moss',
    spatialDepth: 'compact immediate mid-ground with boulders forming a natural amphitheater around the water basin',
    vegetationDensity: 'deep multi-layered moss varieties, tiny creeping thyme, and delicate Japanese forest grass',
    terrainAndSurfaces: 'irregular slate chips, damp forest pebbles, and soft damp peat borders',
    atmosphericEnclosure: 'quiet, deeply grounded woodland alcove with muted acoustics and still air',
  },

  // Deep Forest Roji Trail Variants
  {
    id: 'deep_forest_cedar_trail',
    uiCategory: 'Deep Forest Roji Trail',
    title: 'Ancient Cryptomeria Forest Trail',
    environmentStructure: 'a historic pilgrimage trail through ancient towering Japanese cedar (sugi) trees with massive buttress roots',
    spatialDepth: 'deep longitudinal woodland perspective with distant sun rays cutting through cathedral tree trunks',
    vegetationDensity: 'wild forest floor carpeted in wood sorrel, wild ginger leaves, and towering ostrich ferns',
    terrainAndSurfaces: 'centuries-old stone flagstones weathered unevenly by rain and moss growth',
    atmosphericEnclosure: 'majestic forest enclosure with moist, cool air saturated with pine resin and ozone',
  },

  // Modern Architectural Courtyard Variants
  {
    id: 'modern_black_granite_sanctum',
    uiCategory: 'Modern Architectural Courtyard',
    title: 'Honed Black Granite & Water Court',
    environmentStructure: 'a contemporary luxury courtyard featuring dark honed Zimbabwe granite walls with a continuous sheet-water cascade',
    spatialDepth: 'structured geometric planes framing a central sunken garden island surrounded by mirror-finish water',
    vegetationDensity: 'sculptural cloud-pruned Japanese yew (Niwaki) rising from a crisp geometric moss bed',
    terrainAndSurfaces: 'large-format flamed granite slabs interspersed with dark river pebble runnels',
    atmosphericEnclosure: 'open private open-air sky terrace with tall clean architectural privacy screens',
  },

  // Secluded Kyoto Temple Grounds Variants
  {
    id: 'kyoto_temple_veranda_garden',
    uiCategory: 'Secluded Kyoto Temple Grounds',
    title: 'Temple Engawa Garden Sanctuary',
    environmentStructure: 'a private cloistered courtyard adjoining a traditional timber temple veranda (engawa) with overhanging eaves',
    spatialDepth: 'foreground stone basin framed by timber veranda post on the right, looking out toward raked gravel and mossy mounds',
    vegetationDensity: 'ancient weeping weeping cherry, sculptured azalea shrubs, and undisturbed carpets of moss',
    terrainAndSurfaces: 'smooth river-stone drip line under the eaves meeting dry gravel and stepping stones',
    atmosphericEnclosure: 'tranquil, sacred seclusion steeped in centuries of silence and mindful care',
  },

  // Rainforest Spring Sanctuary Variants
  {
    id: 'rainforest_canopy_spring',
    uiCategory: 'Rainforest Spring Sanctuary',
    title: 'Primeval Rainforest Spring Basin',
    environmentStructure: 'a lush primeval forest clearing where a natural thermal or cool freshwater spring bubbles through volcanic rocks',
    spatialDepth: 'dense multi-tiered jungle canopy with hanging lianas and epiphyte-laden branches extending overhead',
    vegetationDensity: 'hyper-dense tropical flora: giant bird-nest ferns, staghorn ferns, monstera, and lush moss cushions',
    terrainAndSurfaces: 'dark vesicular volcanic rock, damp riverbed gravel, and rich decaying organic soil',
    atmosphericEnclosure: 'humid, moisture-laden atmosphere with visible vapor rising gently from the earth',
  },
];

// ==========================================
// 2. MOOD INTERNAL CREATIVE POOL
// ==========================================
export interface MoodVariation {
  id: string;
  uiCategory: string;
  title: string;
  lightingDirective: string;
  atmosphericNuance: string;
  colorHarmony: string;
  specularAndReflection: string;
}

export const INTERNAL_MOOD_POOL: MoodVariation[] = [
  // Peaceful & Meditative
  {
    id: 'meditative_soft_zenith',
    uiCategory: 'Peaceful & Meditative',
    title: 'Soft Zenith Diffuse Serenity',
    lightingDirective: 'soft, shadowless daylight filtered through a continuous canopy of fine bamboo foliage, casting gentle, non-directional illumination',
    atmosphericNuance: 'unbroken silence, tranquil equilibrium, and a contemplative absence of haste or motion',
    colorHarmony: 'muted sage greens, warm weathered stone grays, earthy charcoal, and crystalline water silver',
    specularAndReflection: 'delicate, calm specular sheen on the water mirror reflecting the soft overhead sky like liquid glass',
  },
  {
    id: 'meditative_still_sanctuary',
    uiCategory: 'Peaceful & Meditative',
    title: 'Still Sanctuary Repose',
    lightingDirective: 'gentle ambient illumination with low contrast and whisper-soft gradients across organic stone curves',
    atmosphericNuance: 'deep internal calm, restorative stillness, and an aura of timeless contemplative peace',
    colorHarmony: 'deep jade, velvet moss emerald, wet schist dark gray, and pale bamboo ochre',
    specularAndReflection: 'subtle, micro-ripples creating concentric rings of soft silver light around the water entry point',
  },

  // Misty Morning Calm
  {
    id: 'misty_morning_dew_veil',
    uiCategory: 'Misty Morning Calm',
    title: 'Pre-Dawn Dew Veil & Drifting Fog',
    lightingDirective: 'cool, low-angled morning light gently piercing through lingering mountain mist, revealing delicate volumetric light rays (crepuscular rays)',
    atmosphericNuance: 'crisp alpine freshness, high humidity, cool mountain air, and waking botanical vitality',
    colorHarmony: 'cool slate blues, celadon greens, soft misty whites, and damp dark granite tones',
    specularAndReflection: 'myriad glistening dew droplets beading upon moss tips and stone rims, catching pinpoint morning glints',
  },
  {
    id: 'misty_morning_pale_dawn',
    uiCategory: 'Misty Morning Calm',
    title: 'Pale Dawn Haze & Soft Horizon',
    lightingDirective: 'diffuse silvery morning luminescence with soft, ethereal gradients dissolving harsh edges',
    atmosphericNuance: 'tranquil waking stillness, gentle vapor rising from the water, and cool mountain solitude',
    colorHarmony: 'pearly grays, pale sage, morning sky silver, and saturated damp bark umber',
    specularAndReflection: 'soft diffuse highlight across the wet basin rim, with mist particles scattering ambient daylight',
  },

  // Warm Golden Hour
  {
    id: 'golden_hour_raking_amber',
    uiCategory: 'Warm Golden Hour',
    title: 'Raking Amber Sunbeams & Long Shadows',
    lightingDirective: 'low-angled, warm 3200K golden sunlight raking horizontally across the scene, carving rich relief across stone textures and moss mounds',
    atmosphericNuance: 'nostalgic afternoon warmth, gentle deceleration of time, and rich harmonic relaxation',
    colorHarmony: 'deep amber gold, warm terracotta ochre, glowing chartreuse moss highlights, and velvety umber shadows',
    specularAndReflection: 'intense, warm golden specular flashes dancing across the rippling water surface and glistening wet stone edges',
  },
  {
    id: 'golden_hour_dusk_warmth',
    uiCategory: 'Warm Golden Hour',
    title: 'Late Afternoon Honey Glow',
    lightingDirective: 'honeyed sunlight filtering through fluttering bamboo foliage, casting dynamic dappled patterns of warm light and cool shadow',
    atmosphericNuance: 'soothing sanctuary warmth, end-of-day peace, and the rich scents of warm cedar and damp soil',
    colorHarmony: 'burnished bronze, warm granite amber, olive green, and gilded water reflections',
    specularAndReflection: 'luminous reflections of the golden sky mirrored cleanly in the undisturbed margins of the pool',
  },

  // Twilight Tranquility
  {
    id: 'twilight_blue_amber_duality',
    uiCategory: 'Twilight Tranquility',
    title: 'Deep Indigo Dusk & Soft Candle Glow',
    lightingDirective: 'cool 6500K deep blue hour ambient twilight overhead beautifully contrasted by the warm 2400K organic glow of a nearby candle or lantern flame',
    atmosphericNuance: 'intimate nocturnal retreat, hushed whispers of the evening breeze, and serene spatial enclosure',
    colorHarmony: 'deep indigo blue, slate navy, warm beeswax gold, and deep charcoal stone silhouettes',
    specularAndReflection: 'rich dual-toned reflections on the water surface: cool ambient twilight mirrored against warm dancing flame highlights',
  },

  // Ethereal Moonlit Glow
  {
    id: 'moonlit_silver_luminescence',
    uiCategory: 'Ethereal Moonlit Glow',
    title: 'Full Moon Silver Beam & Midnight Solitude',
    lightingDirective: 'cool, silvery moonlight cascading from above, casting soft, elegant shadows and highlighting wet surfaces with crisp specular pearls',
    atmosphericNuance: 'dreamlike nocturnal mystique, ethereal quietude, and a magical sense of secluded sanctuary',
    colorHarmony: 'monochromatic silver, midnight navy, cool charcoal, and pale ivory water gleams',
    specularAndReflection: 'high-contrast lunar reflection shivering in the center of the dark obsidian-like water mirror',
  },

  // Fresh Post-Rain Dew
  {
    id: 'post_rain_saturated_clarity',
    uiCategory: 'Fresh Post-Rain Dew',
    title: 'Post-Downpour Optical Clarity & Saturated Leaves',
    lightingDirective: 'crystal-clear diffused daylight breaking through departing rainclouds, illuminating freshly washed surfaces with pristine clarity',
    atmosphericNuance: 'petrichor scent, ozone-rich air, energetic renewal, and complete absence of airborne dust',
    colorHarmony: 'vividly saturated emerald moss, deep black wet stone, glistening jade leaves, and pristine water transparency',
    specularAndReflection: 'thousands of convex water beads clinging to leaves, stone rims, and bamboo nodes, acting as microscopic lenses',
  },

  // Deep Mountain Solitude
  {
    id: 'mountain_solitude_cool_clarity',
    uiCategory: 'Deep Mountain Solitude',
    title: 'High Altitude Stillness & Pure Spring Chill',
    lightingDirective: 'unfiltered, crisp high-mountain ambient light with deep natural depth and sharp micro-contrasts',
    atmosphericNuance: 'untouched primeval isolation, crisp alpine purity, and the rhythmic acoustic heartbeat of falling water',
    colorHarmony: 'mineral granite gray, alpine lichen chartreuse, deep pine shadow, and ice-clear spring water',
    specularAndReflection: 'unblemished mirror reflections with crystalline refraction showing the fine sediment and stone bottom of the basin',
  },

  // Soft Diffuse Overcast Stillness
  {
    id: 'overcast_softbox_purity',
    uiCategory: 'Soft Diffuse Overcast Stillness',
    title: 'Natural Softbox Diffusion & Velvet Shadows',
    lightingDirective: 'perfect natural cloud-diffuser overhead producing pure, wrap-around soft lighting with zero harsh glares and infinitely smooth falloff',
    atmosphericNuance: 'timeless quietude, profound visual calm, and uncompromised focus on organic textures and craft',
    colorHarmony: 'balanced neutral grays, forest moss greens, muted bark tones, and pearl-gray water reflections',
    specularAndReflection: 'creamy, satin-like water highlights without blown highlights or harsh reflections',
  },
];

// ==========================================
// 3. KATEGORI INTERNAL CREATIVE POOL
// ==========================================
export interface KategoriVariation {
  id: string;
  uiCategory: string;
  title: string;
  spatialConcept: string;
  philosophicalTone: string;
  waterFeatureRole: string;
}

export const INTERNAL_KATEGORI_POOL: KategoriVariation[] = [
  // Spa Garden
  {
    id: 'spa_hydro_wellness',
    uiCategory: 'Spa Garden',
    title: 'Luxury Hydro-Wellness Sanctuary',
    spatialConcept: 'a secluded botanical spa bathing courtyard with tactile heated stone slabs, aromatic cedar wood, and soothing natural spring flow',
    philosophicalTone: 'rejuvenation, physical restoration, sensory comfort, and luxurious organic harmony',
    waterFeatureRole: 'an inviting, pristine chōzubachi and hot spring water feature designed for ritual hand-cleansing and acoustic serenity',
  },
  {
    id: 'spa_natural_onsen_alcove',
    uiCategory: 'Spa Garden',
    title: 'Thermal Spring & Hinoki Alcove',
    spatialConcept: 'an intimate Japanese onsen garden nook featuring natural volcanic rock basins, smooth cedar duckboards, and delicate herbal steam',
    philosophicalTone: 'deep somatic relaxation, purification, and communion with natural thermal elements',
    waterFeatureRole: 'a natural spring basin with gentle continuous overflow spilling across heated river pebbles',
  },

  // Traditional Chōzubachi
  {
    id: 'traditional_tsukubai_ritual',
    uiCategory: 'Traditional Chōzubachi',
    title: 'Authentic Tea Ceremony Tsukubai Arrangement',
    spatialConcept: 'a strictly composed tsukubai arrangement with a low stone basin (chōzubachi), front stepping stone (mae-ishi), lantern (teshoku-ishi), and ladle shelf',
    philosophicalTone: 'humility, mindful purification before tea ceremony, wabi-sabi reverence for natural imperfection',
    waterFeatureRole: 'the ceremonial heart of the garden, forcing the visitor to kneel low to wash hands and rinse the mind',
  },
  {
    id: 'traditional_temple_purification',
    uiCategory: 'Traditional Chōzubachi',
    title: 'Kyoto Temple Water Cleansing Station',
    spatialConcept: 'a monumental carved stone water pavilion with wooden ladles resting on bamboo rails and deep moss surrounding the catch-basin',
    philosophicalTone: 'spiritual purification, ancient monastic tradition, and contemplative focus',
    waterFeatureRole: 'an abundant, continuous mountain spring flow splashing rhythmically into an ancient carved stone basin',
  },

  // Zen Water Feature
  {
    id: 'zen_karesansui_water_anchor',
    uiCategory: 'Zen Water Feature',
    title: 'Karesansui Living Water Accent',
    spatialConcept: 'a living water stone basin set within a dry-landscape garden of raked granite gravel and moss islands, uniting static and kinetic elements',
    philosophicalTone: 'the paradox of stillness and eternal movement, emptiness and presence, yin and yang equilibrium',
    waterFeatureRole: 'the sole kinetic focal point in an otherwise motionless, meditative stone garden',
  },

  // Rainforest Spring Sanctuary
  {
    id: 'rainforest_biophilic_grotto',
    uiCategory: 'Rainforest Spring Sanctuary',
    title: 'Biophilic Rainforest Spring Grotto',
    spatialConcept: 'a wild, untamed subtropical rock alcove with ancient mossy boulders, dripping tree ferns, and natural volcanic water channels',
    philosophicalTone: 'primeval abundance, raw ecological vitality, and primordial water connection',
    waterFeatureRole: 'a naturally water-hollowed volcanic boulder collecting spring seepage amidst dripping tropical foliage',
  },

  // Tea Ceremony Garden
  {
    id: 'tea_garden_roji_sanctuary',
    uiCategory: 'Tea Ceremony Garden',
    title: 'Chaniwa Wabi Roji Sanctuary',
    spatialConcept: 'the inner roji passage of a traditional tea house, featuring irregular mossy stepping stones and rustic wattle fences',
    philosophicalTone: 'leaving the worldly dust behind, cultivating unpretentious simplicity, and embracing quiet nature',
    waterFeatureRole: 'a weathered water stone positioned low to the ground to evoke contemplative reverence',
  },

  // Modern Luxury Courtyard
  {
    id: 'modern_minimalist_hydro_court',
    uiCategory: 'Modern Luxury Courtyard',
    title: 'Contemporary Minimalist Hydro-Courtyard',
    spatialConcept: 'a masterfully designed architectural patio combining honed black basalt, crisp linear water runnels, and minimalist negative space',
    philosophicalTone: 'geometric precision, refined restraint, modern tranquility, and high-end architectural composure',
    waterFeatureRole: 'a custom hand-finished stone basin acting as a sculptural centerpiece on a bed of river stones',
  },

  // Botanical Hydro-Sanctuary
  {
    id: 'botanical_rare_species_sanctuary',
    uiCategory: 'Botanical Hydro-Sanctuary',
    title: 'Curated Botanical Water Conservatory',
    spatialConcept: 'a curated micro-botanical garden with rare miniature fern species, aquatic flowering plants, and carefully placed stone water features',
    philosophicalTone: 'scientific elegance, botanical wonder, and deep horticultural devotion',
    waterFeatureRole: 'a multi-tiered water garden feeding rare moss varieties and supporting aquatic flora',
  },
];

// ==========================================
// 4. DEKORASI INTERNAL CREATIVE POOL
// ==========================================
export interface DekorasiVariation {
  id: string;
  uiCategory: string;
  title: string;
  primaryElements: string;
  placementHarmony: string;
  lightingRole: string;
}

export const INTERNAL_DEKORASI_POOL: DekorasiVariation[] = [
  // Candle + Stone Lantern
  {
    id: 'dekorasi_oribe_lantern_votives',
    uiCategory: 'Candle + Stone Lantern',
    title: 'Weathered Oribe Stone Lantern & Natural Beeswax Votives',
    primaryElements: 'a moss-covered Oribe carved granite lantern with a softly glowing interior, accompanied by two low-lying beeswax candle votives in stone cups',
    placementHarmony: 'stationed in the mid-ground behind the basin to the right, casting a warm amber rim-light across the stone edges',
    lightingRole: 'provides warm, flickering 2200K organic accent lighting that reflects delicately across the water mirror',
  },
  {
    id: 'dekorasi_kasuga_lantern_floating_flame',
    uiCategory: 'Candle + Stone Lantern',
    title: 'Ancient Kasuga-dōrō & Floating Water Candle',
    primaryElements: 'a tall, weathered hexagonal Kasuga stone lantern dappled with lichen, paired with a small floating candle nestled in a hollow ceramic leaf on the water',
    placementHarmony: 'lantern anchors the upper-left quadrant while the floating flame glides near the calm water edge',
    lightingRole: 'creates gentle glowing specular points on wet stone surfaces and soft shadows behind ferns',
  },

  // Smooth River Stones + Incense
  {
    id: 'dekorasi_black_obsidian_incense',
    uiCategory: 'Smooth River Stones + Incense',
    title: 'Polished Black River Obsidian & Sandalwood Smoke',
    primaryElements: 'a deliberate grouping of tumbled black obsidian river stones nestled in moss, beside a small hand-thrown ceramic incense burner emitting a gossamer thread of sandalwood smoke',
    placementHarmony: 'arranged in the immediate foreground corner, grounding the composition with tactile textures',
    lightingRole: 'the delicate smoke ribbon catches soft morning backlighting as it curls gently toward the upper frame',
  },

  // Moss Rocks + Wooden Ladle (Hishaku)
  {
    id: 'dekorasi_hishaku_hinoki_moss_boulders',
    uiCategory: 'Moss Rocks + Wooden Ladle (Hishaku)',
    title: 'Traditional Hinoki Wood Hishaku Ladle & Emerald Moss Boulders',
    primaryElements: 'an authentic handcrafted hinoki cypress water ladle (hishaku) with a slender bamboo handle resting diagonally across the basin rim, flanked by velvety emerald moss boulders',
    placementHarmony: 'ladle provides a deliberate human ritual scale while moss boulders cradle the base of the basin',
    lightingRole: 'pale cypress wood reflects soft ambient light, contrasting with the dark wet stone of the basin',
  },

  // Stepping Stones + Bonsai
  {
    id: 'dekorasi_tobi_ishi_cloud_bonsai',
    uiCategory: 'Stepping Stones + Bonsai',
    title: 'Weathered Tobi-Ishi Stepping Stones & Gnarled Bonsai',
    primaryElements: 'flat, water-worn basalt stepping stones (tobi-ishi) embedded in moss, beside an antique fifty-year-old Japanese black pine bonsai on a rustic stone slab',
    placementHarmony: 'stepping stones create a subtle visual pathway leading the eye from the foreground into the background',
    lightingRole: 'sculptural bonsai needles filter ambient light into exquisite lace-like shadow patterns',
  },

  // Cast Iron Kettle + Oil Lamp
  {
    id: 'dekorasi_tetsubin_cast_iron_lamp',
    uiCategory: 'Cast Iron Kettle + Oil Lamp',
    title: 'Antique Tetsubin Iron Kettle & Brass Oil Lamp',
    primaryElements: 'a patinated cast-iron tetsubin tea kettle with a pebbled surface, set beside a traditional brass wick oil lamp with a tiny golden flame',
    placementHarmony: 'resting upon a raised, dry flat river stone in the mid-ground just outside the water splash zone',
    lightingRole: 'produces warm, focused pinpoint illumination that highlights the rough texture of the iron and nearby water droplets',
  },

  // Floating Lotus Candles
  {
    id: 'dekorasi_floating_lotus_votives',
    uiCategory: 'Floating Lotus Candles',
    title: 'Ceramic Lotus Leaf Votives & Drifting Flames',
    primaryElements: 'three miniature hand-carved floating lotus flower candles with golden cotton wicks drifting gently across the dark water mirror',
    placementHarmony: 'positioned on the surface of the basin water, creating dynamic focal illumination',
    lightingRole: 'radiates warm amber ripples outward across the calm water pool, casting golden caustic patterns on the inner stone walls',
  },

  // Bamboo Wind Chimes + Raked Gravel
  {
    id: 'dekorasi_windchime_raked_gravel',
    uiCategory: 'Bamboo Wind Chimes + Raked Gravel',
    title: 'Rustic Bamboo Wind Bells & Concentric Gravel Waves',
    primaryElements: 'a hollow-stem bamboo wind chime hanging softly in the out-of-focus background, above concentric circles raked into fine gray granite gravel',
    placementHarmony: 'gravel sweeps along the foreground border while the bamboo chime adds atmospheric depth in the soft background',
    lightingRole: 'raked gravel ridges create high-texture micro-shadows that emphasize geometric discipline against organic water flow',
  },

  // Handcrafted Washi Lanterns + Wet Pebbles
  {
    id: 'dekorasi_washi_paper_lanterns_pebbles',
    uiCategory: 'Hand-folded Washi Lanterns + Wet Pebbles',
    title: 'Geometric Washi Lanterns & Glistening River Pebbles',
    primaryElements: 'two hand-folded white washi paper lanterns with cedar bases glowing warmly, surrounded by an organic spill of glistening wet multicolour river pebbles',
    placementHarmony: 'lanterns nestle softly amidst damp ferns at the base of the basin, illuminating the wet pebble bed',
    lightingRole: 'soft, diffuse 2700K parchment glow that washes over the lower half of the stone basin and adjacent foliage',
  },
];

// ==========================================
// 5. FLOWER INTERNAL CREATIVE POOL
// ==========================================
export interface FlowerVariation {
  id: string;
  uiCategory: string;
  title: string;
  speciesScientific: string;
  bloomState: string;
  colorAndPetals: string;
  spatialPlacement: string;
  relationshipToWaterAndStone: string;
}

export const INTERNAL_FLOWER_POOL: FlowerVariation[] = [
  // White Lotus
  {
    id: 'flower_white_lotus_solitary_center',
    uiCategory: 'White Lotus',
    title: 'Solitary Sacred White Lotus (Centered Mirror)',
    speciesScientific: 'Nelumbo nucifera',
    bloomState: 'in pristine, symmetrical full bloom with outer petals gently resting on the water',
    colorAndPetals: 'translucent alabaster white petals with a subtle lime-gold central seed pod and golden stamens',
    spatialPlacement: 'floating serenely near the center of the stone basin water mirror',
    relationshipToWaterAndStone: 'microscopic water droplets bead like mercury across the waxy hydrophobic petals, while concentric ripples lap gently against the dark basin rim',
  },
  {
    id: 'flower_white_lotus_paired_rim',
    uiCategory: 'White Lotus',
    title: 'White Lotus Blossom & Bud Nestled at Rim',
    speciesScientific: 'Nelumbo nucifera',
    bloomState: 'one open pristine blossom accompanied by an elegant, tightly spiraled green-tipped bud',
    colorAndPetals: 'pure snowy white with delicate pale-cream undertones and faint pink tips',
    spatialPlacement: 'tucked gracefully against the inner mossy curve of the stone basin',
    relationshipToWaterAndStone: 'anchored near the stone edge, contrasting the soft velvety petals against the dark, rugged granite surface',
  },

  // Pink Water Lily
  {
    id: 'flower_pink_water_lily_open',
    uiCategory: 'Pink Water Lily',
    title: 'Blush Pink Water Lily & Floating Pad',
    speciesScientific: 'Nymphaea',
    bloomState: 'fully expanded star-shaped blossom resting upon a solitary emerald floating lily pad',
    colorAndPetals: 'gradient petals shifting from tender rose-pink at the base to soft ivory at the tips with a vibrant saffron-yellow core',
    spatialPlacement: 'drifting gently in the right foreground of the water basin',
    relationshipToWaterAndStone: 'a single crystalline water drop sits poised in the center of the lily pad, reflecting the ambient garden canopy',
  },

  // Cherry Blossoms (Sakura)
  {
    id: 'flower_sakura_petals_floating',
    uiCategory: 'Cherry Blossoms (Sakura)',
    title: 'Fresh Sakura Blossoms & Scattered Drifting Petals',
    speciesScientific: 'Prunus serrulata',
    bloomState: 'freshly fallen morning cherry blossoms alongside a scattered trail of delicate single petals',
    colorAndPetals: 'softest blush pink and pale shell white with delicate crimson petal-bases',
    spatialPlacement: 'floating in a natural, drifting spiral across the water surface, with two petals resting on the wet stone rim',
    relationshipToWaterAndStone: 'petals follow the gentle surface currents generated by the bamboo water spout, accumulating near the overflow lip',
  },

  // Frangipani (Plumeria)
  {
    id: 'flower_plumeria_golden_heart',
    uiCategory: 'Frangipani (Plumeria)',
    title: 'Dew-Laden White Frangipani with Golden Heart',
    speciesScientific: 'Plumeria alba',
    bloomState: 'perfect five-petaled pinwheel blossom in fresh peak bloom',
    colorAndPetals: 'thick, velvety porcelain-white petals radiating outward from a vivid buttery yellow center',
    spatialPlacement: 'floating effortlessly upon the water surface just beside the bamboo water stream',
    relationshipToWaterAndStone: 'waxy petals resist moisture, glistening with tiny spherical dew beads that catch specular reflections',
  },

  // Wild Mountain Orchid
  {
    id: 'flower_mountain_orchid_cliff',
    uiCategory: 'Wild Mountain Orchid',
    title: 'Graceful Mountain Orchid Leaning Over Basin',
    speciesScientific: 'Cymbidium goeringii',
    bloomState: 'a slender arching spray with three delicate open blossoms and two pendulous buds',
    colorAndPetals: 'pale chartreuse green petals with fine burgundy-speckled lips and translucent throats',
    spatialPlacement: 'emerging organically from a moss-filled crevice in the stone behind the basin, arching gracefully over the pool',
    relationshipToWaterAndStone: 'tips of the slender green leaves brush the water surface, creating microscopic capillary ripples',
  },

  // Japanese Camellia (Tsubaki)
  {
    id: 'flower_camellia_tsubaki_crimson',
    uiCategory: 'Japanese Camellia (Tsubaki)',
    title: 'Fallen Winter Camellia (Tsubaki) on Dark Stone',
    speciesScientific: 'Camellia japonica',
    bloomState: 'intact, whole fallen flower in pristine condition with tight overlapping petals',
    colorAndPetals: 'deep, saturated scarlet-crimson petals contrasting with a dense boss of golden stamens',
    spatialPlacement: 'resting on a dark, wet flat river stone directly adjacent to the basin rim, with two loose petals in the water',
    relationshipToWaterAndStone: 'the intense crimson creates a striking visual focal anchor against the dark gray basalt and lush emerald moss',
  },

  // Single White Peony
  {
    id: 'flower_white_peony_ruffled',
    uiCategory: 'Single White Peony',
    title: 'Lush Ruffled White Tree Peony Blossom',
    speciesScientific: 'Paeonia suffruticosa',
    bloomState: 'magnificent full double-bloom with dozens of delicately ruffled, tissue-like petals',
    colorAndPetals: 'creamy bridal white with translucent petal margins and a hidden golden-yellow heart',
    spatialPlacement: 'floating near the basin edge with outer ruffled petals draping softly over the wet stone lip',
    relationshipToWaterAndStone: 'generous floral volume creates rich tactile layering against the dark, monolithic stone basin',
  },

  // Purple Water Iris
  {
    id: 'flower_purple_iris_hanashobu',
    uiCategory: 'Purple Water Iris',
    title: 'Japanese Water Iris (Hanashōbu) Accent',
    speciesScientific: 'Iris ensata',
    bloomState: 'elegant wide-petaled blossom with drooping velvety falls and upright standards',
    colorAndPetals: 'deep royal violet and indigo with vivid lemon-yellow signal streaks down the center of each fall',
    spatialPlacement: 'a solitary cut stem placed in a hollow stone vase beside the basin, with one fallen petal floating in the pool',
    relationshipToWaterAndStone: 'regal purple coloration establishes rich color contrast against green bamboo and warm stone tones',
  },

  // Floating Gardenia Petals
  {
    id: 'flower_gardenia_floating_velvet',
    uiCategory: 'Floating Gardenia Petals',
    title: 'Floating Ivory Gardenia Blossom & Scattered Petals',
    speciesScientific: 'Gardenia jasminoides',
    bloomState: 'creamy spiral-centered flower with thick, intoxicatingly fragrant petals',
    colorAndPetals: 'warm ivory and soft butter-cream with deep emerald waxy leaves attached',
    spatialPlacement: 'drifting in the calmest eddy of the water basin opposite the bamboo spout',
    relationshipToWaterAndStone: 'thick petals float high on the water surface, creating soft, circular shadows on the basin floor below',
  },
];

// ==========================================
// 6. BASIN MULTI-DIMENSIONAL 3-LEVEL POOL
// ==========================================
export const BASIN_INTERNAL_MATERIALS = [
  'hand-chiselled speckled salt-and-pepper granite with fine quartz flecks',
  'dense dark charcoal river basalt smoothed by millennia of alpine currents',
  'weathered vesicular volcanic lava stone with porous, textured micro-cavities',
  'smooth honed silver-gray travertine with subtle horizontal sedimentary strata',
  'ancient fossil-embedded mossy limestone with soft rounded geological contours',
  'hand-cleaved blue-gray slate with crisp, natural laminar cleavage planes',
  'dense fine-grained black soapstone exhibiting a silky, tactile wet sheen',
  'warm ironstone sandstone boulder with natural rust-toned mineral oxidation',
  'traditional fired dark stoneware ceramic with a matte unglazed exterior',
  'antique glazed celadon ceramic vessel featuring delicate tea-green craquelure glaze',
  'rough-hewn quartzite rock with crystalline facets that glint in ambient light',
  'monolithic dark metamorphic boulder with undulating natural water channels',
  'weathered river-tumbled schist with silvery mica inclusions',
  'earthy terracotta stoneware fired in an ancient wood-burning anagama kiln',
  'pale ash-gray granite boulder with natural lichen-dappled weathering',
];

export const BASIN_INTERNAL_FORMS = [
  'shallow wide circular bowl with an organically undulating lip',
  'deep asymmetrical natural river boulder hollowed by natural water erosion',
  'monolithic cylindrical chōzubachi with a wide, flat honed stone rim',
  'two-tiered stepped stone basin where water cascades gently from an upper pool into a lower catch-stone',
  'sculpted octagonal water stone with softened wabi-sabi wabi edges',
  'elongated oval trough carved into an organic river-stone boulder',
  'irregular concave stone bowl with a subtle natural overflow notch on the left',
  'compact square-cut stone basin with soft rounded interior contours',
  'gently curved natural stone basin with a wide, shallow lip designed for mirror-calm water',
  'sunken natural rock depression cradled seamlessly amidst surrounding moss mounds',
  'monolithic cubic stone vessel with rough chisel-fluted sides and a polished circular inner pool',
  'kidney-shaped water stone with an organic curved perimeter following natural rock grain',
  'heart-shaped carved stone basin with two gentle upper lobes and a tapered lower point, naturally softened by water erosion',
  'five-point star-shaped sculptural stone basin with softened rounded points and a shallow reflective inner pool',
  'six-point floral water basin with petal-like lobes carved into a single monolithic stone',
  'leaf-shaped elongated basin with a tapered tip, central water channel, and gently asymmetric natural rim',
  'crescent-shaped stone basin with a smooth concave inner pool and organically weathered outer edge',
  'hexagonal stone basin with subtly chamfered corners and softened wabi-sabi edges',
  'cross-shaped four-lobed water basin with rounded arms and a compact central pool',
  'freeform sculptural basin with an intentionally asymmetric silhouette, avoiding conventional circular geometry',
];

export const BASIN_INTERNAL_SURFACES = [
  'glistening wet reflective rim adorned with microscopic crystalline water droplets',
  'thick velvety emerald moss creeping organically over the outer weathered stone shoulder',
  'silky water-worn interior hollow smoothed to a satiny finish by continuous water flow',
  'rough chisel-toothed exterior texture creating a sharp tactile contrast with a glassy inner pool',
  'ancient pale-green and silver lichen patches mottling the exterior rock face with authentic patina',
  'dark water-saturated stone surface mirroring the soft ambient sky like polished obsidian',
  'subtle mineral deposit rings and rust-toned sediment streaks lining the inner waterline',
  'fine condensation beads clinging to cool, damp rock contours above the water level',
  'water-smoothed pebble-like rim where trickling overflow creates a continuous shimmering film',
  'weathered micro-crevices where tiny maidenhair fern spores have taken root along the outer base',
];

// ==========================================
// 7. BAMBOO INTERNAL CREATIVE POOL
// ==========================================
export interface BambooVariationDetail {
  id: string;
  uiCategory: string;
  title: string;
  architecture: string;
  stalkCharacteristics: string;
  waterDynamics: string;
  positionAndPlacement: string;
}

export const INTERNAL_BAMBOO_POOL: BambooVariationDetail[] = [
  {
    id: 'bamboo_single_kakehi_diagonal',
    uiCategory: 'Single Green Bamboo Kakehi Spout',
    title: 'Traditional Angled Green Bamboo Kakehi',
    architecture: 'a single angled authentic green bamboo kakehi spout cut with a clean 45-degree diagonal beveled tip',
    stalkCharacteristics: 'mature 6cm diameter green bamboo with distinct node rings and fine longitudinal cellulose grain',
    waterDynamics: 'discharging a slender, glassy, continuous laminar trickle that enters the water surface with minimal splashing',
    positionAndPlacement: 'extending gracefully from the upper-right corner at a 40-degree angle, hovering 15 centimeters above the pool',
  },
  {
    id: 'bamboo_rustic_shishi_odoshi',
    uiCategory: 'Rustic Shishi-odoshi (Water Rocker)',
    title: 'Balanced Bamboo Shishi-odoshi (Water Rocker)',
    architecture: 'a traditional bamboo rocker (shishi-odoshi) poised delicately upon a carved wooden pivot peg between two upright bamboo posts',
    stalkCharacteristics: 'hollowed golden-brown weathered bamboo stalk bound with blackened hemp cord at the pivot node',
    waterDynamics: 'resting in pregnant silence just above the water level, fully filled with fresh mountain spring water, ready to tip',
    positionAndPlacement: 'anchored in the middle ground to the left of the stone basin, perfectly framed against soft moss stones',
  },
  {
    id: 'bamboo_paired_stalks_flume',
    uiCategory: 'Paired Bamboo Stalks',
    title: 'Paired Twin Bamboo Conduits with Tiered Spill',
    architecture: 'two parallel green bamboo conduits of staggered lengths bound together with traditional dark hemp rope (kuro-nawa)',
    stalkCharacteristics: 'slender 4cm stalks with vibrant olive-green skin and moisture glistening along the node rings',
    waterDynamics: 'twin delicate water streams arching outward, creating a harmonious double ripple pattern in the basin below',
    positionAndPlacement: 'entering from the left flank, resting upon a flat moss-covered boulder adjacent to the basin',
  },
  {
    id: 'bamboo_grove_cluster_vertical',
    uiCategory: 'Slender Bamboo Grove Cluster',
    title: 'Slender Vertical Bamboo Grove Backdrop',
    architecture: 'a rhythmic cluster of five living, upright green bamboo culms forming a natural vertical colonnade behind a horizontal water flume',
    stalkCharacteristics: 'tall, straight timber bamboo culms with feathery emerald leaves cascading into the upper frame',
    waterDynamics: 'a notched horizontal bamboo trough bridging two stalks directs a steady, clear water stream into the stone bowl',
    positionAndPlacement: 'vertical culms rise through the soft-focus background, establishing rich vertical depth and organic framing',
  },
  {
    id: 'bamboo_weathered_conduit_flume',
    uiCategory: 'Weathered Bamboo Conduit Flume',
    title: 'Weathered Golden Bamboo Water Flume',
    architecture: 'an antique, sun-bleached golden-amber bamboo pipe split horizontally to form an open water flume',
    stalkCharacteristics: 'rich amber patina with fine weathered hairline cracks, smooth water-worn interior canal, and mossy nodes',
    waterDynamics: 'crystal-clear spring water glides smoothly along the open channel before dropping cleanly from the terminal lip',
    positionAndPlacement: 'laid horizontally across two notched river stones along the upper-rear perimeter of the basin',
  },
  {
    id: 'bamboo_minimalist_cylindrical_kakehi',
    uiCategory: 'Minimalist Cylindrical Spout',
    title: 'Minimalist Purist Cylindrical Bamboo Spout',
    architecture: 'a clean, unornamented cylindrical green bamboo spout emerging perpendicularly from a cedar backing',
    stalkCharacteristics: 'flawlessly straight, unblemished emerald bamboo with a sharp 90-degree square cut at the water outlet',
    waterDynamics: 'producing a pure vertical water column that penetrates the water mirror with pinpoint precision',
    positionAndPlacement: 'positioned directly over the rear-center of the basin, emphasizing architectural symmetry and restraint',
  },
  {
    id: 'bamboo_curved_water_feature',
    uiCategory: 'Curved Bamboo Water Feature',
    title: 'Naturally Curved Bamboo Arch Conduit',
    architecture: 'a gracefully curved single bamboo stalk that follows a natural organic bow, creating an elegant arched silhouette',
    stalkCharacteristics: 'supple cured bamboo with subtle warmth in the node ridges and delicate droplet beads along the under-curve',
    waterDynamics: 'water curves gently along the interior bend before releasing in a rhythmic, pearl-like sequence of drops',
    positionAndPlacement: 'arching from the right mid-ground toward the center of the water basin in an elegant sweeping line',
  },
  {
    id: 'bamboo_layered_multitier',
    uiCategory: 'Layered Multi-Tier Spout',
    title: 'Two-Tiered Cascading Bamboo Spout System',
    architecture: 'a stepped two-level bamboo construction where an upper feeder tube fills a shorter lower bamboo cup that overflows into the basin',
    stalkCharacteristics: 'two complementary bamboo diameters: a thick 7cm lower reservoir and a slender 3cm upper feeder stalk',
    waterDynamics: 'creates a gentle, continuous double-step water acoustic, breaking water into soft crystalline rivulets',
    positionAndPlacement: 'positioned in the right rear quarter, creating architectural height and layered mid-ground complexity',
  },
];

// ==========================================
// 8. COMPOSITIONS ARCHITECTURAL FRAMEWORKS
// ==========================================
export interface CompositionFramework {
  id: string;
  name: string;
  spatialArrangement: string;
  foregroundAnchor: string;
  midgroundFocal: string;
  backgroundRecession: string;
  focalPointDetail: string;
  visualBalance: string;
}

export const COMPOSITION_FRAMEWORKS: CompositionFramework[] = [
  {
    id: 'comp_asymmetric_foreground_anchor',
    name: 'Asymmetric Tactile Anchor (Rule of Thirds)',
    spatialArrangement: 'The stone water basin is grounded with monumental weight in the lower-left third of the composition. The bamboo water spout enters diagonally from the upper-right, establishing dynamic diagonal tension.',
    foregroundAnchor: 'Crisp, tactile foreground featuring wet river pebbles, velvety moss mounds, and glistening water droplets right up to the bottom edge.',
    midgroundFocal: 'The water basin interior pool with its floating blossom and the water trickle creating concentric ripples.',
    backgroundRecession: 'The right side opens into a soft, atmospheric garden space with raked gravel or mossy stepping stones fading into soft focus.',
    focalPointDetail: 'The precise point where falling water meets the calm pool surface, creating delicate concentric silver ripples beside the floating flower.',
    visualBalance: 'Asymmetrical equilibrium: heavy stone weight on the left balanced by negative space and atmospheric garden depth on the right.',
  },
  {
    id: 'comp_centered_contemplative_intimacy',
    name: 'Centered Contemplative Intimacy',
    spatialArrangement: 'A balanced, direct frontal perspective centered upon the stone basin. Low-lying river stones and lush dwarf ferns cradle the basin perimeter in crisp focus.',
    foregroundAnchor: 'A semi-circular apron of dark, wet river stones and vibrant moss cushions framing the lower boundary of the frame.',
    midgroundFocal: 'The sculptural basin resting majestically at the center, holding the calm water mirror and floating floral element.',
    backgroundRecession: 'The background recedes into an atmospheric veil of vertical bamboo stalks and soft garden lanterns shrouded in misty silence.',
    focalPointDetail: 'The solitary blossom resting effortlessly on the undisturbed water mirror beside the bamboo spout.',
    visualBalance: 'Formal harmonious balance rooted in wabi-sabi contemplative stillness and centered spatial reverence.',
  },
  {
    id: 'comp_dynamic_diagonal_hydro_flow',
    name: 'Dynamic Diagonal Hydro-Flow',
    spatialArrangement: 'A sweeping diagonal visual vector flowing from the upper-left bamboo water source down across the sculpted basin toward the lower-right foreground.',
    foregroundAnchor: 'Water-worn slate slabs and scattered velvety moss rocks establishing rich, layered tactile depth in the lower frame.',
    midgroundFocal: 'The cascading stream dividing gently over the curved lip of the stone basin into an organic catch-pool below.',
    backgroundRecession: 'Deep vertical foliage planes, including bamboo culms and ancient temple plaster walls, receding through natural depth of field.',
    focalPointDetail: 'The cascade where the clear stream spills over the stone lip, catching directional light in shimmering micro-droplets.',
    visualBalance: 'Kinetic balance: continuous water flow guided along a strong diagonal axis against stable horizontal stone ledges.',
  },
  {
    id: 'comp_intimate_rim_perspective',
    name: 'Intimate Rim Perspective (Macro-Environmental)',
    spatialArrangement: 'The camera is positioned mere inches above the basin rim level, granting monumental intimacy to the wet stone contours, water surface tension, and floral petals.',
    foregroundAnchor: 'Hyper-detailed stone rim micro-textures, individual moss filaments, and beaded moisture droplets right at the threshold of vision.',
    midgroundFocal: 'The calm water plane stretching out like a liquid mirror, reflecting the surrounding garden canopy in soft distortion.',
    backgroundRecession: 'The garden setting dissolves into a creamy, luminous bokeh of green and amber foliage highlights.',
    focalPointDetail: 'The translucent petal margins of the flower touching the water, with surface tension meniscus visible along the edge.',
    visualBalance: 'Profound macro-to-micro depth: tactile immediacy in the foreground giving way to dreamy environmental atmosphere.',
  },
  {
    id: 'comp_enclosed_alcove_sanctuary',
    name: 'Sheltered Alcove Sanctuary',
    spatialArrangement: 'The basin is nestled within a natural rock-and-fern alcove, with organic stone formations and timber fencing framing both the left and right flanks.',
    foregroundAnchor: 'A gentle slope of damp organic soil, creeping thyme, and tumbled river pebbles leading toward the basin base.',
    midgroundFocal: 'The water feature enclosed within its natural niche, illuminated by soft ambient or lantern glow.',
    backgroundRecession: 'A dark, textured stone rock face or weathered cedar wall closing off the background, fostering deep intimacy.',
    focalPointDetail: 'The glowing water pool catching amber candlelight highlights beneath the sheltered canopy.',
    visualBalance: 'Protective, cocoon-like enclosure: frame edges embrace the center, creating a safe, serene sanctuary feeling.',
  },
];

// ==========================================
// 9. DIVERSE DESCRIPTIVE STRUCTURE TEMPLATES
// ==========================================
// To avoid repetitive "A photograph of..." template openings,
// we provide 3 distinct narrative approaches for the 3 prompts.
export interface SentenceArchitecture {
  openingFocus: 'material_and_form' | 'atmospheric_spatial' | 'hydro_kinetic';
  render: (params: {
    kategori: string;
    background: string;
    mood: string;
    suasana: string;
    basinDescription: string;
    bambooDescription: string;
    flowerDescription: string;
    dekorasiDescription: string;
    composition: CompositionFramework;
    lighting: string;
    specular: string;
  }) => string;
}

export const DIVERSE_SENTENCE_ARCHITECTURES: SentenceArchitecture[] = [
  // Prompt 1: Material and Sculptural Craftsmanship First
  {
    openingFocus: 'material_and_form',
    render: ({
      kategori,
      background,
      mood,
      suasana,
      basinDescription,
      bambooDescription,
      flowerDescription,
      dekorasiDescription,
      composition,
      lighting,
    }) => {
      return [
        `Architectural botanical study of an authentic ${kategori.toLowerCase()} situated within ${background.toLowerCase()}, captured in a ${mood.toLowerCase()} mood with a ${suasana.toLowerCase()} environmental setting.`,
        `The composition is anchored by a ${basinDescription}, holding a calm, undisturbed mirror of mountain spring water.`,
        `${bambooDescription}.`,
        `${flowerDescription}.`,
        `Around the stone water feature, ${dekorasiDescription}, creating an organic wabi-sabi relationship between craft and raw nature.`,
        `${composition.spatialArrangement}`,
        `${composition.foregroundAnchor}`,
        `${lighting} Every organic surface reveals hyper-fine micro-textures, from damp stone pores and damp botanical fibers to glistening dew beads. High-end architectural garden photography, 50mm prime lens aesthetic, shallow depth of field, 8k resolution, photorealistic clarity.`
      ].join(' ');
    },
  },

  // Prompt 2: Atmospheric Lighting & Spatial Depth First
  {
    openingFocus: 'atmospheric_spatial',
    render: ({
      kategori,
      background,
      mood,
      suasana,
      basinDescription,
      bambooDescription,
      flowerDescription,
      dekorasiDescription,
      composition,
      lighting,
    }) => {
      return [
        `Enveloped in a ${mood.toLowerCase()} mood during ${suasana.toLowerCase()}, this close environmental view reveals a secluded ${kategori.toLowerCase()} in ${background.toLowerCase()}.`,
        `${lighting}`,
        `Commanding the center of this serene sanctuary is a ${basinDescription}, filled with crystalline water reflecting the sky.`,
        `${bambooDescription}.`,
        `${flowerDescription}.`,
        `Mindfully positioned around the perimeter, ${dekorasiDescription}.`,
        `${composition.spatialArrangement}`,
        `The camera perspective is positioned slightly above basin level with a grounded three-quarter front view, producing natural creamy depth of field where the background recedes into soft atmospheric blur while foreground organic textures remain razor-sharp. Authentic garden photography, 8k clarity.`
      ].join(' ');
    },
  },

  // Prompt 3: Hydro-Kinetic Water Dynamics & Sensory Tactility First
  {
    openingFocus: 'hydro_kinetic',
    render: ({
      kategori,
      background,
      mood,
      suasana,
      basinDescription,
      bambooDescription,
      flowerDescription,
      dekorasiDescription,
      composition,
      lighting,
    }) => {
      return [
        `Tactile environmental perspective of a mindful ${kategori.toLowerCase()} nestled in ${background.toLowerCase()}, imbued with a ${mood.toLowerCase()} essence and ${suasana.toLowerCase()} setting.`,
        `${bambooDescription}.`,
        `The stream falls continuously into a ${basinDescription}, where gentle surface ripples lap rhythmically outward across the still pool.`,
        `${flowerDescription}.`,
        `Harmoniously integrating into the landscape, ${dekorasiDescription}.`,
        `${composition.spatialArrangement}`,
        `${composition.foregroundAnchor}`,
        `${lighting} Captured with a close environmental three-quarter front perspective slightly above the stone rim, highlighting rich textural contrast between wet rock, fresh green bamboo, and velvety petals. Pristine botanical garden photography, masterclass composition, 8k resolution.`
      ].join(' ');
    },
  },
];
