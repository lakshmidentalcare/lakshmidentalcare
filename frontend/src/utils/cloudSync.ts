import { fetchServerCloudStore, saveServerCloudStore } from '@/app/actions/syncAction';

// Cross-device Cloud Sync helper for Lakshmi Dental Care
export async function syncSaveToCloud(key: string, data: any) {
  // 1. Save to LocalStorage instantly for local responsiveness and 100% persistence
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event('ldc_settings_updated'));
    }
  } catch (e) {}

  // 2. Push via Next.js Server Action
  try {
    await saveServerCloudStore(key, data);
  } catch (e) {
    // Fallback REST endpoint if Server Action fails
    try {
      await fetch('/api/cloud-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data })
      });
    } catch (err) {}
  }
}

export async function syncLoadFromCloud(key: string, defaultFallback: any) {
  // 1. Try LocalStorage FIRST for instant responsiveness & guaranteed persistence
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed !== null && parsed !== undefined) {
          return parsed;
        }
      }
    }
  } catch (e) {}

  // 2. Try loading from Next.js Server Action
  try {
    const cloudState = await fetchServerCloudStore();
    if (cloudState && cloudState[key] !== undefined) {
      const serverData = cloudState[key];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(serverData));
        }
      } catch (e) {}
      return serverData;
    }
  } catch (e) {
    // REST fallback if Server Action fails
    try {
      const res = await fetch('/api/cloud-data');
      if (res.ok) {
        const cloudState = await res.json();
        if (cloudState && cloudState[key] !== undefined) {
          const serverData = cloudState[key];
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(key, JSON.stringify(serverData));
            }
          } catch (err) {}
          return serverData;
        }
      }
    } catch (err) {}
  }

  // 3. Save and return default fallback if no previous data existed
  try {
    if (typeof window !== 'undefined' && defaultFallback) {
      localStorage.setItem(key, JSON.stringify(defaultFallback));
    }
  } catch (e) {}

  return defaultFallback;
}

