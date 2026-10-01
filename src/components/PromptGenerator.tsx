import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Lock,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Sliders,
  Layers,
  Info,
  Compass,
  History,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Shapes,
} from 'lucide-react';
import { PromptOptions, GeneratedPromptItem } from '../types';
import {
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL_ID,
  BACKGROUND_OPTIONS,
  MOOD_OPTIONS,
  SUASANA_OPTIONS,
  KATEGORI_OPTIONS,
  DEKORASI_OPTIONS,
  FLOWER_OPTIONS,
  BASIN_OPTIONS,
  BASIN_SHAPE_OPTIONS,
  BAMBOO_OPTIONS,
  CAMERA_DISTANCE_OPTIONS,
} from '../data/promptOptions';
import { requestPrompts } from '../services/api';
import { PromptHistoryItem, getPromptHistory, savePromptHistory, deletePromptHistory, clearPromptHistory } from '../services/promptHistory';

interface PromptGeneratorProps {
  onSelectPromptForImage: (prompt: string) => void;
}

export const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  onSelectPromptForImage,
}) => {
  // Config state
  const [chatModel, setChatModel] = useState(DEFAULT_CHAT_MODEL_ID);
  const [background, setBackground] = useState('Random');
  const [mood, setMood] = useState('Random');
  const [suasana, setSuasana] = useState('Random');
  const [kategori, setKategori] = useState('Random');
  const [dekorasi, setDekorasi] = useState('Random');
  const [flower, setFlower] = useState('Random');
  const [basin, setBasin] = useState('Random');
  const [basinShape, setBasinShape] = useState('Random');
  const [bamboo, setBamboo] = useState('Random');
  const [cameraDistance, setCameraDistance] = useState('Random');
  const [referenceImageData, setReferenceImageData] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string>('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPromptItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<PromptHistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(getPromptHistory());
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    const options: PromptOptions = {
      chatModel,
      background,
      mood,
      suasana,
      kategori,
      dekorasi,
      flower,
      basin,
      basinShape,
      bamboo,
      cameraDistance,
      cameraAngle: cameraDistance,
      referenceImageData: referenceImageData || undefined,
      referenceImageName: referenceImageName || undefined,
    };

    try {
      const prompts = await requestPrompts(options);
      setGeneratedPrompts(prompts);
      const saved = savePromptHistory(prompts, options);
      setHistoryItems((prev) => [saved, ...prev].slice(0, 100));
      setGenerationCount((prev) => prev + 1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate prompts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
              01
            </span>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">PROMPT GENERATOR</h1>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Produces three distinctly architectural, non-repetitive image prompts with multi-level basin variation and fixed perspective DNA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {generationCount > 0 && (
            <div className="hidden sm:flex items-center space-x-2 rounded-xl bg-stone-100 px-3 py-1.5 text-xs text-stone-600">
              <Layers className="h-3.5 w-3.5 text-stone-500" />
              <span>Generation Cycle #{generationCount}</span>
            </div>
          )}
          <button type="button" onClick={() => setHistoryOpen(true)} className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50">
            <History className="h-3.5 w-3.5" />
            <span>History ({historyItems.length})</span>
          </button>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Parameter Selection */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-1 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="text-xs font-bold tracking-wider text-stone-800 uppercase flex items-center space-x-1.5">
              <Sliders className="h-3.5 w-3.5 text-stone-500" />
              <span>Scene Configuration</span>
            </span>
            <span className="text-[11px] text-stone-400 font-medium">Random Rule Compliant</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Optional Reference Image */}
            <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50/70 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-stone-600" />
                  <span className="font-medium text-stone-700">Reference Image</span>
                </div>
                <span className="text-[10px] text-stone-400">Optional</span>
              </div>
              <p className="text-[10px] leading-relaxed text-stone-500">Upload an image as visual guidance. AI creates a similar visual direction, not an identical copy.</p>
              {!referenceImageData ? (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-3 py-3 text-xs font-semibold text-stone-700 hover:bg-stone-50">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Reference Image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                        setErrorMessage('Reference image must be JPG, PNG, or WebP.');
                        e.currentTarget.value = '';
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        setErrorMessage('Reference image must be 10MB or smaller.');
                        e.currentTarget.value = '';
                        return;
                      }
                      setErrorMessage(null);
                      const reader = new FileReader();
                      reader.onload = () => {
                        setReferenceImageData(typeof reader.result === 'string' ? reader.result : null);
                        setReferenceImageName(file.name);
                      };
                      reader.readAsDataURL(file);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
              ) : (
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                  <img src={referenceImageData} alt="Reference preview" className="h-40 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="min-w-0 truncate text-[10px] font-medium text-stone-600">{referenceImageName || 'Reference image'}</span>
                    <button
                      type="button"
                      onClick={() => { setReferenceImageData(null); setReferenceImageName(''); }}
                      className="flex shrink-0 items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-[10px] font-semibold text-stone-600 hover:bg-stone-50"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Model — TEXT PROMPT GENERATION ONLY */}
            <div className="space-y-1.5">
              <label htmlFor="select-chat-model" className="font-medium text-stone-700">
                Chat Model
              </label>
              <select
                id="select-chat-model"
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              >
                {CHAT_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-stone-400">Text-to-image prompt generation only. This does not generate images.</p>
            </div>

            {/* Background */}
            <div className="space-y-1.5">
              <label htmlFor="select-background" className="font-medium text-stone-700">
                Background
              </label>
              <select
                id="select-background"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              >
                {BACKGROUND_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Mood */}
            <div className="space-y-1.5">
              <label htmlFor="select-mood" className="font-medium text-stone-700">
                Mood
              </label>
              <select
                id="select-mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              >
                {MOOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Suasana */}
            <div className="space-y-1.5">
              <label htmlFor="select-suasana" className="font-medium text-stone-700">
                Suasana
              </label>
              <select
                id="select-suasana"
                value={suasana}
                onChange={(e) => setSuasana(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              >
                {SUASANA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label htmlFor="select-kategori" className="font-medium text-stone-700">
                Kategori
              </label>
              <select
                id="select-kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              >
                {KATEGORI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Dekorasi */}
            <div className="space-y-1.5">
              <label htmlFor="select-dekorasi" className="font-medium text-stone-700">
                Dekorasi
              </label>
              <select
                id="select-dekorasi"
                value={dekorasi}
                onChange={(e) => setDekorasi(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              >
                {DEKORASI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Flower */}
            <div className="space-y-1.5">
              <label htmlFor="select-flower" className="font-medium text-stone-700">
                Flower
              </label>
              <select
                id="select-flower"
                value={flower}
                onChange={(e) => setFlower(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              >
                {FLOWER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Basin Material */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="select-basin" className="font-medium text-stone-700">
                  Basin Material
                </label>
                <span className="text-[10px] text-stone-400">Stone & Texture</span>
              </div>
              <select
                id="select-basin"
                value={basin}
                onChange={(e) => setBasin(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                {BASIN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Basin Shape Menu (Controls Actual Geometric Silhouette) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="select-basin-shape" className="font-medium text-stone-700 flex items-center space-x-1">
                  <Shapes className="h-3.5 w-3.5 text-stone-600" />
                  <span>Basin Shape</span>
                </label>
                {basinShape !== 'Random' ? (
                  <span className="inline-flex items-center rounded-md bg-stone-900 px-1.5 py-0.5 text-[10px] font-semibold text-white" title="Strict Shape Compliance: Explicit user selection strictly preserved across all 3 prompts">
                    Strict Explicit
                  </span>
                ) : referenceImageData ? (
                  <span className="inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200" title="Reference image basin shape used when shape is Random">
                    Ref Shape Priority
                  </span>
                ) : null}
              </div>
              <select
                id="select-basin-shape"
                value={basinShape}
                onChange={(e) => setBasinShape(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                {BASIN_SHAPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-stone-500 leading-tight">
                {basinShape !== 'Random'
                  ? `Strict silhouette: ${basinShape}. All 3 prompts strictly preserve this silhouette.`
                  : referenceImageData
                  ? 'Reference image determines basin silhouette when Random is selected.'
                  : 'Controls the actual geometric silhouette of the water basin.'}
              </p>
            </div>

            {/* Bamboo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="select-bamboo" className="font-medium text-stone-700">
                  Bamboo
                </label>
                <span className="text-[10px] text-stone-400">Hydro Dynamics</span>
              </div>
              <select
                id="select-bamboo"
                value={bamboo}
                onChange={(e) => setBamboo(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                {BAMBOO_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Distance Menu (Controls Camera Distance & Framing only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="select-camera-distance" className="font-medium text-stone-700 flex items-center space-x-1">
                  <Compass className="h-3.5 w-3.5 text-stone-600" />
                  <span>Camera Distance</span>
                </label>
                {referenceImageData && (
                  <span className="inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200" title="Reference image is the primary source for camera distance & framing">
                    Ref Image Priority
                  </span>
                )}
              </div>
              <select
                id="select-camera-distance"
                value={cameraDistance}
                onChange={(e) => setCameraDistance(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-stone-800 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              >
                {CAMERA_DISTANCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-stone-500 leading-tight">
                {referenceImageData
                  ? 'Reference Image is the primary source for Camera Distance & Framing across all 3 prompts.'
                  : 'Controls subject framing & distance only (not camera direction, tilt, or rotation).'}
              </p>
            </div>
          </div>

          {/* Random Rule Banner */}
          <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
            <strong>Strict Random Rule:</strong> Fixed selections are strictly preserved. Only parameters explicitly marked as &quot;Random&quot; will be creatively varied.
          </div>

          {/* Submit Action */}
          <button
            id="btn-generate-3-prompts"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-stone-900 py-3 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                <span>Synthesizing Scene Prompts...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>GENERATE 3 PROMPTS</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Prompts Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Prompt Output (Exactly 3 High-Variance Scenes)
            </span>
            {generatedPrompts.length > 0 && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center space-x-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Generate Again</span>
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {generatedPrompts.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200 text-stone-400">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-stone-800">Ready to Design Scenes</h2>
              <p className="mt-1 max-w-sm text-xs text-stone-500">
                Configure your garden parameters or keep them Random, then click &quot;Generate 3 Prompts&quot; to synthesize standalone visual scenes.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
                  <div className="h-4 w-28 rounded-md bg-stone-200" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded-md bg-stone-100" />
                    <div className="h-3 w-5/6 rounded-md bg-stone-100" />
                    <div className="h-3 w-4/6 rounded-md bg-stone-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {generatedPrompts.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="flex h-6 w-16 items-center justify-center rounded-md bg-stone-900 text-[11px] font-bold text-white uppercase tracking-wider">
                    PROMPT 0{item.index}
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {item.sceneDetails.composition}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(item.id, item.prompt)}
                    className="flex items-center space-x-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-stone-500" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSelectPromptForImage(item.prompt)}
                    className="flex items-center space-x-1.5 rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white hover:bg-stone-800 transition-colors"
                  >
                    <span>Use in Image Generator</span>
                    <ArrowRight className="h-3 w-3 text-stone-300" />
                  </button>
                </div>
              </div>

              {/* Standalone Prompt Output */}
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/70">
                <p className="text-xs leading-relaxed text-stone-800 font-serif selection:bg-amber-100">
                  {item.prompt}
                </p>
              </div>

              {/* Scene Design Dimensional Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 sm:grid-cols-5 pt-1">
                <div className="rounded-lg bg-stone-100/70 p-2">
                  <span className="block font-medium text-stone-500 text-[10px] uppercase">Basin Shape</span>
                  <span className="text-stone-800 font-semibold truncate block" title={item.sceneDetails.basinShape || 'Selected Silhouette'}>
                    {item.sceneDetails.basinShape || 'Selected Silhouette'}
                  </span>
                </div>
                <div className="rounded-lg bg-stone-100/70 p-2">
                  <span className="block font-medium text-stone-500 text-[10px] uppercase">Basin Material</span>
                  <span className="text-stone-800 font-medium truncate block" title={item.sceneDetails.basinDetails}>
                    {item.sceneDetails.basinDetails}
                  </span>
                </div>
                <div className="rounded-lg bg-stone-100/70 p-2">
                  <span className="block font-medium text-stone-500 text-[10px] uppercase">Bamboo Form</span>
                  <span className="text-stone-800 font-medium truncate block" title={item.sceneDetails.bambooPosition}>
                    {item.sceneDetails.bambooPosition}
                  </span>
                </div>
                <div className="rounded-lg bg-stone-100/70 p-2">
                  <span className="block font-medium text-stone-500 text-[10px] uppercase">Atmosphere & Light</span>
                  <span className="text-stone-800 font-medium truncate block" title={item.sceneDetails.lightingAndAtmosphere}>
                    {item.sceneDetails.lightingAndAtmosphere}
                  </span>
                </div>
                <div className="rounded-lg bg-stone-100/70 p-2">
                  <span className="block font-medium text-stone-500 text-[10px] uppercase">Camera Distance</span>
                  <span className="text-stone-800 font-medium truncate block" title={item.sceneDetails.cameraDistance || 'Medium Shot'}>
                    {item.sceneDetails.cameraDistance || 'Medium Shot'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setHistoryOpen(false)}>
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900"><History className="h-4 w-4" /> Prompt History</h2>
                <p className="mt-1 text-[11px] text-stone-500">Setiap hasil Generate 3 Prompts disimpan sebagai satu riwayat.</p>
              </div>
              <div className="flex items-center gap-2">
                {historyItems.length > 0 && <button type="button" onClick={() => { clearPromptHistory(); setHistoryItems([]); }} className="flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"><Trash2 className="h-3 w-3" /> Clear All</button>}
                <button type="button" onClick={() => setHistoryOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="overflow-y-auto p-4">
              {historyItems.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-stone-200 p-10 text-center text-xs text-stone-500">Belum ada riwayat. Generate 3 prompts terlebih dahulu.</div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((entry, historyIndex) => (
                    <div key={entry.id} className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-stone-800">Generation #{historyItems.length - historyIndex}</div>
                          <div className="text-[10px] text-stone-500">{new Date(entry.createdAt).toLocaleString()}</div>
                        </div>
                        <button type="button" onClick={() => { deletePromptHistory(entry.id); setHistoryItems((prev) => prev.filter((x) => x.id !== entry.id)); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Delete history"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="space-y-2">
                        {entry.prompts.map((item) => (
                          <div key={item.id} className="rounded-lg border border-stone-200 bg-white p-3">
                            <div className="mb-1 flex items-center justify-between"><span className="text-[10px] font-bold text-stone-500">PROMPT 0{item.index}</span><button type="button" onClick={() => onSelectPromptForImage(item.prompt)} className="text-[10px] font-semibold text-stone-700 hover:text-stone-950">Use in Image Generator →</button></div>
                            <p className="text-[11px] leading-relaxed text-stone-700">{item.prompt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
