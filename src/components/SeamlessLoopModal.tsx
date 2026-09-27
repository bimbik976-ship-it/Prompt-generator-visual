import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, ArrowRight, Video, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SeamlessLoopPromptResult } from '../types';

interface SeamlessLoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  loopData: SeamlessLoopPromptResult | null;
  isLoading: boolean;
  onUseInVideo: (prompt: string, image: string) => void;
}

export const SeamlessLoopModal: React.FC<SeamlessLoopModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  loopData,
  isLoading,
  onUseInVideo,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (loopData?.customPrompt) {
      navigator.clipboard.writeText(loopData.customPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                IMAGE TO VIDEO — SEAMLESS LOOP PROMPT
              </h2>
              <p className="text-xs text-stone-500">
                AI visual element analysis for continuous, seam-free cyclic video generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="text-xs font-medium text-stone-700">
                Analyzing visual elements and calculating cyclic motion paths...
              </p>
              <p className="text-[11px] text-stone-400">
                Examining laminar water flow, surface tension ripples, and static camera constraints
              </p>
            </div>
          ) : loopData ? (
            <div className="space-y-4">
              {/* Image Preview and Detected Elements */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <img
                    src={imageUrl}
                    alt="Analyzed source"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
                </div>

                <div className="flex-1 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Identified Motion Opportunities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {loopData.identifiedElements.map((el, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-700 border border-stone-200/60"
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generated Seamless Loop Custom Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Custom Seamless Loop Prompt
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Strict Locked Camera & Cyclic Seam Matched
                  </span>
                </div>
                <div className="rounded-xl bg-stone-50 p-4 border border-stone-200 text-xs leading-relaxed text-stone-800 font-serif selection:bg-emerald-100">
                  {loopData.customPrompt}
                </div>
              </div>

              {/* Rule & Constraint Guarantee */}
              <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-200/70 text-[11px] text-emerald-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Loop Protocol Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Explicitly bans camera pan, zoom, tilt, or orbit. Forces the terminal frame physics to blend
                  identically into the initial frame for endless contemplation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-stone-500" />
                      <span>COPY PROMPT</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    onUseInVideo(loopData.customPrompt, imageUrl);
                    onClose();
                  }}
                  className="flex items-center space-x-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 transition-colors"
                >
                  <Video className="h-3.5 w-3.5 text-emerald-400" />
                  <span>USE IN IMAGE TO VIDEO</span>
                  <ArrowRight className="h-3 w-3 text-stone-300" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-stone-500">
              Unable to analyze image. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
