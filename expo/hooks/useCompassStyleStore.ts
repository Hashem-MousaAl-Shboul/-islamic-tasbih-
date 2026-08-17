import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import {
  type DialStyleId,
  type ArrowColorId,
  DIAL_STYLES,
  ARROW_COLORS,
} from '@/constants/compassThemes';

const DIAL_STYLE_KEY = 'compass_dial_style';
const ARROW_COLOR_KEY = 'compass_arrow_color';

const DEFAULT_DIAL_STYLE: DialStyleId = 'classic';
const DEFAULT_ARROW_COLOR: ArrowColorId = 'gold';

export const [CompassStyleProvider, useCompassStyleStore] = createContextHook(() => {
  const [dialStyleId, setDialStyleId] = useState<DialStyleId>(DEFAULT_DIAL_STYLE);
  const [arrowColorId, setArrowColorId] = useState<ArrowColorId>(DEFAULT_ARROW_COLOR);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [savedDial, savedArrow] = await Promise.all([
          AsyncStorage.getItem(DIAL_STYLE_KEY),
          AsyncStorage.getItem(ARROW_COLOR_KEY),
        ]);
        if (!mounted) return;
        if (savedDial && savedDial in DIAL_STYLES) {
          setDialStyleId(savedDial as DialStyleId);
        }
        if (savedArrow && savedArrow in ARROW_COLORS) {
          setArrowColorId(savedArrow as ArrowColorId);
        }
      } catch (e) {
        console.warn('[CompassStyleStore] Error loading saved style:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const changeDialStyle = useCallback(async (id: DialStyleId) => {
    setDialStyleId(id);
    try {
      await AsyncStorage.setItem(DIAL_STYLE_KEY, id);
    } catch (e) {
      console.warn('[CompassStyleStore] Error saving dial style:', e);
    }
  }, []);

  const changeArrowColor = useCallback(async (id: ArrowColorId) => {
    setArrowColorId(id);
    try {
      await AsyncStorage.setItem(ARROW_COLOR_KEY, id);
    } catch (e) {
      console.warn('[CompassStyleStore] Error saving arrow color:', e);
    }
  }, []);

  return useMemo(() => ({
    dialStyleId,
    arrowColorId,
    dialStyle: DIAL_STYLES[dialStyleId],
    arrowColor: ARROW_COLORS[arrowColorId],
    isLoading,
    changeDialStyle,
    changeArrowColor,
  }), [dialStyleId, arrowColorId, isLoading, changeDialStyle, changeArrowColor]);
});
