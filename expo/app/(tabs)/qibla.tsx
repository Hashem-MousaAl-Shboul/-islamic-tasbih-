import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  useWindowDimensions,
  Easing,
  Animated,
} from 'react-native';
import { Line, Text as SvgText, G, Path, Circle, Svg, Polygon } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Navigation2,
  MapPin,
  RefreshCw,
  Info,
  ChevronRight,
  AlertCircle,
  Gauge,
  Palette,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react-native';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useQibla, type CompassAccuracy } from '@/hooks/useQibla';
import { useCompassStyleStore } from '@/hooks/useCompassStyleStore';
import type { CompassTheme } from '@/constants/compassThemes';
import CompassStylePicker from '@/components/CompassStylePicker';
import UnifiedHeader from '@/components/UnifiedHeader';
import { ThemedBackground } from '@/components/ThemedBackground';
import { useTheme } from '@/theme/ThemeProvider';
import {
  KAABA_LATITUDE,
  KAABA_LONGITUDE,
} from '@/utils/qiblaUtils';
import { androidTextFix } from '@/utils/androidOptimizations';
import { createShadow, pointerEventsNone } from '@/utils/shadowUtils';

// ── Design tokens ──────────────────────────────────────────────
const GOLD = '#D4A853';
const GOLD_DIM = '#B8923F';
const DEEP_GREEN = '#1B4332';
const DEEP_GREEN_DARK = '#134238';
const DARK_BG = '#1B1F2E';
const DARK_CARD = '#232838';
const DARK_BORDER = '#2D3142';
const LIGHT_BG = '#F5F1E8';
const LIGHT_CARD = '#FFFFFF';
const LIGHT_BORDER = '#E0E8E5';
const TEXT_LIGHT = '#FFFFFF';
const TEXT_MUTED_LIGHT = 'rgba(255,255,255,0.55)';
const TEXT_DARK = '#1B4332';
const TEXT_MUTED_DARK = 'rgba(27,67,50,0.5)';

// ── Prayer times API types ────────────────────────────────────
interface PrayerTimesResponse {
  data: {
    timings: Record<string, string>;
    date: { readable: string; gregorian: { date: string }; hijri: { date: string; month: { ar: string; en: string }; day: string } };
    meta: { latitude: number; longitude: number; timezone: string };
  };
}

interface PrayerTimeEntry {
  key: string;
  label: string;
  time: string;
  minutesOfDay: number;
  isNext?: boolean;
}

// ── Kaaba coordinates ──────────────────────────────────────────
const KAABA_COORDS = { latitude: KAABA_LATITUDE, longitude: KAABA_LONGITUDE };

// Cardinal direction labels (module-level — never changes, avoids re-creation on each render).
const CARDINALS = [
  { label: 'N', angle: 0 },
  { label: 'E', angle: 90 },
  { label: 'S', angle: 180 },
  { label: 'W', angle: 270 },
] as const;

// Degree marks for compass dial (module-level constant).
const DEGREE_MARKS = [30, 60, 120, 150, 210, 240, 300, 330] as const;

// ════════════════════════════════════════════════════════════════
//  COMPASS COMPONENT — SVG-based Islamic compass with rotating dial
// ════════════════════════════════════════════════════════════════
interface CompassProps {
  heading: number | null;
  qiblaBearing: number | null;
  isAligned: boolean;
  size: number;
  isDark: boolean;
  theme: CompassTheme;
}

const Compass = memo(function Compass({ heading, qiblaBearing, isAligned, size, isDark, theme }: CompassProps) {
  const { dialStyle, arrowColor } = theme;
  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const borderColor = isAligned ? arrowColor.color : (isDark ? DARK_BORDER : LIGHT_BORDER);
  const textColor = isAligned ? arrowColor.color : (isDark ? TEXT_LIGHT : TEXT_DARK);
  const mutedColor = isDark ? TEXT_MUTED_LIGHT : TEXT_MUTED_DARK;
  const compassRingColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(27,67,50,0.08)';

  // The compass dial rotates opposite to the heading so that North always
  // points to geographic North relative to the device.
  const dialRotation = heading != null ? -heading : 0;
  // The Qibla arrow is drawn at the Qibla bearing relative to the dial,
  // so it rotates together with the dial and always points toward the Kaaba.
  const qiblaArrowAngle = qiblaBearing ?? 0;

  const center = size / 2;
  const radius = size / 2 - 8;
  const innerRadius = radius - 4;

  // Tick marks every 15°, labels at cardinal/intercardinal points.
  // Shape varies by dial style: 'line' | 'diamond' | 'star'
  // Memoized so ticks are only rebuilt when inputs actually change.
  const ticks = useMemo((): React.ReactElement[] => {
    const result: React.ReactElement[] = [];
    for (let angle = 0; angle < 360; angle += 15) {
      const isMajor = angle % 90 === 0;
      const isMedium = angle % 30 === 0;
      const tickLength = isMajor ? 14 : isMedium ? 10 : 6;
      const tickWidth = isMajor ? 2.5 : isMedium ? 1.5 : 1;
      const tickColor = isMajor
        ? (isAligned ? arrowColor.color : textColor)
        : isMedium
          ? mutedColor
          : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(27,67,50,0.15)');

      const rad = (angle * Math.PI) / 180;
      const x1 = center + (innerRadius - tickLength) * Math.sin(rad);
      const y1 = center - (innerRadius - tickLength) * Math.cos(rad);
      const x2 = center + innerRadius * Math.sin(rad);
      const y2 = center - innerRadius * Math.cos(rad);

      // For diamond/star shapes, draw a small rotated diamond at the tick position
      if (dialStyle.tickShape === 'diamond' && isMajor) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dSize = 5;
        result.push(
          <React.Fragment key={`tick-${angle}`}>
            <G x={mx} y={my} rotation={angle}>
              <Path d={`M 0 ${-dSize} L ${dSize} 0 L 0 ${dSize} L ${-dSize} 0 Z`} fill={tickColor} />
            </G>
          </React.Fragment>
        );
      } else if (dialStyle.tickShape === 'star' && isMajor) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const sSize = 6;
        // Simple 4-point star
        result.push(
          <React.Fragment key={`tick-${angle}`}>
            <G x={mx} y={my} rotation={angle}>
              <Path
                d={`M 0 ${-sSize} L ${sSize * 0.3} ${-sSize * 0.3} L ${sSize} 0 L ${sSize * 0.3} ${sSize * 0.3} L 0 ${sSize} L ${-sSize * 0.3} ${sSize * 0.3} L ${-sSize} 0 L ${-sSize * 0.3} ${-sSize * 0.3} Z`}
                fill={tickColor}
              />
            </G>
          </React.Fragment>
        );
      } else {
        result.push(
          <React.Fragment key={`tick-${angle}`}>
            <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tickColor} strokeWidth={tickWidth} strokeLinecap="round" />
          </React.Fragment>
        );
      }
    }
    return result;
  }, [dialStyle.tickShape, isAligned, arrowColor.color, textColor, mutedColor, isDark, center, innerRadius]);

  return (
    <View style={[styles.compassContainer, { width: size, height: size }]}>
      {/* Outer glow when aligned */}
      {isAligned && (
        <View style={[styles.compassGlow, { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2 }]} />
      )}

      {/* Outer ring */}
      <LinearGradient
        colors={isAligned ? [arrowColor.color, arrowColor.dimColor] : [dialStyle.ringGradient[0], dialStyle.ringGradient[1]]}
        style={[styles.compassOuterRing, { width: size, height: size, borderRadius: size / 2, borderColor }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Inner compass face */}
        <View style={[styles.compassFace, { width: size - 16, height: size - 16, borderRadius: (size - 16) / 2, backgroundColor: isAligned ? `${arrowColor.color}14` : (isDark ? dialStyle.faceGradientDark[0] : dialStyle.faceGradientLight[0]) }]}>

          {/* Decorative inner ring */}
          {dialStyle.pattern !== 'none' && (
            <View
              style={[
                styles.decorativeInnerRing,
                {
                  width: (size - 16) * 0.72,
                  height: (size - 16) * 0.72,
                  borderRadius: ((size - 16) * 0.72) / 2,
                  borderColor: isDark ? dialStyle.patternColorDark : dialStyle.patternColorLight,
                  borderStyle:
                    dialStyle.innerRingStyle === 'dashed'
                      ? 'dashed'
                      : dialStyle.innerRingStyle === 'dotted'
                        ? 'dotted'
                        : 'solid',
                  borderWidth: dialStyle.innerRingStyle === 'double' ? 2.5 : 1.5,
                },
              ]}
            />
          )}

          {/* Decorative second ring for 'double' style */}
          {dialStyle.innerRingStyle === 'double' && (
            <View
              style={[
                styles.decorativeInnerRing,
                {
                  width: (size - 16) * 0.82,
                  height: (size - 16) * 0.82,
                  borderRadius: ((size - 16) * 0.82) / 2,
                  borderColor: isDark ? dialStyle.patternColorDark : dialStyle.patternColorLight,
                  borderWidth: 0.5,
                },
              ]}
            />
          )}

          {/* Rotating dial with ticks + cardinal labels + qibla arrow */}
          <AnimatedDial
            rotation={dialRotation}
            center={center - 8}
            radius={innerRadius - 8}
            ticks={ticks}
            qiblaArrowAngle={qiblaArrowAngle}
            isAligned={isAligned}
            textColor={textColor}
            mutedColor={mutedColor}
            arrowColor={arrowColor.color}
            arrowDimColor={arrowColor.dimColor}
            arrowMarkerColor={arrowColor.markerColor}
            dialStyle={dialStyle}
          />

          {/* Fixed North indicator at top */}
          <View style={styles.northIndicator}>
            <View style={[styles.northTriangle, { borderTopColor: isAligned ? arrowColor.color : '#E63946' }]} />
          </View>

          {/* Center Kaaba icon */}
          {dialStyle.centerShape === 'circle' && (
            <View style={[styles.centerKaaba, { backgroundColor: isAligned ? arrowColor.color : DEEP_GREEN_DARK }]}>
              <Text style={styles.centerKaabaText}>🕋</Text>
            </View>
          )}
          {dialStyle.centerShape === 'octagon' && (
            <View style={[styles.centerKaabaOctagon, { backgroundColor: isAligned ? arrowColor.color : DEEP_GREEN_DARK }]}>
              <Text style={styles.centerKaabaText}>🕋</Text>
            </View>
          )}
          {dialStyle.centerShape === 'star' && (
            <View style={[styles.centerKaaba, { backgroundColor: isAligned ? arrowColor.color : DEEP_GREEN_DARK, borderRadius: 4, transform: [{ rotate: '45deg' }] }]}>
              <Text style={[styles.centerKaabaText, { transform: [{ rotate: '-45deg' }] }]}>🕋</Text>
            </View>
          )}

          {/* Aligned text */}
          {isAligned && (
            <View style={[styles.alignedBadge, { backgroundColor: arrowColor.color }]}>
              <Text style={styles.alignedText}>✓</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
});
Compass.displayName = 'Compass';

// ── Animated dial wrapper ──────────────────────────────────────

interface AnimatedDialProps {
  rotation: number;
  center: number;
  radius: number;
  ticks: React.ReactElement[];
  qiblaArrowAngle: number;
  isAligned: boolean;
  textColor: string;
  mutedColor: string;
  arrowColor: string;
  arrowDimColor: string;
  arrowMarkerColor: string;
  dialStyle: import('@/constants/compassThemes').DialStyleOption;
}

const AnimatedDial = memo(function AnimatedDial({
  rotation,
  center,
  radius,
  ticks,
  qiblaArrowAngle,
  isAligned,
  textColor,
  mutedColor,
  arrowColor,
  arrowDimColor,
  arrowMarkerColor,
  dialStyle,
}: AnimatedDialProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: rotation,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [rotation, rotateAnim]);

  const dialSize = (center + radius + 20) * 2;

  return (
    <View style={[StyleSheet.absoluteFill, pointerEventsNone]}>
      <Animated.View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [
            {
              rotate: rotateAnim.interpolate({
                inputRange: [-360, 360],
                outputRange: ['-360deg', '360deg'],
              }),
            },
          ],
        }}
      >
        <Svg width={dialSize} height={dialSize} viewBox={`0 0 ${dialSize} ${dialSize}`}>
          <G x={dialSize / 2} y={dialSize / 2}>
            {/* Tick marks */}
            {ticks}

            {/* Cardinal labels */}
            {CARDINALS.map(({ label, angle }) => {
              const rad = (angle * Math.PI) / 180;
              const labelRadius = radius - 28;
              const x = labelRadius * Math.sin(rad);
              const y = -labelRadius * Math.cos(rad);
              return (
                <SvgText
                  key={label}
                  x={x}
                  y={y}
                  fontSize={label === 'N' ? 18 : 14}
                  fontWeight={label === 'N' ? 800 : 600}
                  fill={label === 'N' ? (isAligned ? arrowColor : '#E63946') : mutedColor}
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {label}
                </SvgText>
              );
            })}

            {/* Qibla direction arrow — points from center outward at the Qibla bearing */}
            <G rotation={qiblaArrowAngle}>
              {/* Decorative pattern background for arabesque/geometric/floral */}
              {dialStyle.pattern === 'arabesque' && (
                <G opacity={0.3}>
                  <Circle cx={0} cy={0} r={radius * 0.5} fill="none" stroke={arrowDimColor} strokeWidth={0.5} strokeDasharray="2 3" />
                  <Circle cx={0} cy={0} r={radius * 0.35} fill="none" stroke={arrowDimColor} strokeWidth={0.5} strokeDasharray="1 2" />
                </G>
              )}
              {dialStyle.pattern === 'geometric' && (
                <G opacity={0.25}>
                  <Polygon points={`0,${-radius * 0.6} ${radius * 0.4},0 0,${radius * 0.6} ${-radius * 0.4},0`} fill="none" stroke={arrowDimColor} strokeWidth={0.8} />
                  <Polygon points={`0,${-radius * 0.4} ${radius * 0.28},0 0,${radius * 0.4} ${-radius * 0.28},0`} fill="none" stroke={arrowDimColor} strokeWidth={0.6} />
                </G>
              )}
              {dialStyle.pattern === 'floral' && (
                <G opacity={0.2}>
                  <Circle cx={0} cy={-radius * 0.45} r={radius * 0.08} fill="none" stroke={arrowDimColor} strokeWidth={0.6} />
                  <Circle cx={0} cy={-radius * 0.25} r={radius * 0.06} fill="none" stroke={arrowDimColor} strokeWidth={0.5} />
                </G>
              )}

              {/* Arrow shaft */}
              <Path
                d={`M 0 ${-radius * 0.85} L -12 ${-radius * 0.55} L -4 ${-radius * 0.55} L -4 ${-radius * 0.2} L 4 ${-radius * 0.2} L 4 ${-radius * 0.55} L 12 ${-radius * 0.55} Z`}
                fill={isAligned ? arrowColor : arrowDimColor}
                opacity={0.95}
              />
              {/* Small Kaaba marker at the tip */}
              <Circle cx={0} cy={-radius * 0.85} r={6} fill={isAligned ? arrowColor : DEEP_GREEN_DARK} />
              <Circle cx={0} cy={-radius * 0.85} r={3} fill={isAligned ? arrowMarkerColor : arrowColor} />
            </G>

            {/* Degree marks every 30° */}
            {DEGREE_MARKS.map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const labelRadius = radius - 28;
              const x = labelRadius * Math.sin(rad);
              const y = -labelRadius * Math.cos(rad);
              return (
                <SvgText
                  key={`deg-${angle}`}
                  x={x}
                  y={y}
                  fontSize={9}
                  fontWeight={400}
                  fill={mutedColor}
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {angle}
                </SvgText>
              );
            })}
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
});
AnimatedDial.displayName = 'AnimatedDial';

// ════════════════════════════════════════════════════════════════
//  ACCURACY INDICATOR — visual sensor quality bar + magnetic field
// ════════════════════════════════════════════════════════════════
interface AccuracyIndicatorProps {
  accuracy: CompassAccuracy;
  magneticField: number | null;
  isDark: boolean;
}

const AccuracyIndicator = memo(function AccuracyIndicator({ accuracy, magneticField, isDark }: AccuracyIndicatorProps) {
  const { t } = useLanguageStore();

  const config = useMemo(() => {
    switch (accuracy) {
      case 'high':
        return { color: '#4CAF50', bgColor: 'rgba(76,175,80,0.12)', label: t('accuracyHigh'), dots: 3, icon: CheckCircle2 };
      case 'medium':
        return { color: '#FFC107', bgColor: 'rgba(255,193,7,0.12)', label: t('accuracyMedium'), dots: 2, icon: Gauge };
      case 'low':
        return { color: '#FF6B6B', bgColor: 'rgba(255,107,107,0.12)', label: t('accuracyLow'), dots: 1, icon: AlertTriangle };
      default:
        return { color: '#888', bgColor: 'rgba(136,136,136,0.12)', label: t('accuracyUnavailable'), dots: 0, icon: XCircle };
    }
  }, [accuracy, t]);

  const mutedColor = isDark ? TEXT_MUTED_LIGHT : TEXT_MUTED_DARK;
  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const borderColor = isDark ? DARK_BORDER : LIGHT_BORDER;
  const Icon = config.icon;

  // Magnetic field display (typical Earth field: 25–65 µT).
  const magText = useMemo(() => {
    if (magneticField == null) return '—';
    return `${magneticField.toFixed(0)} µT`;
  }, [magneticField]);

  return (
    <View style={[styles.accuracyCard, { backgroundColor: config.bgColor, borderColor: config.color }]}>
      <View style={styles.accuracyHeader}>
        <View style={styles.accuracyHeaderLeft}>
          <Icon size={18} color={config.color} strokeWidth={2.2} />
          <Text style={[styles.accuracyTitle, { color: isDark ? TEXT_LIGHT : TEXT_DARK }]}>
            {t('sensorStatus')}
          </Text>
        </View>
        <Text style={[styles.accuracyValueBadge, { color: config.color }]}>{config.label}</Text>
      </View>

      {/* Segmented bar — 3 segments showing quality level */}
      <View style={styles.accuracyBar}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.accuracyBarSegment,
              {
                backgroundColor: i <= config.dots
                  ? config.color
                  : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(27,67,50,0.08)'),
              },
            ]}
          />
        ))}
      </View>

      {/* Magnetic field reading */}
      <View style={styles.accuracyMagRow}>
        <Gauge size={12} color={mutedColor} strokeWidth={2} />
        <Text style={[styles.accuracyMagLabel, { color: mutedColor }]}>
          {t('magneticFieldStrength')}:
        </Text>
        <Text style={[styles.accuracyMagValue, { color: config.color }]}>{magText}</Text>
      </View>
    </View>
  );
});
AccuracyIndicator.displayName = 'AccuracyIndicator';

// ════════════════════════════════════════════════════════════════
//  CALIBRATION CARD — detailed step-by-step calibration guide
// ════════════════════════════════════════════════════════════════
interface CalibrationCardProps {
  isDark: boolean;
}

const CalibrationCard = memo(function CalibrationCard({ isDark }: CalibrationCardProps) {
  const { t } = useLanguageStore();
  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const borderColor = isDark ? DARK_BORDER : LIGHT_BORDER;
  const textColor = isDark ? TEXT_LIGHT : TEXT_DARK;
  const mutedColor = isDark ? TEXT_MUTED_LIGHT : TEXT_MUTED_DARK;

  const steps = useMemo(() => [
    { num: 1, text: t('calibrateStep1') },
    { num: 2, text: t('calibrateStep2') },
    { num: 3, text: t('calibrateStep3') },
  ], [t]);

  return (
    <View style={[styles.calibrationCard, { backgroundColor: cardColor, borderColor: '#FFC107' }]}>
      <View style={styles.calibrationCardHeader}>
        <AlertTriangle size={18} color="#FFC107" strokeWidth={2.2} />
        <Text style={styles.calibrationCardTitle}>{t('calibrateCompassTitle')}</Text>
      </View>
      {steps.map((step) => (
        <View key={step.num} style={styles.calibrationStepRow}>
          <View style={styles.calibrationStepNum}>
            <Text style={styles.calibrationStepNumText}>{step.num}</Text>
          </View>
          <Text style={[styles.calibrationStepText, { color: mutedColor }]}>{step.text}</Text>
        </View>
      ))}
    </View>
  );
});
CalibrationCard.displayName = 'CalibrationCard';

// ════════════════════════════════════════════════════════════════
//  MINI MAP — simplified visual showing user → Kaaba direction
// ════════════════════════════════════════════════════════════════
interface MiniMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  qiblaBearing: number | null;
  isDark: boolean;
  size: number;
}

const MiniMap = memo(function MiniMap({ userLocation, qiblaBearing, isDark, size }: MiniMapProps) {
  const { t } = useLanguageStore();
  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const borderColor = isDark ? DARK_BORDER : LIGHT_BORDER;
  const textColor = isDark ? TEXT_LIGHT : TEXT_DARK;
  const mutedColor = isDark ? TEXT_MUTED_LIGHT : TEXT_MUTED_DARK;

  // Map the user's longitude and Kaaba's longitude onto the mini map width.
  // We center the map between the user and Kaaba for visual balance.
  const userLon = userLocation?.longitude ?? 0;
  const userLat = userLocation?.latitude ?? 0;

  // Simple linear projection: map longitude range to x, latitude range to y.
  // We use a window that covers from user to Kaaba.
  const minLon = Math.min(userLon, KAABA_COORDS.longitude) - 10;
  const maxLon = Math.max(userLon, KAABA_COORDS.longitude) + 10;
  const minLat = Math.min(userLat, KAABA_COORDS.latitude) - 10;
  const maxLat = Math.max(userLat, KAABA_COORDS.latitude) + 10;
  const lonRange = maxLon - minLon || 1;
  const latRange = maxLat - minLat || 1;

  const pad = 16;
  const mapW = size - pad * 2;
  const mapH = size * 0.6 - pad * 2;

  const userX = pad + ((userLon - minLon) / lonRange) * mapW;
  const userY = pad + mapH - ((userLat - minLat) / latRange) * mapH;
  const kaabaX = pad + ((KAABA_COORDS.longitude - minLon) / lonRange) * mapW;
  const kaabaY = pad + mapH - ((KAABA_COORDS.latitude - minLat) / latRange) * mapH;

  return (
    <View style={[styles.miniMapContainer, { backgroundColor: cardColor, borderColor, width: size }]}>
      <View style={styles.miniMapHeader}>
        <MapPin size={14} color={GOLD} strokeWidth={2} />
        <Text style={[styles.miniMapTitle, { color: mutedColor }]}>{t('yourLocation')} → {t('makkah')}</Text>
      </View>
      <View style={[styles.miniMapCanvas, { width: size - 2, height: size * 0.6, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(27,67,50,0.03)' }]}>
        <Svg width={size - 2} height={size * 0.6}>
          {/* Connection line */}
          <Line
            x1={userX}
            y1={userY}
            x2={kaabaX}
            y2={kaabaY}
            stroke={GOLD}
            strokeWidth={2}
            strokeDasharray="4 3"
            opacity={0.6}
          />

          {/* User position */}
          <Circle cx={userX} cy={userY} r={7} fill={DEEP_GREEN} />
          <Circle cx={userX} cy={userY} r={3.5} fill="#FFFFFF" />

          {/* Kaaba position */}
          <Circle cx={kaabaX} cy={kaabaY} r={9} fill={GOLD} />
          <Circle cx={kaabaX} cy={kaabaY} r={5} fill={DEEP_GREEN_DARK} />

          {/* Labels */}
          <SvgText x={userX} y={userY + 20} fontSize={9} fill={mutedColor} textAnchor="middle">
            {t('yourLocation').substring(0, 8)}
          </SvgText>
          <SvgText x={kaabaX} y={kaabaY + 22} fontSize={9} fill={GOLD} textAnchor="middle" fontWeight="600">
            {t('makkah').substring(0, 8)}
          </SvgText>
        </Svg>
      </View>
    </View>
  );
});
MiniMap.displayName = 'MiniMap';

// ════════════════════════════════════════════════════════════════
//  PRAYER TIMES COMPONENT
// ════════════════════════════════════════════════════════════════
interface PrayerTimesProps {
  location: { latitude: number; longitude: number } | null;
  isDark: boolean;
}

const PrayerTimes = memo(function PrayerTimes({ location, isDark }: PrayerTimesProps) {
  const { t } = useLanguageStore();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [hijriDate, setHijriDate] = useState<string>('');

  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const borderColor = isDark ? DARK_BORDER : LIGHT_BORDER;
  const textColor = isDark ? TEXT_LIGHT : TEXT_DARK;
  const mutedColor = isDark ? TEXT_MUTED_LIGHT : TEXT_MUTED_DARK;

  useEffect(() => {
    const updateNextPrayer = (): void => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      setPrayerTimes((current) => {
        if (!current) return current;
        let nextFound = false;
        const updated = current.map((entry) => {
          const isNext = !nextFound && entry.key !== 'Sunrise' && entry.minutesOfDay > currentMinutes;
          if (isNext) nextFound = true;
          return { ...entry, isNext };
        });
        if (!nextFound) {
          const fajrIndex = updated.findIndex((entry) => entry.key === 'Fajr');
          if (fajrIndex >= 0) updated[fajrIndex] = { ...updated[fajrIndex], isNext: true };
        }
        return updated;
      });
    };
    const timer = setInterval(updateNextPrayer, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchPrayerTimes = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateStr = `${day}-${month}-${year}`;

        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${location.latitude}&longitude=${location.longitude}&method=2`
        );
        if (!res.ok) throw new Error('Failed');
        const json: PrayerTimesResponse = await res.json();

        const timings = json.data.timings;
        const hijri = json.data.date.hijri;
        setHijriDate(`${hijri.day} ${hijri.month.ar} ${hijri.date.split('-')[0]}`);

        const formatTime = (time: string): string => {
          const clean = time.split(' ')[0];
          const [h, m] = clean.split(':').map(Number);
          const period = h >= 12 ? t('pm') : t('am');
          const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
          return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
        };

        // Determine next prayer by comparing 24h times from the API directly
        // (avoids fragile string-based AM/PM parsing that breaks with translations).
        const now = new Date();
        const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
        const rawEntries = prayerKeys.map((key) => ({
          key,
          label: t(key.toLowerCase() as 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'),
          rawTime: timings[key],
        }));

        let nextFound = false;
        const entries: PrayerTimeEntry[] = rawEntries.map((e) => {
          const clean = e.rawTime.split(' ')[0];
          const [h24, m] = clean.split(':').map(Number);
          const prayerDate = new Date();
          prayerDate.setHours(h24, m, 0, 0);

          const isNext = !nextFound && e.key !== 'Sunrise' && prayerDate > now;
          if (isNext) nextFound = true;

          return {
            key: e.key,
            label: e.label,
            time: formatTime(e.rawTime),
            minutesOfDay: h24 * 60 + m,
            isNext,
          };
        });
        if (!nextFound && entries.length > 0) {
          // All prayers passed today; next is Fajr tomorrow.
          const fajrEntry = entries.find((e) => e.key === 'Fajr');
          if (fajrEntry) fajrEntry.isNext = true;
          else entries[0].isNext = true;
        }

        setPrayerTimes(entries);
      } catch (e) {
        console.log('[Qibla] Prayer times error:', e);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPrayerTimes();
  }, [location, t]);

  if (!location) return null;

  return (
    <View style={[styles.prayerCard, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.prayerHeader}>
        <View style={styles.prayerHeaderLeft}>
          <Text style={[styles.prayerTitle, { color: textColor }]}>{t('prayerTimes')}</Text>
          {hijriDate ? (
            <Text style={[styles.prayerHijriDate, { color: mutedColor }]}>{hijriDate}</Text>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.prayerLoading}>
          <ActivityIndicator size="small" color={GOLD} />
          <Text style={[styles.prayerLoadingText, { color: mutedColor }]}>{t('loadingPrayerTimes')}</Text>
        </View>
      ) : error ? (
        <Text style={[styles.prayerError, { color: mutedColor }]}>{t('prayerTimesError')}</Text>
      ) : prayerTimes ? (
        <View style={styles.prayerGrid}>
          {prayerTimes.map((entry) => (
            <View
              key={entry.key}
              style={[
                styles.prayerItem,
                {
                  backgroundColor: entry.isNext
                    ? 'rgba(212,168,83,0.12)'
                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(27,67,50,0.03)'),
                  borderColor: entry.isNext ? GOLD : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.prayerItemLabel,
                  { color: entry.isNext ? GOLD : mutedColor },
                ]}
              >
                {entry.label}
              </Text>
              <Text
                style={[
                  styles.prayerItemTime,
                  { color: entry.isNext ? GOLD : textColor },
                ]}
              >
                {entry.time}
              </Text>
              {entry.isNext ? (
                <Text style={styles.prayerNextBadge}>{t('nextPrayer')}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
});
PrayerTimes.displayName = 'PrayerTimes';

// ════════════════════════════════════════════════════════════════
//  ERROR / EMPTY STATE COMPONENTS
// ════════════════════════════════════════════════════════════════
interface ErrorStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  buttonText?: string;
  onPress?: () => void;
  isDark: boolean;
}

const ErrorState = memo(function ErrorState({ icon, title, message, buttonText, onPress, isDark }: ErrorStateProps) {
  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const textColor = isDark ? TEXT_LIGHT : TEXT_DARK;
  const mutedColor = isDark ? TEXT_MUTED_LIGHT : TEXT_MUTED_DARK;

  return (
    <View style={[styles.errorContainer, { backgroundColor: cardColor }]}>
      <View style={styles.errorIcon}>{icon}</View>
      <Text style={[styles.errorTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.errorMessage, { color: mutedColor }]}>{message}</Text>
      {buttonText && onPress ? (
        <TouchableOpacity
          style={styles.errorButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.errorButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
});
ErrorState.displayName = 'ErrorState';

// ════════════════════════════════════════════════════════════════
//  MAIN QIBLA SCREEN
// ════════════════════════════════════════════════════════════════
export default function QiblaScreen() {
  const { t } = useLanguageStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();

  const isDark = theme.mode === 'dark';
  const textColor = isDark ? TEXT_LIGHT : TEXT_DARK;
  const mutedColor = isDark ? TEXT_MUTED_LIGHT : TEXT_MUTED_DARK;
  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const borderColor = isDark ? DARK_BORDER : LIGHT_BORDER;

  const {
    location,
    qiblaBearing,
    distanceToKaaba,
    heading,
    accuracy,
    magneticField,
    isAligned,
    isLoadingLocation,
    error,
    permissionDenied,
    refreshLocation,
  } = useQibla();

  const { dialStyle, arrowColor } = useCompassStyleStore();
  const compassTheme: CompassTheme = { dialStyle, arrowColor };


  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showStylePicker, setShowStylePicker] = useState<boolean>(false);

  // Compass size adapts to screen width.
  const compassSize = Math.max(220, Math.min(window.width - 56, 304));

  // Format distance for display.
  const distanceText = useMemo(() => {
    if (distanceToKaaba == null) return null;
    if (distanceToKaaba < 1) return `${Math.round(distanceToKaaba * 1000)} m`;
    if (distanceToKaaba < 100) return `${distanceToKaaba.toFixed(1)} ${t('km')}`;
    return `${Math.round(distanceToKaaba).toLocaleString()} ${t('km')}`;
  }, [distanceToKaaba, t]);

  // Bearing display.
  const bearingText = useMemo(() => {
    if (qiblaBearing == null) return null;
    return `${Math.round(qiblaBearing)}${t('degree')}`;
  }, [qiblaBearing, t]);

  // Determine screen state.
  const showCompass = location && qiblaBearing != null && accuracy !== 'unavailable';

  return (
    <ThemedBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 92 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={!showCompass}
      >
        <UnifiedHeader title={t('qibla')} testID="qibla-header" accessibilityLabel={t('qibla')} />

        {/* ── Loading state ── */}
        {isLoadingLocation && !location ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={[styles.centerStateText, { color: mutedColor }]}>
              {t('findingQibla')}
            </Text>
          </View>
        ) : permissionDenied ? (
          /* ── Permission denied state ── */
          <ErrorState
            icon={<MapPin size={40} color={GOLD} strokeWidth={1.5} />}
            title={t('locationNeeded')}
            message={t('locationPermissionDenied')}
            buttonText={t('enableLocation')}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }}
            isDark={isDark}
          />
        ) : error && !location ? (
          /* ── Location error state ── */
          <ErrorState
            icon={<AlertCircle size={40} color="#FF6B6B" strokeWidth={1.5} />}
            title={t('error')}
            message={t('retry')}
            buttonText={t('retry')}
            onPress={() => void refreshLocation()}
            isDark={isDark}
          />
        ) : (
          /* ── Main content ── */
          <View style={styles.mainContent}>
            {/* Compass section */}
            <View style={styles.compassSection}>
              <Compass
                heading={heading}
                qiblaBearing={qiblaBearing}
                isAligned={isAligned}
                size={compassSize}
                isDark={isDark}
                theme={compassTheme}
              />

              {/* Accuracy indicator — visual sensor quality card */}
              <AccuracyIndicator accuracy={accuracy} magneticField={magneticField} isDark={isDark} />

              {/* Bearing & distance info */}
              <View style={[styles.infoRow, { backgroundColor: cardColor, borderColor }]}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: mutedColor }]}>
                    {t('qiblaDirection')}
                  </Text>
                  <Text style={[styles.infoValue, { color: isAligned ? GOLD : textColor }]}>
                    {bearingText ?? '—'}
                  </Text>
                </View>
                <View style={[styles.infoDivider, { backgroundColor: borderColor }]} />
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: mutedColor }]}>
                    {t('distanceToKaaba')}
                  </Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {distanceText ?? '—'}
                  </Text>
                </View>
              </View>

              {/* Alignment status */}
              <View style={styles.alignmentStatus}>
                {isAligned ? (
                  <View style={styles.alignedRow}>
                    <View style={styles.alignedPulse}>
                      <Text style={styles.alignedPulseText}>✓</Text>
                    </View>
                    <Text style={styles.alignedStatusText}>{t('facingQibla')}</Text>
                  </View>
                ) : (
                  <Text style={[styles.alignHint, { color: mutedColor }]}>
                    {t('alignToQibla')}
                  </Text>
                )}
              </View>

              {/* Recalibrate + Style buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.recalibrateButton, { borderColor }]}
                  onPress={() => void refreshLocation()}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={16} color={GOLD} strokeWidth={2} />
                  <Text style={[styles.recalibrateText, { color: mutedColor }]}>
                    {t('recalibrate')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.recalibrateButton, { borderColor }]}
                  onPress={() => setShowStylePicker(true)}
                  activeOpacity={0.7}
                >
                  <Palette size={16} color={arrowColor.color} strokeWidth={2} />
                  <Text style={[styles.recalibrateText, { color: mutedColor }]}>
                    {t('compassStyle')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Info card — virtue of facing Qibla */}
            <TouchableOpacity
              style={[styles.infoCard, { backgroundColor: cardColor, borderColor }]}
              onPress={() => setShowInfo((v) => !v)}
              activeOpacity={0.7}
            >
              <View style={styles.infoCardHeader}>
                <View style={styles.infoCardLeft}>
                  <Info size={18} color={GOLD} strokeWidth={2} />
                  <Text style={[styles.infoCardTitle, { color: textColor }]}>
                    {t('qiblaInfoTitle')}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={mutedColor}
                  strokeWidth={2}
                  style={{ transform: [{ rotate: showInfo ? '90deg' : '0deg' }] }}
                />
              </View>
              {showInfo ? (
                <Text style={[styles.infoCardText, { color: mutedColor }]}>
                  {t('qiblaInfoText')}
                </Text>
              ) : null}
            </TouchableOpacity>

            {/* Mini map */}
            {location ? (
              <View style={styles.miniMapSection}>
                <MiniMap
                  userLocation={location}
                  qiblaBearing={qiblaBearing}
                  isDark={isDark}
                  size={Math.min(window.width - 32, 360)}
                />
              </View>
            ) : null}

            {/* Prayer times */}
            {location ? (
              <View style={styles.prayerSection}>
                <PrayerTimes location={location} isDark={isDark} />
              </View>
            ) : null}

            {/* Calibration guide — shown when accuracy is low or medium */}
            {(accuracy === 'low' || accuracy === 'medium') && showCompass ? (
              <CalibrationCard isDark={isDark} />
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Compass style picker modal */}
      <CompassStylePicker
        visible={showStylePicker}
        onClose={() => setShowStylePicker(false)}
      />
    </ThemedBackground>
  );
}

// ════════════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  centerStateText: {
    fontSize: 14,
    ...androidTextFix,
  },
  // ── Compass ──
  compassSection: {
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(212,168,83,0.12)',
    ...StyleSheet.absoluteFillObject as any,
    alignSelf: 'center',
  },
  compassOuterRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...createShadow({ offsetY: 4, opacity: 0.15, blur: 12, elevation: 8 }),
  },
  compassFace: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  northIndicator: {
    position: 'absolute',
    top: 4,
    alignItems: 'center',
  },
  northTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  centerKaaba: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow({ offsetY: 2, opacity: 0.2, blur: 4, elevation: 4 }),
  },
  centerKaabaText: {
    fontSize: 16,
  },
  alignedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800' as const,
  },
  // ── Accuracy card (rebuilt) ──
  accuracyCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    width: '100%',
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accuracyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accuracyTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    ...androidTextFix,
  },
  accuracyValueBadge: {
    fontSize: 12,
    fontWeight: '700' as const,
    ...androidTextFix,
  },
  accuracyBar: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
  },
  accuracyBarSegment: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
  },
  accuracyMagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accuracyMagLabel: {
    fontSize: 11,
    ...androidTextFix,
  },
  accuracyMagValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    ...androidTextFix,
  },
  // ── Calibration card (new) ──
  calibrationCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 12,
  },
  calibrationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  calibrationCardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFC107',
    ...androidTextFix,
  },
  calibrationStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  calibrationStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,193,7,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  calibrationStepNumText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFC107',
    ...androidTextFix,
  },
  calibrationStepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    paddingTop: 1,
    ...androidTextFix,
  },
  // ── Info row ──
  infoRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoDivider: {
    width: 1,
    height: 32,
  },
  infoLabel: {
    fontSize: 11,
    ...androidTextFix,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    ...androidTextFix,
  },
  // ── Alignment ──
  alignmentStatus: {
    alignItems: 'center',
    minHeight: 28,
    justifyContent: 'center',
  },
  alignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alignedPulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignedPulseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800' as const,
  },
  alignedStatusText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700' as const,
    ...androidTextFix,
  },
  alignHint: {
    fontSize: 13,
    ...androidTextFix,
  },
  // ── Recalibrate button ──
  recalibrateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  // ── Decorative inner ring ──
  decorativeInnerRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Octagon center ──
  centerKaabaOctagon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    ...createShadow({ offsetY: 2, opacity: 0.2, blur: 4, elevation: 4 }),
  },
  recalibrateText: {
    fontSize: 13,
    fontWeight: '500' as const,
    ...androidTextFix,
  },
  // ── Info card ──
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    ...androidTextFix,
  },
  infoCardText: {
    fontSize: 12,
    lineHeight: 20,
    marginTop: 10,
    ...androidTextFix,
  },
  // ── Mini map ──
  miniMapSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  miniMapContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 6,
    alignItems: 'center',
  },
  miniMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  miniMapTitle: {
    fontSize: 12,
    ...androidTextFix,
  },
  miniMapCanvas: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  // ── Prayer times ──
  prayerSection: {
    marginBottom: 12,
  },
  prayerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  prayerHeaderLeft: {
    gap: 2,
  },
  prayerTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    ...androidTextFix,
  },
  prayerHijriDate: {
    fontSize: 12,
    ...androidTextFix,
  },
  prayerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  prayerLoadingText: {
    fontSize: 13,
    ...androidTextFix,
  },
  prayerError: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
    ...androidTextFix,
  },
  prayerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prayerItem: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
  },
  prayerItemLabel: {
    fontSize: 11,
    ...androidTextFix,
  },
  prayerItemTime: {
    fontSize: 14,
    fontWeight: '700' as const,
    ...androidTextFix,
  },
  prayerNextBadge: {
    fontSize: 9,
    color: GOLD,
    fontWeight: '600' as const,
    marginTop: 2,
    ...androidTextFix,
  },
  // ── Calibration hint (removed — replaced by CalibrationCard component) ──
  // ── Error state ──
  errorContainer: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 14,
    marginTop: 32,
    borderRadius: 18,
    gap: 12,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,168,83,0.1)',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    ...androidTextFix,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    ...androidTextFix,
  },
  errorButton: {
    backgroundColor: DEEP_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
    ...androidTextFix,
  },
});
