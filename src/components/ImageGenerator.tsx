import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  Video,
  RefreshCw,
  Sliders,
  AlertCircle,
  ArrowRight,
  Layers,
  History,
  Trash2,
  X,
} from 'lucide-react';
import { ImageModelConfig, GenerationTask, KieKeyStatus } from '../types';
import {
  fetchImageModels,
  requestImageGeneration,
  pollTaskStatus,
} from '../services/api';
import { ImageHistoryItem, getImageHistory, saveImageHistory, deleteImageHistory, clearImageHistory } from '../services/imageHistory';

interface ImageGeneratorProps {
  initialPrompt?: string;
  keyStatus: KieKeyStatus;
  onOpenKeyModal: () => void;
  onOpenSeamlessLoop: (imageUrl: string, prompt: string) => void;
  onUseInVideo: (imageUrl: string, prompt?: string) => void;
  lastGeneratedImage: string | null;
  setLastGeneratedImage: (url: string | null) => void;
}


function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number) { return [value & 0xff, (value >>> 8) & 0xff]; }
function u32(value: number) { return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]; }

async function downloadImageBlob(url: string): Promise<Blob> {
  const response = await fetch(`/api/download-image?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error(`Image download failed (${response.status}).`);
  return response.blob();
}

async function downloadAllAsZip(urls: string[]) {
  const files = await Promise.all(urls.map(async (url, index) => {
    const blob = await downloadImageBlob(url);
    return { name: `kie-generated-image-${index + 1}.png`, bytes: new Uint8Array(await blob.arrayBuffer()) };
  }));
  const encoder = new TextEncoder();
  const chunks: number[] = [];
  const central: number[][] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.bytes);
    const local = [0x50,0x4b,0x03,0x04, ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(file.bytes.length), ...u32(file.bytes.length), ...u16(name.length), ...u16(0), ...Array.from(name), ...Array.from(file.bytes)];
    chunks.push(...local);
    central.push([0x50,0x4b,0x01,0x02, ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(file.bytes.length), ...u32(file.bytes.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...Array.from(name)]);
    offset += local.length;
  }
  const centralOffset = offset;
  for (const entry of central) chunks.push(...entry);
  const centralSize = offset = chunks.length - centralOffset;
  chunks.push(0x50,0x4b,0x05,0x06, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(centralSize), ...u32(centralOffset), ...u16(0));
  const blob = new Blob([new Uint8Array(chunks)], { type: 'application/zip' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `kie-generated-images-${Date.now()}.zip`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  initialPrompt = '',
  keyStatus,
  onOpenKeyModal,
  onOpenSeamlessLoop,
  onUseInVideo,
  lastGeneratedImage,
  setLastGeneratedImage,
}) => {
  const [models, setModels] = useState<ImageModelConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('gpt-image-2');
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [quality, setQuality] = useState<string>('standard');
  const [imageCount, setImageCount] = useState<number>(1);
  const [activeTasks, setActiveTasks] = useState<GenerationTask[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>(lastGeneratedImage ? [lastGeneratedImage] : []);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<ImageHistoryItem[]>([]);

  const refreshHistory = async () => {
    try { setHistoryItems(await getImageHistory()); } catch (err) { console.warn('Unable to load image history:', err); }
  };

  useEffect(() => { void refreshHistory(); }, []);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    async function loadModels() {
      const list = await fetchImageModels();
      setModels(list);
      if (list.length > 0) {
        setSelectedModelId(list[0].id);
        setAspectRatio(list[0].defaultAspectRatio);
      }
    }
    loadModels();
  }, []);

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];
  const completedCount = generatedImages.length;
  const processingCount = activeTasks.filter((t) => t.status === 'SUBMITTED' || t.status === 'PROCESSING').length;

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const m = models.find((x) => x.id === modelId);
    if (m && !m.supportedAspectRatios.includes(aspectRatio)) setAspectRatio(m.defaultAspectRatio);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please enter an image prompt.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    setGeneratedImages([]);
    setLastGeneratedImage(null);
    setActiveTasks([]);

    try {
      const batch = await requestImageGeneration({
        modelId: selectedModelId,
        prompt: prompt.trim(),
        aspectRatio,
        quality,
        count: imageCount,
      });

      setActiveTasks(batch.tasks);

      const pending = new Map(batch.tasks.map((task) => [task.taskId, task]));
      const results = new Map<string, string>();
      let stopped = false;

      const pollAll = async () => {
        if (stopped) return;
        const tasks = Array.from(pending.values());
        if (tasks.length === 0) return;

        const updates = await Promise.all(tasks.map(async (task) => {
          try {
            return await pollTaskStatus(task.taskId);
          } catch (err) {
            return { ...task, status: 'FAILED' as const, error: err instanceof Error ? err.message : 'Failed to retrieve task status.' };
          }
        }));

        for (const updated of updates) {
          if (updated.status === 'SUCCESS' && updated.resultUrl) {
            results.set(updated.taskId, updated.resultUrl);
            pending.delete(updated.taskId);
          } else if (updated.status === 'FAILED') {
            pending.delete(updated.taskId);
          }
        }

        const orderedImages = batch.tasks
          .map((task) => results.get(task.taskId))
          .filter((url): url is string => Boolean(url));
        setGeneratedImages(orderedImages);
        if (orderedImages[0]) setLastGeneratedImage(orderedImages[0]);
        setActiveTasks(updates);

        if (pending.size === 0) {
          stopped = true;
          setIsSubmitting(false);
          const failures = updates.filter((t) => t.status === 'FAILED');
          if (orderedImages.length > 0) {
            try {
              await saveImageHistory({
                id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                prompt: prompt.trim(),
                modelId: selectedModelId,
                modelName: selectedModel?.name || selectedModelId,
                aspectRatio,
                createdAt: Date.now(),
                images: orderedImages,
              });
              await refreshHistory();
            } catch (historyError) {
              console.warn('Unable to save image history:', historyError);
            }
          }
          if (failures.length > 0) {
            setErrorMessage(
              `${orderedImages.length} of ${batch.tasks.length} image${batch.tasks.length > 1 ? 's' : ''} generated successfully. ${failures.length} task${failures.length > 1 ? 's' : ''} failed.`
            );
          }
          return;
        }

        window.setTimeout(pollAll, 3000);
      };

      void pollAll();

      window.setTimeout(() => {
        if (!stopped) {
          stopped = true;
          setIsSubmitting(false);
          setErrorMessage('Kie.ai image generation timed out after 15 minutes. Completed images remain available.');
        }
      }, 15 * 60 * 1000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'The generation task failed. Please try again or select another model.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
  };

  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleDownload = async (url: string, index: number) => {
    try {
      const blob = await downloadImageBlob(url);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `kie-generated-image-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to download image.');
    }
  };

  const handleDownloadAll = async () => {
    if (!generatedImages.length || isDownloadingAll) return;
    setIsDownloadingAll(true);
    try {
      await downloadAllAsZip(generatedImages);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to download all images.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">02</span>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">IMAGE GENERATOR</h1>
          </div>
          <p className="mt-1 text-xs text-stone-500">Independent AI image synthesis powered by Kie.ai third-party model gateway.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setHistoryOpen(true)} className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50">
            <History className="h-3.5 w-3.5" />
            <span>History</span>
            {historyItems.length > 0 && <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px]">{historyItems.length}</span>}
          </button>
          {selectedModel && (
          <div className="flex items-center space-x-2 rounded-xl bg-stone-100 px-3 py-1.5 text-xs text-stone-700">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-semibold text-stone-900">{selectedModel.name}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">{selectedModel.badge}</span>
          </div>
          )}
        </div>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4" onMouseDown={(e) => { if (e.currentTarget === e.target) setHistoryOpen(false); }}>
          <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div><h2 className="text-sm font-bold text-stone-900">Prompt to Image History</h2><p className="mt-0.5 text-[11px] text-stone-500">Saved prompts and generated images from this browser.</p></div>
              <div className="flex items-center gap-2">
                {historyItems.length > 0 && <button type="button" onClick={async () => { if (window.confirm('Delete all Prompt to Image history?')) { await clearImageHistory(); await refreshHistory(); } }} className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" />Clear All</button>}
                <button type="button" onClick={() => setHistoryOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {historyItems.length === 0 ? <div className="py-16 text-center text-xs text-stone-400"><History className="mx-auto mb-3 h-8 w-8" /><p>No image history yet.</p></div> : <div className="space-y-4">{historyItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-stone-200 p-3">
                  <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-semibold text-stone-800">{item.modelName} • {item.aspectRatio} • {item.images.length} image{item.images.length > 1 ? 's' : ''}</p><p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-stone-600">{item.prompt}</p><p className="mt-1 text-[10px] text-stone-400">{new Date(item.createdAt).toLocaleString()}</p></div><button type="button" onClick={async () => { await deleteImageHistory(item.id); await refreshHistory(); }} className="shrink-0 rounded-lg p-2 text-rose-500 hover:bg-rose-50" title="Delete history item"><Trash2 className="h-4 w-4" /></button></div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{item.images.map((url, i) => <div key={`${item.id}-${i}`} className="group relative overflow-hidden rounded-lg border border-stone-200 bg-stone-50"><img src={url} alt={`History image ${i + 1}`} className="aspect-square w-full object-cover" referrerPolicy="no-referrer" /><button type="button" onClick={() => handleDownload(url, i)} className="absolute bottom-2 right-2 rounded-lg bg-stone-900/80 px-2 py-1 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 sm:opacity-100">Download</button></div>)}</div>
                </div>
              ))}</div>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center space-x-1.5">
              <Sliders className="h-3.5 w-3.5 text-stone-500" /><span>Model & Synthesis Settings</span>
            </span>
            <span className="text-[11px] text-stone-400">Gateway: Kie.ai</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-image-model" className="text-xs font-medium text-stone-700">Image Model</label>
              <span className="text-[10px] text-stone-400">Actual AI Model</span>
            </div>
            <select id="select-image-model" value={selectedModelId} onChange={(e) => handleModelChange(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs font-medium text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden">
              {models.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.category})</option>)}
            </select>
            {selectedModel && <p className="text-[11px] text-stone-500 leading-relaxed pt-0.5">{selectedModel.description}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="select-aspect-ratio" className="text-xs font-medium text-stone-700">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-1.5">
              {selectedModel?.supportedAspectRatios.map((ratio) => (
                <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`rounded-lg py-1.5 text-xs font-medium transition-all ${aspectRatio === ratio ? 'bg-stone-900 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'}`}>{ratio}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-700">Number of Images</label>
              <span className="text-[10px] text-stone-400">1 prompt → {imageCount} Kie.ai task{imageCount > 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((count) => (
                <button key={count} type="button" onClick={() => setImageCount(count)} className={`rounded-lg py-2 text-xs font-semibold transition-all ${imageCount === count ? 'bg-stone-900 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'}`}>
                  {count}
                </button>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-stone-400">Each image is a separate real Kie.ai generation task, so credits are charged per generated image.</p>
          </div>

          {selectedModel?.qualityOptions && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700">Quality Preset</label>
              <div className="flex space-x-2">{selectedModel.qualityOptions.map((q) => <button key={q} type="button" onClick={() => setQuality(q)} className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all ${quality === q ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{q}</button>)}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="image-prompt-input" className="text-xs font-medium text-stone-700">Prompt</label>
              <span className="text-[10px] text-stone-400">Accepts ANY image prompt</span>
            </div>
            <textarea id="image-prompt-input" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter or paste your image prompt here..." className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs leading-relaxed text-stone-800 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden" />
          </div>

          {errorMessage && <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" /><span>{errorMessage}</span></div>}

          <button id="btn-generate-image" onClick={handleGenerate} disabled={isSubmitting || !prompt.trim() || !keyStatus.connected} className="w-full flex items-center justify-center space-x-2 rounded-xl bg-stone-900 py-3 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer">
            {isSubmitting ? <><RefreshCw className="h-4 w-4 animate-spin text-blue-400" /><span>Generating {imageCount} Image{imageCount > 1 ? 's' : ''}...</span></> : <><ImageIcon className="h-4 w-4 text-blue-400" /><span>GENERATE {imageCount > 1 ? `${imageCount} IMAGES` : 'IMAGE'}</span></>}
          </button>
          {!keyStatus.connected && <button type="button" onClick={onOpenKeyModal} className="w-full rounded-xl border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-800">CONNECT KIE.AI API KEY</button>}
        </div>

        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center space-x-1.5"><ImageIcon className="h-3.5 w-3.5 text-blue-500" /><span>Generated Images</span></span>
            <div className="flex items-center gap-2 text-[10px] text-stone-500"><Layers className="h-3.5 w-3.5" /><span>{completedCount}/{imageCount} complete</span>{processingCount > 0 && <span className="text-amber-600">• {processingCount} processing</span>}</div>
          </div>

          <div className={`relative min-h-[360px] rounded-xl border border-stone-200 bg-stone-900/5 p-2 ${generatedImages.length > 1 ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'flex items-center justify-center'}`}>
            {generatedImages.length > 0 ? generatedImages.map((url, index) => (
              <div key={`${url}-${index}`} className="group relative flex min-h-[170px] items-center justify-center overflow-hidden rounded-lg bg-white border border-stone-200">
                <img src={url} alt={`Generated AI result ${index + 1}`} className="max-h-[460px] max-w-full rounded-lg object-contain shadow-md" referrerPolicy="no-referrer" />
                <div className="absolute top-2 left-2 rounded-md bg-stone-900/75 px-2 py-1 text-[10px] font-semibold text-white">IMAGE {index + 1}</div>
                <button onClick={() => handleDownload(url, index)} className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity" title={`Download Image ${index + 1}`}><Download className="h-4 w-4" /></button>
              </div>
            )) : isSubmitting ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3"><div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" /><div className="space-y-1"><p className="text-xs font-semibold text-stone-800">Generating {imageCount} image{imageCount > 1 ? 's' : ''}...</p><p className="text-[11px] text-stone-500">Creating {imageCount} real Kie.ai task{imageCount > 1 ? 's' : ''} in parallel using {selectedModel?.name}</p></div></div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-2"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"><ImageIcon className="h-6 w-6" /></div><p className="text-xs font-medium text-stone-600">No Image Generated Yet</p><p className="max-w-xs text-[11px] text-stone-400">Enter one prompt and choose 1–4 images. Each image is generated by a real Kie.ai task.</p></div>
            )}
          </div>

          {generatedImages.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button id="btn-create-seamless-loop" onClick={() => onOpenSeamlessLoop(generatedImages[0], prompt)} className="flex items-center justify-center space-x-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100/80 transition-colors shadow-2xs"><Sparkles className="h-4 w-4 text-emerald-600" /><span>CREATE SEAMLESS LOOP PROMPT</span></button>
                <button id="btn-use-in-video" onClick={() => onUseInVideo(generatedImages[0], prompt)} className="flex items-center justify-center space-x-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-2xs"><Video className="h-4 w-4 text-emerald-400" /><span>USE IN IMAGE TO VIDEO</span><ArrowRight className="h-3.5 w-3.5 text-stone-400" /></button>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <button onClick={handleCopy} className="flex items-center space-x-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors">{copiedPrompt ? <><Check className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-700">Prompt Copied</span></> : <><Copy className="h-3.5 w-3.5 text-stone-500" /><span>Copy Prompt</span></>}</button>
                <button onClick={() => void handleDownloadAll()} className="flex items-center space-x-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"><Download className="h-3.5 w-3.5 text-stone-500" /><span>{isDownloadingAll ? 'Preparing ZIP...' : 'Download All Images'}</span></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
