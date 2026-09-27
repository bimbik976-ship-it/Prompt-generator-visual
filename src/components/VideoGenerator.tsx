import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Upload,
  Sparkles,
  Play,
  Pause,
  Repeat,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Check,
  Copy,
  Layers,
  ArrowRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { VideoModelConfig, GenerationTask, KieKeyStatus } from '../types';
import {
  fetchVideoModels,
  requestVideoGeneration,
  pollTaskStatus,
} from '../services/api';

interface VideoGeneratorProps {
  initialImage: string | null;
  initialPrompt: string;
  lastGeneratedImage: string | null;
  keyStatus: KieKeyStatus;
  onOpenKeyModal: () => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  initialImage,
  initialPrompt,
  lastGeneratedImage,
  keyStatus,
  onOpenKeyModal,
}) => {
  const [models, setModels] = useState<VideoModelConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('kling-3.0-i2v');
  const [sourceImage, setSourceImage] = useState<string | null>(initialImage);
  const [videoPrompt, setVideoPrompt] = useState<string>(initialPrompt);
  const [duration, setDuration] = useState<number>(5);
  const [resolution, setResolution] = useState<string>('1080p');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [loopMode, setLoopMode] = useState<boolean>(true);
  const [motionStrength, setMotionStrength] = useState<number>(3);
  const [cameraStatic, setCameraStatic] = useState<boolean>(true);

  // Generation & Task states
  const [activeTask, setActiveTask] = useState<GenerationTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Video playback controls
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load video models
  useEffect(() => {
    async function loadModels() {
      const list = await fetchVideoModels();
      setModels(list);
      if (list.length > 0) {
        setSelectedModelId(list[0].id);
        setDuration(list[0].defaultDuration);
        setResolution(list[0].defaultResolution);
        setAspectRatio(list[0].defaultAspectRatio);
      }
    }
    loadModels();
  }, []);

  // Update when initialImage or initialPrompt props change
  useEffect(() => {
    if (initialImage) {
      setSourceImage(initialImage);
    }
  }, [initialImage]);

  useEffect(() => {
    if (initialPrompt) {
      setVideoPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  // Model-aware parameter adjustments
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const m = models.find((x) => x.id === modelId);
    if (m) {
      if (!m.durationOptions.includes(duration)) {
        setDuration(m.defaultDuration);
      }
      if (!m.resolutionOptions.includes(resolution)) {
        setResolution(m.defaultResolution);
      }
      if (!m.aspectRatioOptions.includes(aspectRatio)) {
        setAspectRatio(m.defaultAspectRatio);
      }
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPEG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUseGeneratedImage = () => {
    if (lastGeneratedImage) {
      setSourceImage(lastGeneratedImage);
      setErrorMessage(null);
    }
  };

  const handleGenerateVideo = async () => {
    if (!sourceImage) {
      setErrorMessage('Please upload or select a source image.');
      return;
    }
    if (!videoPrompt.trim()) {
      setErrorMessage('Please enter a video prompt.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    setGeneratedVideoUrl(null);

    try {
      const task = await requestVideoGeneration({
        modelId: selectedModelId,
        imageUrl: sourceImage,
        prompt: videoPrompt.trim(),
        duration,
        resolution,
        aspectRatio,
        loopMode,
        motionStrength,
      });

      setActiveTask(task);

      // Poll task status
      const pollInterval = setInterval(async () => {
        try {
          const updated = await pollTaskStatus(task.taskId);
          setActiveTask(updated);

          if (updated.status === 'SUCCESS' || updated.status === 'FAILED') {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            if (updated.status === 'SUCCESS' && updated.resultUrl) {
              setGeneratedVideoUrl(updated.resultUrl);
            } else if (updated.status === 'FAILED') {
              setErrorMessage(updated.error || 'The generation task failed. Please try again or select another model.');
            }
          }
        } catch {
          // Graceful polling fallback
        }
      }, 1800);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'The generation task failed. Please try again or select another model.');
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement('a');
    a.href = generatedVideoUrl;
    a.download = `kie-video-${Date.now()}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      {/* Module Title */}
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
              03
            </span>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              IMAGE TO VIDEO GENERATOR
            </h1>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Independent image-to-video synthesis and continuous cyclic environmental motion powered by Kie.ai.
          </p>
        </div>

        {selectedModel && (
          <div className="flex items-center space-x-2 rounded-xl bg-stone-100 px-3 py-1.5 text-xs text-stone-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-stone-900">{selectedModel.name}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">{selectedModel.badge}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Source Image & Model-Aware Controls (5 cols) */}
        <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center space-x-1.5">
              <Sliders className="h-3.5 w-3.5 text-stone-500" />
              <span>Video Model & Motion Parameters</span>
            </span>
            <span className="text-[11px] text-stone-400">Model-Aware UI</span>
          </div>

          {/* Source Image Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-700">Source Image</label>
              {lastGeneratedImage && (
                <button
                  type="button"
                  onClick={handleUseGeneratedImage}
                  className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors flex items-center space-x-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Use Generated Image</span>
                </button>
              )}
            </div>

            {sourceImage ? (
              <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-100 group">
                <img
                  src={sourceImage}
                  alt="Source for video"
                  className="h-36 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-800 backdrop-blur-xs hover:bg-white"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceImage(null)}
                    className="rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 p-6 text-center cursor-pointer hover:bg-stone-50 hover:border-stone-400 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-200/70 text-stone-600">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-medium text-stone-800">
                  Click to Upload Image or Drag and Drop
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">PNG, JPG, WebP up to 25MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Video Model Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-video-model" className="text-xs font-medium text-stone-700">
                Video Model
              </label>
              <span className="text-[10px] text-stone-400">Actual AI Model</span>
            </div>
            <select
              id="select-video-model"
              value={selectedModelId}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs font-medium text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
            {selectedModel && (
              <p className="text-[11px] text-stone-500 leading-relaxed pt-0.5">
                {selectedModel.description}
              </p>
            )}
          </div>

          {/* Model-Aware Duration Options */}
          {selectedModel && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-stone-700">Duration</label>
                <span className="text-[10px] text-stone-400">Model-Supported Durations</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {selectedModel.durationOptions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
                      duration === d
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    {d} Seconds
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Model-Aware Aspect Ratio & Resolution */}
          {selectedModel && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-xs text-stone-800"
                >
                  {selectedModel.aspectRatioOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-xs text-stone-800"
                >
                  {selectedModel.resolutionOptions.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Additional Model-Specific Settings */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
              Motion & Camera Tuning
            </span>

            {/* Seamless Loop Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-stone-800">Cyclic Loop Mode</span>
                <p className="text-[10px] text-stone-500">Enforces matching first and last frames</p>
              </div>
              <input
                type="checkbox"
                checked={loopMode}
                onChange={(e) => setLoopMode(e.target.checked)}
                className="h-4 w-4 rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </div>

            {/* Camera Lock */}
            <div className="flex items-center justify-between border-t border-stone-200/60 pt-2">
              <div>
                <span className="text-xs font-medium text-stone-800">Static Camera Lock</span>
                <p className="text-[10px] text-stone-500">Bans camera pan, tilt, zoom, and jitter</p>
              </div>
              <input
                type="checkbox"
                checked={cameraStatic}
                onChange={(e) => setCameraStatic(e.target.checked)}
                className="h-4 w-4 rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Video Prompt Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="video-prompt-input" className="text-xs font-medium text-stone-700">
                Video Prompt
              </label>
              <span className="text-[10px] text-stone-400">Motion instructions</span>
            </div>
            <textarea
              id="video-prompt-input"
              rows={4}
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="Describe subtle motion, cyclic ripples, laminar trickle, and stable lighting..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs leading-relaxed text-stone-800 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden"
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            id="btn-generate-video"
            onClick={handleGenerateVideo}
            disabled={isSubmitting || !sourceImage || !videoPrompt.trim()}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-stone-900 py-3 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                <span>
                  {activeTask?.status === 'SUBMITTED'
                    ? 'Submitting Task to Kie.ai...'
                    : 'Synthesizing Cyclic Video...'}
                </span>
              </>
            ) : (
              <>
                <Video className="h-4 w-4 text-emerald-400" />
                <span>GENERATE VIDEO</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Video Player & Output (7 cols) */}
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center space-x-1.5">
              <Video className="h-3.5 w-3.5 text-emerald-600" />
              <span>Generated Video Result</span>
            </span>

            {activeTask && (
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-stone-500">
                  Task ID: {activeTask.taskId.slice(-8)}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    activeTask.status === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeTask.status === 'FAILED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}
                >
                  {activeTask.status}
                </span>
              </div>
            )}
          </div>

          {/* Video Player Canvas */}
          <div className="relative flex-1 min-h-[360px] flex items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-950">
            {generatedVideoUrl ? (
              <div className="relative h-full w-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={generatedVideoUrl}
                  loop={isLooping}
                  muted={isMuted}
                  autoPlay
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="max-h-[460px] w-full rounded-lg object-contain shadow-md"
                />

                {/* Custom Overlay Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-stone-900/80 px-4 py-2 backdrop-blur-md text-white">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={togglePlay}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                    </button>
                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        isLooping ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-stone-400'
                      }`}
                    >
                      <Repeat className="h-3.5 w-3.5" />
                      <span>Loop {isLooping ? 'On' : 'Off'}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadVideo}
                    className="flex items-center space-x-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save Video</span>
                  </button>
                </div>
              </div>
            ) : isSubmitting ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">
                    {activeTask?.status === 'SUBMITTED' ? 'Submitting to Kie.ai Gateway...' : 'Generating Video...'}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Executing continuous motion simulation with {selectedModel?.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-stone-500 space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-stone-400">
                  <Video className="h-6 w-6" />
                </div>
                <p className="text-xs font-medium text-stone-300">No Video Generated Yet</p>
                <p className="max-w-xs text-[11px] text-stone-500">
                  Upload an image or use the generated image, set model-aware duration parameters, and click &quot;Generate Video&quot;.
                </p>
              </div>
            )}
          </div>

          {/* Action Row */}
          {generatedVideoUrl && (
            <div className="flex items-center justify-between border-t border-stone-100 pt-3">
              <div className="flex items-center space-x-2 text-xs text-stone-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Seamless Loop Video Ready ({duration}s, {resolution})</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerateVideo}
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate</span>
                </button>

                <button
                  onClick={handleDownloadVideo}
                  className="flex items-center space-x-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download MP4</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
