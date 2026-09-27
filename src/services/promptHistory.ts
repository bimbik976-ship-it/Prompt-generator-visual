import { GeneratedPromptItem, PromptOptions } from '../types';

export interface PromptHistoryItem {
  id: string;
  createdAt: number;
  prompts: GeneratedPromptItem[];
  options: PromptOptions;
}

const STORAGE_KEY = 'kiegen_prompt_generator_history_v1';

export function getPromptHistory(): PromptHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePromptHistory(prompts: GeneratedPromptItem[], options: PromptOptions): PromptHistoryItem {
  // Do not persist the uploaded image's base64 payload in localStorage.
  // History keeps only lightweight reference metadata.
  const historyOptions: PromptOptions = {
    ...options,
    referenceImageData: undefined,
  };

  const item: PromptHistoryItem = {
    id: `prompt_history_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    prompts: prompts.map((p) => ({ ...p })),
    options: historyOptions,
  };
  const next = [item, ...getPromptHistory()].slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return item;
}

export function deletePromptHistory(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getPromptHistory().filter((item) => item.id !== id)));
}

export function clearPromptHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
