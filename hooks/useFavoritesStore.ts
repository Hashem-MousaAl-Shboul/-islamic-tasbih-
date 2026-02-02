import { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
};

interface FavoritesStore {
  favorites: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
}

const STORAGE_KEY = '@adhkar_favorites';

export const [FavoritesProvider, useFavoritesStore] = createContextHook<FavoritesStore>(() => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await storage.getItem(STORAGE_KEY);
        if (storedFavorites) {
          const favoritesArray = JSON.parse(storedFavorites);
          setFavorites(new Set(favoritesArray));
          console.log('[FavoritesStore] Loaded favorites:', favoritesArray.length);
        }
      } catch (error) {
        console.error('[FavoritesStore] Error loading favorites:', error);
      }
    };
    
    loadFavorites();
  }, []);

  const saveFavorites = useCallback(async (newFavorites: Set<string>) => {
    try {
      const favoritesArray = Array.from(newFavorites);
      await storage.setItem(STORAGE_KEY, JSON.stringify(favoritesArray));
      console.log('[FavoritesStore] Saved favorites:', favoritesArray.length);
    } catch (error) {
      console.error('[FavoritesStore] Error saving favorites:', error);
    }
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.has(id);
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        console.log('[FavoritesStore] Removed from favorites:', id);
      } else {
        newFavorites.add(id);
        console.log('[FavoritesStore] Added to favorites:', id);
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
    saveFavorites(new Set());
    console.log('[FavoritesStore] Cleared all favorites');
  }, [saveFavorites]);

  return useMemo(() => ({
    favorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  }), [favorites, isFavorite, toggleFavorite, clearFavorites]);
});
