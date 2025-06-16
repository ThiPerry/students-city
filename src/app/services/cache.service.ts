import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const CACHE_PREFIX = 'cache-';

@Injectable({ providedIn: 'root' })
export class CacheService {
  /** Sauvegarde une réponse dans le cache */
  async set<T>(key: string, data: T): Promise<void> {
    try {
      await Preferences.set({
        key: CACHE_PREFIX + key,
        value: JSON.stringify({ timestamp: Date.now(), data })
      });
    } catch (e) {
      console.warn('Cache save failed', e);
    }
  }


  async get<T>(key: string): Promise<T|null> {
    try {
      const { value } = await Preferences.get({ key: CACHE_PREFIX + key });
      if (!value) return null;
      const parsed = JSON.parse(value) as { timestamp: number; data: T };
      return parsed.data;
    } catch (e) {
      console.warn('Cache read failed', e);
      return null;
    }
  }
}
