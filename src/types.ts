export interface KieKeyStatus {
  connected: boolean;
  maskedKey?: string;
  source?: 'env' | 'user';
}

export interface KieCreditInfo {
  balance: number | null;
  lastChecked: string | null;
  error?: string | null;
  warning?: string | null;
}

export interface ImageModelConfig {
  id: string;
  /** Actual Kie.ai model identifier used by the server-side Market API. */
  kieModelId?: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  supportedAspectRatios: string[];
  defaultAspectRatio: string;
  qualityOptions?: string[];
  supportsNegativePrompt?: boolean;
}

export interface VideoModelConfig {
  id: string;
  /** Actual Kie.ai Image-to-Video model identifier used by the server. */
  kieModelId?: string;
  name: string;
  badge: string;
  description: string;
  durationOptions: number[]; // in seconds
  defaultDuration: number;
  resolutionOptions: string[];
  defaultResolution: string;
  aspectRatioOptions: string[];
  defaultAspectRatio: string;
  supportsLoopMode?: boolean;
  supportsMotionStrength?: boolean;
  supportsCameraStatic?: boolean;
  supportsAudio?: boolean;
}

export interface ChatModelConfig {
  id: string;
  name: string;
  badge?: string;
  description: string;
}

export interface PromptOptions {
  chatModel?: string; // UI aliases: 'gpt-5.5' | 'gpt-5.6' | 'gpt-6-astra'
  background: string;
  mood: string;
  suasana?: string;
  kategori: string;
  dekorasi: string;
  flower: string;
  basin: string;
  basinShape?: string; // Controls actual outer geometric silhouette of water basin
  bamboo?: string;
  cameraAngle?: string;
  cameraDistance?: string; // Controls camera distance & framing only
  referenceImageData?: string; // optional data URL sent server-side for visual analysis
  referenceImageName?: string;
}

export interface GeneratedPromptItem {
  id: string;
  index: number;
  title: string;
  prompt: string;
  chatModelUsed?: string;
  sceneDetails: {
    composition: string;
    bambooPosition: string;
    basinDetails: string;
    basinShape?: string;
    lightingAndAtmosphere: string;
    focalPoint: string;
    cameraDistance?: string;
  };
  timestamp: number;
}

export interface GenerationTask {
  taskId: string;
  type: 'image' | 'video';
  modelId: string;
  status: 'SUBMITTED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  prompt: string;
  resultUrl?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
  aspectRatio?: string;
  duration?: number;
  sourceImageUrl?: string;
}

export interface ImageGenerationBatch {
  batchId: string;
  type: 'image';
  modelId: string;
  prompt: string;
  count: number;
  tasks: GenerationTask[];
  createdAt: number;
}

export interface SeamlessLoopPromptResult {
  customPrompt: string;
  identifiedElements: string[];
  loopGuidelines: string;
}
