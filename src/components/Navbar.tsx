import React from 'react';
import { Key, Sparkles, Image as ImageIcon, Video, Coins } from 'lucide-react';
import { KieKeyStatus, KieCreditInfo } from '../types';

interface NavbarProps {
  activeTab: 'prompts' | 'image' | 'video';
  setActiveTab: (tab: 'prompts' | 'image' | 'video') => void;
  keyStatus: KieKeyStatus;
  creditInfo?: KieCreditInfo;
  onOpenKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  keyStatus,
  creditInfo,
  onOpenKeyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-stone-50/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-stone-100 shadow-sm">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-tight text-stone-900">Kie Studio</span>
              <span className="rounded-md bg-stone-200/70 px-2 py-0.5 text-[11px] font-medium tracking-wide text-stone-600 uppercase">
                Workflow Orchestrator
              </span>
            </div>
            <p className="text-xs text-stone-500">
              API Gateway Powered by Kie.ai
            </p>
          </div>
        </div>

        {/* Module Navigation */}
        <nav className="flex items-center rounded-xl bg-stone-200/60 p-1">
          <button
            id="nav-prompt-generator"
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'prompts'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span className="whitespace-nowrap font-medium">Prompt Generator</span>
          </button>

          <button
            id="nav-image-generator"
            onClick={() => setActiveTab('image')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'image'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
            <span className="whitespace-nowrap font-medium">Image Generator</span>
          </button>

          <button
            id="nav-video-generator"
            onClick={() => setActiveTab('video')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Video className="h-3.5 w-3.5 text-emerald-600" />
            <span className="whitespace-nowrap font-medium">Image → Video</span>
          </button>
        </nav>

        {/* Global Kie.ai API Key Management */}
        <div className="flex items-center space-x-2">
          {keyStatus.connected ? (
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="font-medium text-emerald-900">API Key Connected</span>
                  <span className="font-mono text-[11px] text-emerald-700 tracking-wider">
                    {keyStatus.maskedKey || '••••••••••••••••'}
                  </span>
                </div>
                <button
                  id="btn-change-key"
                  onClick={onOpenKeyModal}
                  className="ml-2 rounded-lg bg-white px-2.5 py-1 font-medium text-stone-700 shadow-xs border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Change / Replace Key
                </button>
              </div>

              {/* Balance trigger badge */}
              <button
                type="button"
                id="btn-nav-credit-balance"
                onClick={onOpenKeyModal}
                title={creditInfo?.lastChecked ? `Last checked: ${creditInfo.lastChecked}` : 'Click to check balance'}
                className="flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <Coins className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-stone-500">Balance:</span>
                <span className="font-mono font-semibold text-stone-900">
                  {creditInfo?.balance !== null && creditInfo?.balance !== undefined ? `${creditInfo.balance}` : '—'}
                </span>
              </button>
            </div>
          ) : (
            <button
              id="btn-connect-key"
              onClick={onOpenKeyModal}
              className="flex items-center space-x-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100/80 transition-colors cursor-pointer"
            >
              <Key className="h-3.5 w-3.5 text-amber-600" />
              <span>Connect Kie.ai API Key</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
