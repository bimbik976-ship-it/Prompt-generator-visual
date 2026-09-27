import React, { useState } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Trash2,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { KieKeyStatus, KieCreditInfo } from '../types';
import { saveKieKey, disconnectKieKey, fetchKieCredit } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyStatus: KieKeyStatus;
  onKeyUpdated: (status: KieKeyStatus) => void;
  creditInfo: KieCreditInfo;
  onCreditUpdated: (info: KieCreditInfo) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  keyStatus,
  onKeyUpdated,
  creditInfo,
  onCreditUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Credit balance checking states
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);
  const [creditError, setCreditError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setErrorMessage('Please enter a valid Kie.ai API Key.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await saveKieKey(apiKeyInput.trim());
    setIsSubmitting(false);

    if (res.success) {
      setApiKeyInput('');
      setIsEditing(false);
      onKeyUpdated({
        connected: true,
        maskedKey: res.maskedKey || '••••••••••••••••',
        source: 'user',
      });
      // Reset credit balance on key change to ensure fresh verification
      onCreditUpdated({
        balance: null,
        lastChecked: null,
      });
      setCreditError(null);
      onClose();
    } else {
      setErrorMessage(res.message || 'Kie.ai API Key is invalid or not connected.');
    }
  };

  const handleDisconnect = async () => {
    setIsSubmitting(true);
    await disconnectKieKey();
    setIsSubmitting(false);
    onKeyUpdated({ connected: false });
    onCreditUpdated({
      balance: null,
      lastChecked: null,
    });
    setCreditError(null);
    setIsEditing(false);
  };

  const handleCheckBalance = async () => {
    if (!keyStatus.connected) {
      setCreditError('Invalid Kie.ai API Key');
      return;
    }

    setIsCheckingCredit(true);
    setCreditError(null);

    try {
      const res = await fetchKieCredit();
      if (res.success && res.balance !== undefined && res.lastChecked) {
        onCreditUpdated({
          balance: res.balance,
          lastChecked: res.lastChecked,
          warning: res.warning || null,
        });
        setCreditError(null);
      } else {
        setCreditError(res.error || 'Unable to check Kie.ai balance');
      }
    } catch (err: any) {
      setCreditError('Unable to check Kie.ai balance');
    } finally {
      setIsCheckingCredit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
              <Key className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">Global Kie.ai API Key</h2>
              <p className="text-xs text-stone-500">Shared across Image and Video generation modules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Section 1: Key Connection */}
          {keyStatus.connected && !isEditing ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-950">● API Key Connected</span>
                  </div>
                  <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    Active Gateway
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-white/80 px-3.5 py-2.5 border border-emerald-200/60">
                  <span className="font-mono text-xs tracking-widest text-stone-700">
                    {keyStatus.maskedKey || '••••••••••••••••'}
                  </span>
                  <span className="text-[11px] text-stone-500 flex items-center space-x-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" />
                    <span>Protected Server-Side</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  id="btn-replace-key-modal"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Change / Replace Key
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Disconnect Key</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="kie-api-key-input" className="block text-xs font-medium text-stone-700">
                  Kie.ai API Key
                </label>
                <div className="relative">
                  <input
                    id="kie-api-key-input"
                    type="password"
                    autoComplete="off"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter your Kie.ai API Key"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 pr-10 text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                  />
                  <Lock className="absolute right-3.5 top-3 h-4 w-4 text-stone-400" />
                </div>
                <p className="text-[11px] leading-relaxed text-stone-500">
                  The API key is securely routed through the server proxy and never stored in client-side code or browser storage.
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-1">
                {keyStatus.connected && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  id="btn-save-api-key"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 rounded-xl bg-stone-900 px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <span>{isSubmitting ? 'Saving...' : 'Save Key'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Section 2: KIE.AI CREDIT BALANCE (Placed directly below Key Connection) */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Kie.ai Credit Balance
                </h3>
              </div>
              <span className="text-[10px] text-stone-500 font-medium bg-stone-200/60 px-2 py-0.5 rounded-md">
                Manual Check
              </span>
            </div>

            {/* Balance Display */}
            <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-stone-200/80">
              <span className="text-xs font-medium text-stone-600">Balance:</span>
              <span className="text-sm font-bold font-mono text-stone-900 tracking-tight">
                {creditInfo.balance !== null ? `${creditInfo.balance} Credits` : '—'}
              </span>
            </div>

            {/* Manual Check Button */}
            <button
              type="button"
              id="btn-check-balance"
              onClick={handleCheckBalance}
              disabled={isCheckingCredit}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isCheckingCredit ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  <span>CHECKING BALANCE...</span>
                </>
              ) : (
                <>
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span>CHECK BALANCE</span>
                </>
              )}
            </button>

            {/* Last Checked Timestamp */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
              <span>Last checked:</span>
              <span className="font-mono text-stone-700 font-medium">
                {creditInfo.lastChecked || '—'}
              </span>
            </div>

            {/* Error Message */}
            {creditError && (
              <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{creditError}</span>
              </div>
            )}

            {/* Insufficient credits warning if balance is 0 or less */}
            {creditInfo.warning && !creditError && (
              <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{creditInfo.warning}</span>
              </div>
            )}
          </div>

          {/* Educational Gateway Clarification */}
          <div className="rounded-xl bg-stone-100/60 p-3.5 border border-stone-200/70 text-[11px] text-stone-600 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-medium text-stone-800">
              <ShieldCheck className="h-3.5 w-3.5 text-stone-700" />
              <span>Gateway Security Notice</span>
            </div>
            <p className="leading-relaxed">
              Kie.ai is the API provider and gateway, not an individual model. Your key authenticates third-party models
              (Flux, Kling, Wan, Seedream, Imagen, Veo) securely through server-side routing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
