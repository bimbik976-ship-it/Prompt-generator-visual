export interface ImageHistoryItem {
  id: string;
  prompt: string;
  modelId: string;
  modelName: string;
  aspectRatio: string;
  createdAt: number;
  images: string[];
}

const DB_NAME = 'kiegen-creative-studio-history';
const STORE = 'image-history';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open image history storage.'));
  });
}

export async function saveImageHistory(item: ImageHistoryItem): Promise<void> {
  if (!('indexedDB' in window)) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Unable to save image history.'));
  });
  db.close();
}

export async function getImageHistory(): Promise<ImageHistoryItem[]> {
  if (!('indexedDB' in window)) return [];
  const db = await openDb();
  const items = await new Promise<ImageHistoryItem[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.createdAt - a.createdAt));
    request.onerror = () => reject(request.error || new Error('Unable to read image history.'));
  });
  db.close();
  return items;
}

export async function deleteImageHistory(id: string): Promise<void> {
  if (!('indexedDB' in window)) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Unable to delete image history.'));
  });
  db.close();
}

export async function clearImageHistory(): Promise<void> {
  if (!('indexedDB' in window)) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Unable to clear image history.'));
  });
  db.close();
}
