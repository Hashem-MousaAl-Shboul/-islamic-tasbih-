import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useCompassStyleStore } from '@/hooks/useCompassStyleStore';
import { useTheme } from '@/theme/ThemeProvider';
import {
  DIAL_STYLE_LIST,
  ARROW_COLOR_LIST,
  type DialStyleId,
  type ArrowColorId,
} from '@/constants/compassThemes';
import { androidTextFix } from '@/utils/androidOptimizations';

// ── Design tokens ──────────────────────────────────────────────
const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const DARK_BG = '#1B1F2E';
const DARK_CARD = '#232838';
const DARK_BORDER = '#2D3142';
const LIGHT_BG = '#F5F1E8';
const LIGHT_CARD = '#FFFFFF';
const LIGHT_BORDER = '#E0E8E5';
const TEXT_LIGHT = '#FFFFFF';
const TEXT_DARK = '#1B4332';
const TEXT_MUTED_LIGHT = 'rgba(255,255,255,0.55)';
const TEXT_MUTED_DARK = 'rgba(27,67,50,0.5)';

// ════════════════════════════════════════════════════════════════
//  MINI COMPASS PREVIEW — small SVG preview for each dial style
// ════════════════════════════════════════════════════════════════
interface MiniPreviewProps {
  dialStyleId: DialStyleId;
  arrowColorId: ArrowColorId;
  size: number;
  isDark: boolean;
}

const MiniPreview = memo(function MiniPreview({
  dialStyleId,
  arrowColorId,
  size,
  isDark,
}: MiniPreviewProps) {
  const { dialStyle, arrowColor } = (() => {
    const ds = DIAL_STYLE_LIST.find((d) => d.id === dialStyleId)!;
    const ac = ARROW_COLOR_LIST.find((a) => a.id === arrowColorId)!;
    return { dialStyle: ds, arrowColor: ac };
  })();

  const center = size / 2;
  const radius = size / 2 - 2;

  // Tick marks
  const ticks: React.ReactElement[] = [];
  for (let angle = 0; angle < 360; angle += 45) {
    const isMajor = angle % 90 === 0;
    const rad = (angle * Math.PI) / 180;
    const tickLen = isMajor ? 5 : 3;
    const x1 = center + (radius - tickLen) * Math.sin(rad);
    const y1 = center - (radius - tickLen) * Math.cos(rad);
    const x2 = center + radius * Math.sin(rad);
    const y2 = center - radius * Math.cos(rad);
    const tickColor = isMajor
      ? arrowColor.color
      : isDark
        ? 'rgba(255,255,255,0.3)'
        : 'rgba(27,67,50,0.2)';

    ticks.push(
      <View
        key={`tick-${angle}`}
        style={[
          {
            position: 'absolute',
            left: (x1 + x2) / 2 - 0.5,
            top: (y1 + y2) / 2 - 0.5,
            width: 1,
            height: tickLen,
            backgroundColor: tickColor,
            transform: [{ rotate: `${angle}deg` }],
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.previewContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark
            ? dialStyle.faceGradientDark[0]
            : dialStyle.faceGradientLight[0],
          borderColor: dialStyle.ringGradient[0],
        },
      ]}
    >
      {ticks}

      {/* Inner ring indicator */}
      <View
        style={[
          styles.previewInnerRing,
          {
            width: size * 0.65,
            height: size * 0.65,
            borderRadius: (size * 0.65) / 2,
            borderColor: dialStyle.innerRingColor,
            borderStyle:
              dialStyle.innerRingStyle === 'dashed'
                ? 'dashed'
                : dialStyle.innerRingStyle === 'dotted'
                  ? 'dotted'
                  : 'solid',
            borderWidth: dialStyle.innerRingStyle === 'double' ? 2 : 1,
          },
        ]}
      />

      {/* Center arrow */}
      <View
        style={[
          styles.previewArrow,
          {
            borderTopColor: arrowColor.color,
            borderRightWidth: 4,
            borderLeftWidth: 4,
            borderTopWidth: size * 0.22,
            borderRightColor: 'transparent',
            borderLeftColor: 'transparent',
          },
        ]}
      />

      {/* Center dot */}
      <View
        style={[
          styles.previewCenter,
          {
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: (size * 0.18) / 2,
            backgroundColor: arrowColor.color,
          },
        ]}
      />
    </View>
  );
});
MiniPreview.displayName = 'MiniPreview';

// ════════════════════════════════════════════════════════════════
//  MAIN COMPASS STYLE PICKER MODAL
// ════════════════════════════════════════════════════════════════
interface CompassStylePickerProps {
  visible: boolean;
  onClose: () => void;
}

const CompassStylePicker = memo(function CompassStylePicker({
  visible,
  onClose,
}: CompassStylePickerProps) {
  const { t } = useLanguageStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    dialStyleId,
    arrowColorId,
    changeDialStyle,
    changeArrowColor,
  } = useCompassStyleStore();

  const isDark = theme.mode === 'dark';
  const textColor = isDark ? TEXT_LIGHT : TEXT_DARK;
  const mutedColor = isDark ? TEXT_MUTED_LIGHT : TEXT_MUTED_DARK;
  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const borderColor = isDark ? DARK_BORDER : LIGHT_BORDER;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: isDark ? DARK_BG : LIGHT_BG,
                  paddingBottom: insets.bottom + 16,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  {t('selectCompassStyle')}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <X size={20} color={mutedColor} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalDescription, { color: mutedColor }]}>
                {t('compassStyleDescription')}
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                style={{ flex: 1 }}
              >
                {/* ── Dial Style Section ── */}
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  {t('dialStyle')}
                </Text>
                <View style={styles.dialStyleGrid}>
                  {DIAL_STYLE_LIST.map((style) => {
                    const isSelected = style.id === dialStyleId;
                    return (
                      <TouchableOpacity
                        key={style.id}
                        style={[
                          styles.dialStyleCard,
                          {
                            backgroundColor: cardColor,
                            borderColor: isSelected ? GOLD : borderColor,
                          },
                        ]}
                        onPress={() => void changeDialStyle(style.id as DialStyleId)}
                        activeOpacity={0.7}
                      >
                        <MiniPreview
                          dialStyleId={style.id}
                          arrowColorId={arrowColorId}
                          size={64}
                          isDark={isDark}
                        />
                        <Text
                          style={[
                            styles.dialStyleLabel,
                            { color: isSelected ? GOLD : textColor },
                          ]}
                        >
                          {t(style.labelKey as never)}
                        </Text>
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Check size={12} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* ── Arrow Color Section ── */}
                <Text style={[styles.sectionTitle, { color: textColor, marginTop: 8 }]}>
                  {t('arrowColor')}
                </Text>
                <View style={styles.arrowColorRow}>
                  {ARROW_COLOR_LIST.map((color) => {
                    const isSelected = color.id === arrowColorId;
                    return (
                      <TouchableOpacity
                        key={color.id}
                        style={[
                          styles.arrowColorCard,
                          {
                            backgroundColor: cardColor,
                            borderColor: isSelected ? GOLD : borderColor,
                          },
                        ]}
                        onPress={() => void changeArrowColor(color.id as ArrowColorId)}
                        activeOpacity={0.7}
                      >
                        {/* Color swatch */}
                        <View
                          style={[
                            styles.colorSwatch,
                            {
                              backgroundColor: color.color,
                              borderColor: color.dimColor,
                            },
                          ]}
                        >
                          {isSelected && (
                            <Check size={14} color={color.markerColor} strokeWidth={3} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.arrowColorLabel,
                            { color: isSelected ? GOLD : mutedColor },
                          ]}
                        >
                          {t(color.labelKey as never)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* ── Live Preview ── */}
                <Text style={[styles.sectionTitle, { color: textColor, marginTop: 8 }]}>
                  {t('preview')}
                </Text>
                <View
                  style={[
                    styles.previewBox,
                    { backgroundColor: cardColor, borderColor },
                  ]}
                >
                  <MiniPreview
                    dialStyleId={dialStyleId}
                    arrowColorId={arrowColorId}
                    size={120}
                    isDark={isDark}
                  />
                  <Text style={[styles.previewLabel, { color: mutedColor }]}>
                    {t('facingQibla')}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});
CompassStylePicker.displayName = 'CompassStylePicker';

// ════════════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    ...androidTextFix,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  modalDescription: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 20,
    ...androidTextFix,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 12,
    ...androidTextFix,
  },
  // ── Dial style grid ──
  dialStyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  dialStyleCard: {
    width: '31%',
    aspectRatio: 0.85,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  dialStyleLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    ...androidTextFix,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Mini preview ──
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  previewInnerRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewArrow: {
    position: 'absolute',
    top: '20%',
  },
  previewCenter: {
    position: 'absolute',
  },
  // ── Arrow color row ──
  arrowColorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  arrowColorCard: {
    width: '31%',
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowColorLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    ...androidTextFix,
  },
  // ── Preview box ──
  previewBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 13,
    ...androidTextFix,
  },
});

export default CompassStylePicker;
