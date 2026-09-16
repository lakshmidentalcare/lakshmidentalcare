import { fetchServerCloudStore, saveServerCloudStore } from '@/app/actions/syncAction';
import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';

// Cross-device Cloud Sync helper for Lakshmi Dental Care
export async function syncSaveToCloud(key: string, data: any) {
  // 1. Save to LocalStorage instantly for local responsiveness and 100% persistence
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event('ldc_settings_updated'));
    }
  } catch (e) {}

  // 2. Direct client-side Supabase write if available
  try {
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('ldc_clinic_store')
        .upsert({
          id: key,
          data: data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('Client direct supabase sync save failed, using server action:', err);
  }

  // 3. Push via Next.js Server Action
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
  let localFound = null;
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed !== null && parsed !== undefined) {
          localFound = parsed;
        }
      }
    }
  } catch (e) {}

  // 2. Try loading from direct Supabase client
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('ldc_clinic_store')
        .select('data')
        .eq('id', key)
        .maybeSingle();
      if (!error && data && data.data !== undefined) {
        const serverData = data.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(serverData));
        }
        return serverData;
      }
    }
  } catch (err) {
    console.warn('Direct supabase load notice:', err);
  }

  // 3. If local exists, return it
  if (localFound !== null) {
    return localFound;
  }

  // 4. Try loading from Next.js Server Action
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

  // 5. Save and return default fallback if no previous data existed
  try {
    if (typeof window !== 'undefined' && defaultFallback) {
      localStorage.setItem(key, JSON.stringify(defaultFallback));
    }
  } catch (e) {}

  return defaultFallback;
}
