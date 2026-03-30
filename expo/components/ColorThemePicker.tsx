import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ColorThemeKey } from '@/theme/ThemeProvider';
import { Colors } from '@/constants/colors';
import i18n from '@/constants/translations';

interface ColorThemePickerProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: ColorThemeKey;
  onSelectTheme: (theme: ColorThemeKey) => void;
}

const colorThemes: { key: ColorThemeKey; name: string; colors: [string, string] }[] = [
  { key: 'gold', name: 'gold', colors: [Colors.accent.gold.start, Colors.accent.gold.end] },
  { key: 'blue', name: 'blue', colors: [Colors.accent.blue.start, Colors.accent.blue.end] },
  { key: 'green', name: 'green', colors: [Colors.accent.green.start, Colors.accent.green.end] },
  { key: 'purple', name: 'purple', colors: [Colors.accent.purple.start, Colors.accent.purple.end] },
  { key: 'teal', name: 'teal', colors: [Colors.accent.teal.start, Colors.accent.teal.end] },
  { key: 'rose', name: 'rose', colors: [Colors.accent.rose.start, Colors.accent.rose.end] },
];

export const ColorThemePicker = memo(function ColorThemePicker({
  visible,
  onClose,
  currentTheme,
  onSelectTheme,
}: ColorThemePickerProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleSelectTheme = useCallback((themeKey: ColorThemeKey) => {
    onSelectTheme(themeKey);
  }, [onSelectTheme]);

  const getThemeDisplayName = useCallback((themeKey: ColorThemeKey) => {
    if (!themeKey || typeof themeKey !== 'string') {
      return 'gold';
    }
    const themeNames = {
      gold: i18n.t('gold'),
      blue: i18n.t('blue'),
      green: i18n.t('green'),
      purple: i18n.t('purple'),
      teal: i18n.t('teal'),
      rose: i18n.t('rose')
    };
    return themeNames[themeKey] || themeKey;
  }, []);

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
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {i18n.t('selectColorTheme')}
          </Text>

          <View style={styles.themesGrid}>
            {colorThemes.map((colorTheme) => (
              <TouchableOpacity
                key={colorTheme.key}
                style={[
                  styles.themeItem,
                  { borderColor: theme.border },
                  currentTheme === colorTheme.key && { borderColor: colorTheme.colors[0], borderWidth: 2 }
                ]}
                onPress={() => handleSelectTheme(colorTheme.key)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.themePreview,
                    { backgroundColor: colorTheme.colors[0] }
                  ]}
                >
                  {currentTheme === colorTheme.key && (
                    <View style={styles.checkContainer}>
                      <Check size={20} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text style={[styles.themeName, { color: theme.text }]}>
                  {getThemeDisplayName(colorTheme.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  subtitle: {
    fontSize: 15,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
    gap: 16,
  },
  themeItem: {
    width: '47%',
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  themePreview: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 14,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
});