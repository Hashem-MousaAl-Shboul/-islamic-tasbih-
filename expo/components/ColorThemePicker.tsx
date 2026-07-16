import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Image,
  Alert,
  Pressable,
  type ImageStyle,
} from 'react-native';
import { X, Check, ImageIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, ColorThemeKey } from '@/theme/ThemeProvider';
import { Colors } from '@/constants/colors';
import i18n from '@/constants/translations';
import type { BackgroundThemeKey } from '@/hooks/useTasbihStore';

interface ColorThemePickerProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: ColorThemeKey;
  onSelectTheme: (theme: ColorThemeKey) => void;
  currentBackground?: BackgroundThemeKey;
  customBackgroundImage?: string | null;
  onSelectBackground?: (background: BackgroundThemeKey, imageUri?: string | null) => void;
}

interface ColorOption {
  key: ColorThemeKey;
  name: string;
  colors: [string, string];
}

interface BackgroundOption {
  key: BackgroundThemeKey;
  name: string;
  colors: [string, string];
  type: 'solid' | 'gradient' | 'image';
}

const colorOptions: ColorOption[] = [
  { key: 'gold', name: 'gold', colors: [Colors.accent.gold.start, Colors.accent.gold.end] },
  { key: 'blue', name: 'blue', colors: [Colors.accent.blue.start, Colors.accent.blue.end] },
  { key: 'green', name: 'green', colors: [Colors.accent.green.start, Colors.accent.green.end] },
  { key: 'purple', name: 'purple', colors: [Colors.accent.purple.start, Colors.accent.purple.end] },
  { key: 'teal', name: 'teal', colors: [Colors.accent.teal.start, Colors.accent.teal.end] },
  { key: 'rose', name: 'rose', colors: [Colors.accent.rose.start, Colors.accent.rose.end] },
];

const backgroundOptions: BackgroundOption[] = [
  { key: 'default', name: 'defaultBackground', colors: ['#F7F4EE', '#F7F4EE'], type: 'solid' },
  { key: 'gold', name: 'warmGold', colors: ['#FFF9E6', '#F5E6C8'], type: 'gradient' },
  { key: 'blue', name: 'calmBlue', colors: ['#EEF5FF', '#D6E8FA'], type: 'gradient' },
  { key: 'green', name: 'softGreen', colors: ['#E8F6F0', '#D0E9DD'], type: 'gradient' },
  { key: 'purple', name: 'lightPurple', colors: ['#F5F0FF', '#E8DDFB'], type: 'gradient' },
  { key: 'teal', name: 'freshTeal', colors: ['#E6FFFB', '#CFF5EF'], type: 'gradient' },
  { key: 'rose', name: 'gentleRose', colors: ['#FFF0F2', '#FADBE2'], type: 'gradient' },
  { key: 'warm', name: 'warmSunset', colors: ['#FFF4E6', '#FBE3D0'], type: 'gradient' },
  { key: 'cool', name: 'coolOcean', colors: ['#E8F4FF', '#D3E9F7'], type: 'gradient' },
  { key: 'dark', name: 'deepNight', colors: ['#16213E', '#0F172A'], type: 'gradient' },
];

export const ColorThemePicker = memo(function ColorThemePicker({
  visible,
  onClose,
  currentTheme,
  onSelectTheme,
  currentBackground = 'default',
  customBackgroundImage = null,
  onSelectBackground,
}: ColorThemePickerProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [previewBackground, setPreviewBackground] = useState<BackgroundThemeKey>(currentBackground);
  const [previewImage, setPreviewImage] = useState<string | null>(customBackgroundImage);

  const activeBackground = useMemo<BackgroundThemeKey>(() => {
    if (onSelectBackground) return currentBackground;
    return previewBackground;
  }, [onSelectBackground, currentBackground, previewBackground]);

  const activeImage = useMemo<string | null>(() => {
    if (onSelectBackground) return customBackgroundImage ?? null;
    return previewImage;
  }, [onSelectBackground, customBackgroundImage, previewImage]);

  const handleSelectColor = useCallback((colorKey: ColorThemeKey) => {
    onSelectTheme(colorKey);
  }, [onSelectTheme]);

  const handleSelectBackground = useCallback((backgroundKey: BackgroundThemeKey) => {
    if (onSelectBackground) {
      onSelectBackground(backgroundKey, backgroundKey === 'custom' ? activeImage : null);
    }
    setPreviewBackground(backgroundKey);
  }, [onSelectBackground, activeImage]);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPreviewImage(uri);
        setPreviewBackground('custom');
        if (onSelectBackground) {
          onSelectBackground('custom', uri);
        }
      }
    } catch (error) {
      console.error('[ColorThemePicker] Image picker error:', error);
      Alert.alert(i18n.t('error'), i18n.t('galleryPickerError'));
    }
  }, [onSelectBackground]);

  const getColorDisplayName = useCallback((themeKey: ColorThemeKey) => {
    const names: Record<ColorThemeKey, string> = {
      gold: i18n.t('gold'),
      blue: i18n.t('blue'),
      green: i18n.t('green'),
      purple: i18n.t('purple'),
      teal: i18n.t('teal'),
      rose: i18n.t('rose'),
    };
    return names[themeKey] || themeKey;
  }, []);

  const getBackgroundDisplayName = useCallback((backgroundKey: BackgroundThemeKey) => {
    const names: Record<BackgroundThemeKey, string> = {
      default: i18n.t('defaultBackground'),
      gold: i18n.t('warmGold'),
      blue: i18n.t('calmBlue'),
      green: i18n.t('softGreen'),
      purple: i18n.t('lightPurple'),
      teal: i18n.t('freshTeal'),
      rose: i18n.t('gentleRose'),
      warm: i18n.t('warmSunset'),
      cool: i18n.t('coolOcean'),
      dark: i18n.t('deepNight'),
      custom: i18n.t('customImage'),
    };
    return names[backgroundKey] || backgroundKey;
  }, []);

  const isCustomSelected = activeBackground === 'custom';

  const renderPreview = useCallback(() => {
    const selectedOption = backgroundOptions.find((b) => b.key === activeBackground);
    const backgroundColors = selectedOption?.colors ?? ['#F7F4EE', '#F7F4EE'];
    const isDark = activeBackground === 'dark';
    const previewTextColor = isDark ? '#FFFFFF' : '#1B4332';
    const previewSubtextColor = isDark ? 'rgba(255,255,255,0.7)' : '#8A9B91';

    return (
      <View style={[styles.previewContainer, { borderColor: theme.border }]}>
        {isCustomSelected && activeImage ? (
          <View style={styles.previewImageWrapper}>
            <Image source={{ uri: activeImage }} style={styles.previewImage as ImageStyle} resizeMode="cover" />
            <View style={[styles.previewOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
          </View>
        ) : (
          <LinearGradient colors={backgroundColors} style={styles.previewGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        )}
        <View style={styles.previewContent}>
          <Text style={[styles.previewTitle, { color: previewTextColor }]}>
            {i18n.t('preview')}
          </Text>
          <Text style={[styles.previewArabic, { color: previewTextColor }]}>
            سُبْحَانَ اللَّهِ
          </Text>
          <Text style={[styles.previewTransliteration, { color: previewSubtextColor }]}>
            Subhan Allah
          </Text>
          <View style={[styles.previewCounter, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.06)' }]}>
            <Text style={[styles.previewCounterText, { color: isDark ? '#FFFFFF' : '#1B4332' }]}>
              33
            </Text>
          </View>
        </View>
      </View>
    );
  }, [activeBackground, activeImage, theme.border]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{i18n.t('colorTheme')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderPreview()}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {i18n.t('backgroundThemes')}
          </Text>

          <View style={styles.backgroundsGrid}>
            {backgroundOptions.map((background) => {
              const isSelected = activeBackground === background.key && !isCustomSelected;
              return (
                <TouchableOpacity
                  key={background.key}
                  style={[
                    styles.backgroundItem,
                    { borderColor: isSelected ? Colors.primary : theme.border },
                    isSelected && styles.backgroundItemSelected,
                  ]}
                  onPress={() => handleSelectBackground(background.key)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={background.colors}
                    style={styles.backgroundPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isSelected && (
                      <View style={styles.checkContainer}>
                        <Check size={18} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </LinearGradient>
                  <Text style={[styles.itemName, { color: theme.text }]}>
                    {getBackgroundDisplayName(background.key)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.backgroundItem,
                { borderColor: isCustomSelected ? Colors.primary : theme.border },
                isCustomSelected && styles.backgroundItemSelected,
              ]}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <View style={[styles.backgroundPreview, styles.customImagePreview]}>
                {activeImage ? (
                  <>
                    <Image source={{ uri: activeImage }} style={styles.customImageThumb as ImageStyle} resizeMode="cover" />
                    <View style={styles.customImageOverlay} />
                  </>
                ) : (
                  <ImageIcon size={28} color={Colors.primary} />
                )}
                {isCustomSelected && (
                  <View style={styles.checkContainer}>
                    <Check size={18} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>
              <Text style={[styles.itemName, { color: theme.text }]}>
                {i18n.t('chooseFromGallery')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {i18n.t('accentColors')}
          </Text>

          <View style={styles.colorsGrid}>
            {colorOptions.map((colorTheme) => {
              const isSelected = currentTheme === colorTheme.key;
              return (
                <TouchableOpacity
                  key={colorTheme.key}
                  style={[
                    styles.colorItem,
                    { borderColor: isSelected ? colorTheme.colors[0] : theme.border },
                    isSelected && { borderWidth: 2 },
                  ]}
                  onPress={() => handleSelectColor(colorTheme.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.colorPreview, { backgroundColor: colorTheme.colors[0] }]}>
                    {isSelected && (
                      <View style={styles.checkContainer}>
                        <Check size={18} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.itemName, { color: theme.text }]}>
                    {getColorDisplayName(colorTheme.key)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Pressable
            style={[styles.closeButtonBottom, { backgroundColor: Colors.primary }]}
            onPress={onClose}
            android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
          >
            <Text style={styles.closeButtonBottomText}>{i18n.t('done')}</Text>
          </Pressable>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  previewGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  previewImageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewArabic: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    writingDirection: 'rtl',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  previewTransliteration: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 4,
  },
  previewCounter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    borderWidth: 2,
  },
  previewCounterText: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  backgroundsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  backgroundItem: {
    width: '30%',
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backgroundItemSelected: {
    borderWidth: 2,
  },
  colorItem: {
    width: '30%',
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backgroundPreview: {
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  customImagePreview: {
    backgroundColor: 'rgba(27,67,50,0.06)',
    overflow: 'hidden',
  },
  customImageThumb: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  customImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  colorPreview: {
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 10,
    textTransform: 'capitalize',
  },
  closeButtonBottom: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  closeButtonBottomText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});
