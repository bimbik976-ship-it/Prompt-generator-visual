import { ChatModelConfig } from '../types';

export const CHAT_MODELS: ChatModelConfig[] = [
  {
    id: 'gpt-6-astra',
    name: 'GPT-6 Astra',
    badge: 'Flagship Chat',
    description: 'Flagship reasoning chat model with supreme atmospheric nuance, multi-layered spatial depth, and pristine botanical prompt crafting.',
  },
  {
    id: 'gpt-5.6',
    name: 'GPT-5.6',
    badge: 'Advanced Chat',
    description: 'High-depth reasoning chat model specializing in complex hydro-dynamics, geological textures, and physical water interactions.',
  },
  {
    id: 'gpt-5.5',
    name: 'GPT-5.5',
    badge: 'Default Chat',
    description: 'Default high-precision chat model for balanced, photorealistic zen water feature Text-to-Image prompt generation.',
  },
];

export const DEFAULT_CHAT_MODEL_ID = 'gpt-5.5';

export const BACKGROUND_OPTIONS = [
  'Random',
  'Japanese Zen Garden',
  'Misty Mountain Spring',
  'Tropical Bamboo Sanctuary',
  'Minimalist Water Atrium',
  'Moss Rock Tea Garden',
  'Deep Forest Roji Trail',
  'Modern Architectural Courtyard',
  'Secluded Kyoto Temple Grounds',
  'Tropical Riverside Garden',
  'Hidden Orchid Garden',
  'Moonlit Lotus Pond Garden',
  'Rainforest Waterfall Alcove',
  'Coastal Botanical Garden',
  'Terraced Mountain Garden',
  'Cedar Woodland Sanctuary',
  'Stone Courtyard Garden',
  'Luxury Resort Spa Garden',
  'Wildflower Creek Garden',
  'Secret Inner Courtyard',
];

export const MOOD_OPTIONS = [
  'Random',
  'Peaceful & Meditative',
  'Misty Morning Calm',
  'Warm Golden Hour',
  'Twilight Tranquility',
  'Ethereal Moonlit Glow',
  'Fresh Post-Rain Dew',
  'Deep Mountain Solitude',
  'Soft Diffuse Overcast Stillness',
  'Dreamy & Ethereal',
  'Cozy & Intimate',
  'Romantic Garden Serenity',
  'Refreshing Natural Vitality',
  'Mystical Night Garden',
  'Quiet Luxury',
  'Cinematic Serenity',
  'Tropical Bliss',
];

export const SUASANA_OPTIONS = [
  'Random',
  'Morning',
  'Late Morning',
  'Afternoon',
  'Golden Hour',
  'Sunset',
  'Blue Hour',
  'Twilight',
  'Moonlight',
  'Deep Night',
  'Rainy',
  'After Rain',
  'Misty',
  'Dewy Freshness',
  'Candlelit',
  'Lanternlit',
  'Dreamlike',
  'Magical',
  'Quiet Overcast',
];

export const KATEGORI_OPTIONS = [
  'Random',
  'Spa Garden',
  'Traditional Chōzubachi',
  'Zen Water Feature',
  'Rainforest Spring Sanctuary',
  'Tea Ceremony Garden',
  'Modern Luxury Courtyard',
  'Botanical Hydro-Sanctuary',
];

export const DEKORASI_OPTIONS = [
  'Random',
  'Candle + Stone Lantern',
  'Smooth River Stones + Incense',
  'Moss Rocks + Wooden Ladle (Hishaku)',
  'Stepping Stones + Bonsai',
  'Cast Iron Kettle + Oil Lamp',
  'Floating Lotus Candles',
  'Bamboo Wind Chimes + Raked Gravel',
  'Hand-folded Washi Lanterns + Wet Pebbles',
  'Floating Candles + Flower Petals',
  'Ceramic Tea Set + Wooden Tray',
  'Hanging Lanterns + Cedar Screen',
  'Water Lily Leaves + Pebble Cluster',
  'Natural Driftwood + Moss',
  'Small Stone Pagoda + Ferns',
  'Glass Vessels + Spa Towels',
  'Wooden Bridge Detail + Lanterns',
  'Minimal Ceramic Ornaments',
  'Wild Botanical Accents',
  'No Decorative Objects',
];

export const FLOWER_OPTIONS = [
  'Random',
  'White Lotus',
  'Pink Water Lily',
  'Cherry Blossoms (Sakura)',
  'Frangipani (Plumeria)',
  'Wild Mountain Orchid',
  'Japanese Camellia (Tsubaki)',
  'Single White Peony',
  'Purple Water Iris',
  'Floating Gardenia Petals',
  'Hibiscus',
  'Bougainvillea',
  'Lavender',
  'Hydrangea',
  'Jasmine',
  'Magnolia',
  'Rose',
  'Tropical Mixed Flowers',
  'Wild Meadow Flowers',
  'No Flowers',
  'Mixed Seasonal Blossoms',
];

export const BASIN_OPTIONS = [
  'Random',
  'Hand-carved Granite Chōzubachi',
  'Weathered Basalt River Stone',
  'Tiered Travertine Water Basin',
  'Glazed Celadon Ceramic Bowl',
  'Hollowed Natural River Boulder',
  'Dark Volcanic Stone Vessel',
  'Polished Black Granite Basin',
  'Rough-hewn Slate Water Stone',
  'Carved Limestone Water Trough',
];

export const BASIN_SHAPE_OPTIONS = [
  'Random',
  'Perfect Round',
  'Perfect Oval',
  'Heart / Love',
  'Five-Point Star',
  'Six-Point Star',
  'Flower',
  'Leaf',
  'Crescent',
  'Hexagonal',
  'Square',
  'Rectangular',
  'Four-Lobed',
  'Organic Freeform',
] as const;

export type BasinShapeOption = typeof BASIN_SHAPE_OPTIONS[number];

export const BASIN_SHAPE_DESCRIPTIONS: Record<string, string> = {
  'Perfect Round': 'symmetrical perfect circular water basin with an impeccably even, smooth circular outer silhouette (strictly round, never oval, irregular, asymmetrical, or organically distorted)',
  'Perfect Oval': 'clearly elliptical oval water basin whose long and short axes are visibly different, exhibiting a smooth, symmetrical oval perimeter (strictly oval, never a circle)',
  'Heart / Love': 'carved heart-shaped water basin where the actual stone outer silhouette visibly forms two distinct upper lobes and a central indentation tapering to a gentle lower point (the physical basin body itself is sculpted as a heart, not a circular bowl with heart motifs)',
  'Five-Point Star': 'sculptural five-pointed star water basin whose outer silhouette clearly forms five distinct star points as part of the actual basin perimeter (the physical basin perimeter itself forms a five-pointed star, never replaced with a round bowl)',
  'Six-Point Star': 'six-pointed star water basin sculpted with six distinct star points defining the actual outer basin silhouette and rim (the physical stone body itself forms a six-pointed star, never a circular basin)',
  'Flower': 'multi-petaled floral-shaped water basin whose actual outer silhouette is sculpted with distinct petal-like lobes outlining a blossoming flower geometry (the vessel body itself is flower-shaped, not floral carvings inside a round bowl)',
  'Leaf': 'elongated botanical leaf-shaped water basin with a tapered pointed tip, graceful curved leaf margins, and an organic leaf perimeter defining the actual outer basin silhouette',
  'Crescent': 'crescent moon-shaped water basin with an elegant concave inner curve and arching convex outer curve defining the actual basin body silhouette',
  'Hexagonal': 'six-sided geometric hexagonal water basin with six distinct planar edges and softened corners defining the actual outer basin silhouette (strictly hexagonal, never round)',
  'Square': 'equilateral four-sided square stone water basin with four equal straight sides and distinct 90-degree corners defining the outer basin perimeter (strictly square geometry, not circular)',
  'Rectangular': 'elongated rectangular stone water trough with visibly longer length than width and crisp rectangular planar edges defining the outer basin silhouette (strictly rectangular trough)',
  'Four-Lobed': 'quatrefoil four-lobed water basin sculpted with four distinct symmetrical rounded lobes extending from the center to define the actual outer basin silhouette',
  'Organic Freeform': 'sculpted organic freeform stone basin with an intentionally asymmetrical, non-circular wabi-sabi silhouette following flowing geological contours (strictly avoiding any circular or generic geometry)',
};

export const BAMBOO_OPTIONS = [
  'Random',
  'Single Green Bamboo Kakehi Spout',
  'Rustic Shishi-odoshi (Water Rocker)',
  'Paired Bamboo Stalks',
  'Slender Bamboo Grove Cluster',
  'Weathered Bamboo Conduit Flume',
  'Minimalist Cylindrical Spout',
  'Curved Bamboo Water Feature',
  'Layered Multi-Tier Spout',
];

export const CAMERA_DISTANCE_OPTIONS = [
  'Random',
  'Extreme Close-Up',
  'Close-Up',
  'Medium Close-Up',
  'Medium Shot',
  'Medium Wide Shot',
  'Wide Shot',
  'Very Wide Shot',
] as const;

export type CameraDistanceOption = typeof CAMERA_DISTANCE_OPTIONS[number];

export const CAMERA_ANGLE_LOCKED = 'Close environmental perspective, slightly above basin level, 3/4 front view, natural shallow depth of field';

// Basin 3-Level Dimensions for intelligent random generation and prompt construction
export const BASIN_MATERIALS = [
  'natural dark river stone',
  'hand-chiselled speckled granite',
  'weathered porous basalt',
  'smooth honed travertine',
  'rough volcanic rock',
  'traditional glazed celadon ceramic',
  'ancient mossy limestone',
  'charcoal slate',
  'dense soapstone',
  'carved sandstone boulder',
];

export const BASIN_FORMS = [
  'shallow wide organic basin with a non-circular silhouette',
  'heart-shaped carved basin with softened lobes and a tapered lower point',
  'five-point star-shaped sculptural basin with softened rounded points',
  'six-lobed floral basin with petal-like contours',
  'leaf-shaped elongated basin with a tapered tip',
  'crescent-shaped basin with a smooth concave inner pool',
  'hexagonal basin with softened chamfered corners',
  'cross-shaped four-lobed basin with rounded arms',
  'deep asymmetrical natural hollow',
  'organic elongated oval',
  'two-tiered cascading water vessel',
  'sculpted octagonal chōzubachi',
  'naturally water-eroded hollowed boulder',
  'minimalist cylindrical basin',
  'irregular concave stone trough',
  'curved basin with gentle overflow lip',
];

export const BASIN_SURFACES = [
  'glistening wet reflective rim with crystalline water droplets',
  'velvety emerald moss clinging to the weathered outer rim',
  'smooth water-worn interior with subtle sedimentary mineral streaks',
  'rough textured chiselled exterior contrasting with a polished silky inner basin',
  'ancient lichen-dappled stone surface with faint patina',
  'dark water-saturated stone reflecting soft ambient sky light',
  'beaded moisture droplets on naturally cool rock contours',
];

// Bamboo variations
export const BAMBOO_VARIATIONS = [
  {
    position: 'Upper-right diagonal',
    description: 'A single angled green bamboo kakehi spout extending gracefully from the upper right, pouring a slender, crystal-clear laminar trickle into the basin',
  },
  {
    position: 'Left horizontal flume',
    description: 'A weathered golden-brown bamboo conduit resting horizontally on dark mossy stones to the left, releasing a rhythmic, gentle water spill',
  },
  {
    position: 'Foreground rustic shishi-odoshi',
    description: 'A traditional bamboo rocker (shishi-odoshi) poised just above the water level in the near mid-ground, resting silently filled with fresh spring water',
  },
  {
    position: 'Background vertical bamboo cluster',
    description: 'A cluster of tall, slender green bamboo canes rising vertically in the soft-focus background, framing the water feature with rhythmic vertical lines',
  },
  {
    position: 'Central minimalist bamboo spout',
    description: 'A cleanly cut cylindrical bamboo spout centered directly above the water surface, feeding continuous ripples into the still pool',
  },
  {
    position: 'Offset bamboo tripod stand',
    description: 'A rustic three-legged bamboo stand supporting a hollowed bamboo trough, directing a delicate mountain water stream into the stone bowl',
  },
];
