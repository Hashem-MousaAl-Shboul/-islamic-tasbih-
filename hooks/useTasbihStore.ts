import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TasbihItem {
  id: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  count: number;
  targetCount: number;
  color: string;
  category: 'traditional' | 'morning' | 'evening' | 'after-prayer' | 'custom';
  isCompleted: boolean;
  completedAt?: Date;
  totalCompletions: number;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface TasbihSettings {
  theme: 'light' | 'dark';
  colorTheme: 'gold' | 'blue' | 'green' | 'purple' | 'teal' | 'rose';
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  autoReset: boolean;
  showTransliteration: boolean;
  showTranslation: boolean;
  hapticFeedback: boolean;
  completionSound: boolean;
  dailyGoal: number;

  animationsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

interface TasbihStats {
  totalCount: number;
  todayCount: number;
  streakDays: number;
  completedSessions: number;
  favoriteItem: string;
}

interface TasbihStore {
  tasbihItems: TasbihItem[];
  settings: TasbihSettings;
  stats: TasbihStats;
  selectedItemId: string;
  isLoading: boolean;
  addCustomTasbih: (tasbih: Omit<TasbihItem, 'id' | 'count' | 'isCompleted' | 'totalCompletions'>) => void;
  updateTasbihCount: (id: string, increment?: boolean) => void;
  resetTasbih: (id: string) => void;
  resetAllTasbih: () => void;
  resetAllData: () => Promise<void>;
  resetStats: () => void;
  deleteTasbih: (id: string) => void;
  restoreTasbih: (id: string) => void;
  setSelectedItem: (id: string) => void;
  updateSettings: (settings: Partial<TasbihSettings>) => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  getSelectedItem: () => TasbihItem | undefined;
  getTodayStats: () => { completed: number; total: number; percentage: number };
}

const DEFAULT_TASBIH_ITEMS: TasbihItem[] = [
  {
    id: '1',
    arabicText: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    count: 0,
    targetCount: 33,
    color: '#10B981',
    category: 'traditional',
    isCompleted: false,
    totalCompletions: 0,
  },
  {
    id: '2',
    arabicText: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    count: 0,
    targetCount: 33,
    color: '#3B82F6',
    category: 'traditional',
    isCompleted: false,
    totalCompletions: 0,
  },
  {
    id: '3',
    arabicText: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    count: 0,
    targetCount: 34,
    color: '#8B5CF6',
    category: 'traditional',
    isCompleted: false,
    totalCompletions: 0,
  },
  {
    id: '4',
    arabicText: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illa Allah',
    translation: 'There is no god but Allah',
    count: 0,
    targetCount: 100,
    color: '#F59E0B',
    category: 'traditional',
    isCompleted: false,
    totalCompletions: 0,
  },
  {
    id: '5',
    arabicText: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    count: 0,
    targetCount: 100,
    color: '#EF4444',
    category: 'traditional',
    isCompleted: false,
    totalCompletions: 0,
  },
];

const DEFAULT_SETTINGS: TasbihSettings = {
  theme: 'dark',
  colorTheme: 'gold',
  vibrationEnabled: true,
  soundEnabled: false,
  autoReset: false,
  showTransliteration: true,
  showTranslation: true,
  hapticFeedback: true,
  completionSound: true,
  dailyGoal: 300,

  animationsEnabled: true,
  fontSize: 'medium',
  reducedMotion: false,
};

const DEFAULT_STATS: TasbihStats = {
  totalCount: 0,
  todayCount: 0,
  streakDays: 0,
  completedSessions: 0,
  favoriteItem: '1',
};

const STORAGE_KEYS = {
  TASBIH_ITEMS: '@tasbih_items',
  SETTINGS: '@tasbih_settings',
  STATS: '@tasbih_stats',
  SELECTED_ITEM: '@tasbih_selected_item',
};

export const [TasbihProvider, useTasbihStore] = createContextHook<TasbihStore>(() => {
  const [tasbihItems, setTasbihItems] = useState<TasbihItem[]>(DEFAULT_TASBIH_ITEMS);
  const [settings, setSettings] = useState<TasbihSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<TasbihStats>(DEFAULT_STATS);
  const [selectedItemId, setSelectedItemId] = useState<string>('1');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        } catch (e) {
          console.error('Error parsing settings:', e);
        }
      }
      
      const [storedItems, storedStats, storedSelectedId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TASBIH_ITEMS),
        AsyncStorage.getItem(STORAGE_KEYS.STATS),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ITEM),
      ]);

      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          if (parsedItems && parsedItems.length > 0) {
            setTasbihItems(parsedItems);
          }
        } catch (e) {
          console.error('Error parsing items:', e);
        }
      }

      if (storedStats) {
        try {
          const parsedStats = JSON.parse(storedStats);
          setStats({ ...DEFAULT_STATS, ...parsedStats });
        } catch (e) {
          console.error('Error parsing stats:', e);
        }
      }

      if (storedSelectedId) {
        setSelectedItemId(storedSelectedId);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading tasbih data:', error);
      setIsLoading(false);
    }
  }, []);

  const saveData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TASBIH_ITEMS, JSON.stringify(tasbihItems)),
        AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)),
        AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)),
        AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ITEM, selectedItemId),
      ]);
    } catch (error) {
      console.error('Error saving tasbih data:', error);
    }
  }, [tasbihItems, settings, stats, selectedItemId]);

  const addCustomTasbih = useCallback((tasbih: Omit<TasbihItem, 'id' | 'count' | 'isCompleted' | 'totalCompletions'>) => {
    const newTasbih: TasbihItem = {
      ...tasbih,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      count: 0,
      isCompleted: false,
      totalCompletions: 0,
    };
    setTasbihItems(prev => [...prev, newTasbih]);
  }, []);

  const updateTasbihCount = useCallback((id: string, increment: boolean = true) => {
    console.log(`[TasbihStore] updateTasbihCount called - ID: ${id}, Increment: ${increment}`);
    let completionAchieved = false;
    let statsUpdate = false;
    let currentCount = 0;
    let targetCount = 0;
    let completedItemId: string | null = null;
    
    setTasbihItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          const newCount = increment ? item.count + 1 : Math.max(0, item.count - 1);
          const isCompleted = newCount >= item.targetCount;
          const wasCompleted = item.isCompleted;
          
          currentCount = newCount;
          targetCount = item.targetCount;
          
          if (isCompleted && !wasCompleted) {
            completionAchieved = true;
            completedItemId = id;
          }
          
          if (increment) {
            statsUpdate = true;
          } else if (item.count > 0) {
            statsUpdate = true;
          }
          
          return {
            ...item,
            count: newCount,
            isCompleted,
            completedAt: isCompleted && !wasCompleted ? new Date() : item.completedAt,
            totalCompletions: isCompleted && !wasCompleted ? item.totalCompletions + 1 : item.totalCompletions,
          };
        }
        return item;
      });
      
      return newItems;
    });
    
    if (statsUpdate) {
      setStats(prev => {
        const newTodayCount = increment ? prev.todayCount + 1 : Math.max(0, prev.todayCount - 1);
        const newTotalCount = increment ? prev.totalCount + 1 : Math.max(0, prev.totalCount - 1);
        
        console.log(`[TasbihStore] Stats updated - Today: ${newTodayCount}, Total: ${newTotalCount}, Completed Sessions: ${completionAchieved ? prev.completedSessions + 1 : prev.completedSessions}`);
        
        return {
          ...prev,
          totalCount: newTotalCount,
          todayCount: newTodayCount,
          completedSessions: completionAchieved ? prev.completedSessions + 1 : prev.completedSessions,
        };
      });
      
      console.log(`[TasbihStore] Count ${increment ? 'incremented' : 'decremented'}: ${currentCount}/${targetCount}`);
      
      if (completionAchieved && completedItemId) {
        console.log(`[TasbihStore] Dhikr completed: ${completedItemId}, navigating to next incomplete dhikr`);
        setTimeout(() => {
          setTasbihItems(currentItems => {
            const activeItems = currentItems.filter(item => !item.isDeleted);
            const currentIndex = activeItems.findIndex(item => item.id === completedItemId);
            
            const nextIncompleteItem = activeItems
              .slice(currentIndex + 1)
              .find(item => !item.isCompleted);
            
            const previousIncompleteItem = activeItems
              .slice(0, currentIndex)
              .find(item => !item.isCompleted);
            
            const nextItem = nextIncompleteItem || previousIncompleteItem;
            
            if (nextItem) {
              console.log(`[TasbihStore] Auto-navigating to: ${nextItem.id}`);
              setSelectedItemId(nextItem.id);
            } else {
              console.log(`[TasbihStore] All dhikr completed! Staying on current item`);
            }
            
            return currentItems;
          });
        }, 500);
      }
    }
  }, []);

  const resetTasbih = useCallback((id: string) => {
    setTasbihItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === id) {
          const countToRemove = item.count;
          console.log(`[TasbihStore] Resetting counter ${id}, removing ${countToRemove} from stats`);
          
          setStats(prevStats => ({
            ...prevStats,
            todayCount: Math.max(0, prevStats.todayCount - countToRemove),
            totalCount: Math.max(0, prevStats.totalCount - countToRemove),
          }));
          
          return { ...item, count: 0, isCompleted: false, completedAt: undefined };
        }
        return item;
      });
      
      return updatedItems;
    });
  }, []);

  const resetAllTasbih = useCallback(() => {
    setTasbihItems(prev => 
      prev.map(item => ({
        ...item,
        count: 0,
        isCompleted: false,
        completedAt: undefined,
      }))
    );
  }, []);

  const resetAllData = useCallback(async () => {
    try {
      // Reset all state to defaults
      setTasbihItems(DEFAULT_TASBIH_ITEMS);
      setSettings(DEFAULT_SETTINGS);
      setStats(DEFAULT_STATS);
      setSelectedItemId('1');
      
      // Clear storage
      const resetSettings = {
        ...DEFAULT_SETTINGS,
        vibrationEnabled: true,
        soundEnabled: true,
        theme: 'dark' as const,
        colorTheme: 'gold' as const,
        animationsEnabled: true,
        fontSize: 'medium' as const,
        reducedMotion: false
      };
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TASBIH_ITEMS, JSON.stringify(DEFAULT_TASBIH_ITEMS)),
        AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(resetSettings)),
        AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(DEFAULT_STATS)),
        AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ITEM, '1'),
      ]);
    } catch (error) {
      console.error('Error resetting all data:', error);
      throw error;
    }
  }, []);

  const resetStats = useCallback(() => {
    console.log('[TasbihStore] Resetting all statistics and counters to zero');
    // Reset all counters to zero
    setTasbihItems(prev => 
      prev.map(item => ({
        ...item,
        count: 0,
        isCompleted: false,
        completedAt: undefined,
        totalCompletions: 0,
      }))
    );
    // Reset statistics to default values
    setStats({
      totalCount: 0,
      todayCount: 0,
      streakDays: 0,
      completedSessions: 0,
      favoriteItem: '1',
    });
    console.log('[TasbihStore] Statistics reset complete');
  }, []);

  const deleteTasbih = useCallback((id: string) => {
    setTasbihItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isDeleted: true, deletedAt: new Date() }
          : item
      )
    );
    
    if (selectedItemId === id) {
      const activeItems = tasbihItems.filter(item => !item.isDeleted && item.id !== id);
      if (activeItems.length > 0) {
        setSelectedItemId(activeItems[0].id);
      }
    }
  }, [selectedItemId, tasbihItems]);

  const restoreTasbih = useCallback((id: string) => {
    setTasbihItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isDeleted: false, deletedAt: undefined }
          : item
      )
    );
  }, []);

  const setSelectedItem = useCallback((id: string) => {
    setSelectedItemId(id);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<TasbihSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getSelectedItem = useCallback(() => {
    const activeItems = tasbihItems.filter(item => !item.isDeleted);
    return activeItems.find(item => item.id === selectedItemId) || activeItems[0];
  }, [tasbihItems, selectedItemId]);

  const getTodayStats = useCallback(() => {
    const activeItems = tasbihItems.filter(item => !item.isDeleted);
    const completed = activeItems.filter(item => item.isCompleted).length;
    const total = activeItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    console.log(`[TasbihStore] getTodayStats - Completed: ${completed}/${total} (${percentage}%)`);
    return { completed, total, percentage };
  }, [tasbihItems]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataVersionRef = useRef<number>(0);
  const isLoadingRef = useRef<boolean>(true);
  isLoadingRef.current = isLoading;

  useEffect(() => {
    if (isLoadingRef.current) return;
    dataVersionRef.current += 1;
    const version = dataVersionRef.current;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (version === dataVersionRef.current) {
        saveData().catch(err => console.error('Auto-save error:', err));
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tasbihItems, settings, stats, selectedItemId, saveData]);



  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [loadData]);

  return useMemo(() => ({
    tasbihItems,
    settings,
    stats,
    selectedItemId,
    isLoading,
    addCustomTasbih,
    updateTasbihCount,
    resetTasbih,
    resetAllTasbih,
    resetAllData,
    resetStats,
    deleteTasbih,
    restoreTasbih,
    setSelectedItem,
    updateSettings,
    loadData,
    saveData,
    getSelectedItem,
    getTodayStats,
  }), [
    tasbihItems,
    settings,
    stats,
    selectedItemId,
    isLoading,
    addCustomTasbih,
    updateTasbihCount,
    resetTasbih,
    resetAllTasbih,
    resetAllData,
    resetStats,
    deleteTasbih,
    restoreTasbih,
    setSelectedItem,
    updateSettings,
    loadData,
    saveData,
    getSelectedItem,
    getTodayStats,
  ]);
});