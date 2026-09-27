import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PromptGenerator } from './components/PromptGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { SeamlessLoopModal } from './components/SeamlessLoopModal';
import { KieKeyStatus, SeamlessLoopPromptResult, KieCreditInfo } from './types';
import { fetchKieStatus, requestSeamlessLoopPrompt } from './services/api';
import { Shield, Sparkles, Video, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'image' | 'video'>('prompts');
  const [keyStatus, setKeyStatus] = useState<KieKeyStatus>({ connected: false });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [creditInfo, setCreditInfo] = useState<KieCreditInfo>({
    balance: null,
    lastChecked: null,
  });

  // Cross-module states
  const [transferredPrompt, setTransferredPrompt] = useState<string>('');
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState<string>('');

  // Seamless loop prompt modal state
  const [isLoopModalOpen, setIsLoopModalOpen] = useState<boolean>(false);
  const [loopImageUrl, setLoopImageUrl] = useState<string>('');
  const [loopPromptData, setLoopPromptData] = useState<SeamlessLoopPromptResult | null>(null);
  const [isLoopLoading, setIsLoopLoading] = useState<boolean>(false);

  // Initialize Kie.ai key status
  useEffect(() => {
    async function checkKey() {
      const status = await fetchKieStatus();
      setKeyStatus(status);
    }
    checkKey();
  }, []);

  // Handler for Module 1 -> Module 2
  const handleSelectPromptForImage = (promptText: string) => {
    setTransferredPrompt(promptText);
    setActiveTab('image');
  };

  // Handler for Module 2 -> Seamless Loop Prompt
  const handleOpenSeamlessLoop = async (imageUrl: string, basePrompt: string) => {
    setLoopImageUrl(imageUrl);
    setIsLoopModalOpen(true);
    setIsLoopLoading(true);
    setLoopPromptData(null);

    try {
      const data = await requestSeamlessLoopPrompt(imageUrl, basePrompt);
      setLoopPromptData(data);
    } catch (err) {
      console.error('Seamless loop analysis error:', err);
    } finally {
      setIsLoopLoading(false);
    }
  };

  // Handler for Module 2 / Seamless Loop -> Module 3
  const handleUseInVideo = (imageUrl: string, promptText?: string) => {
    setVideoSourceImage(imageUrl);
    if (promptText) {
      setVideoPrompt(promptText);
    }
    setActiveTab('video');
  };

  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-900 font-sans antialiased selection:bg-stone-200">
      {/* Top Navigation & Global Kie.ai Key Management */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        keyStatus={keyStatus}
        creditInfo={creditInfo}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {activeTab === 'prompts' && (
          <PromptGenerator onSelectPromptForImage={handleSelectPromptForImage} />
        )}

        {activeTab === 'image' && (
          <ImageGenerator
            initialPrompt={transferredPrompt}
            keyStatus={keyStatus}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
            onOpenSeamlessLoop={handleOpenSeamlessLoop}
            onUseInVideo={(img, p) => handleUseInVideo(img, p)}
            lastGeneratedImage={lastGeneratedImage}
            setLastGeneratedImage={setLastGeneratedImage}
          />
        )}

        {activeTab === 'video' && (
          <VideoGenerator
            initialImage={videoSourceImage}
            initialPrompt={videoPrompt}
            lastGeneratedImage={lastGeneratedImage}
            keyStatus={keyStatus}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
          />
        )}
      </main>

      {/* Footer architectural note */}
      <footer className="mt-16 border-t border-stone-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-stone-500 sm:flex-row sm:px-6">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-stone-800">Kie Studio</span>
            <span>•</span>
            <span>Modular Visual Generation Pipeline</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5 text-stone-400" />
              <span>Kie.ai API Gateway Secured</span>
            </span>
            <span>•</span>
            <span>Zero Client-Side Secret Exposure</span>
          </div>
        </div>
      </footer>

      {/* Global Kie.ai API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        keyStatus={keyStatus}
        onKeyUpdated={(newStatus) => setKeyStatus(newStatus)}
        creditInfo={creditInfo}
        onCreditUpdated={(newCredit) => setCreditInfo(newCredit)}
      />

      {/* Seamless Loop Video Prompt Modal */}
      <SeamlessLoopModal
        isOpen={isLoopModalOpen}
        onClose={() => setIsLoopModalOpen(false)}
        imageUrl={loopImageUrl}
        loopData={loopPromptData}
        isLoading={isLoopLoading}
        onUseInVideo={(prompt, image) => handleUseInVideo(image, prompt)}
      />
    </div>
  );
}
