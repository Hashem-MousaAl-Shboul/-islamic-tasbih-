import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Circle, G, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

interface BeadRingCounterProps {
  count: number;
  targetCount: number;
  size?: number;
  beadColor?: string;
  activeColor?: string;
  spacerColor?: string;
  onPress?: () => void;
  pulseScale?: number;
  testID?: string;
}

const GOLD = '#D4A853';
const TEAL = '#1B5A6B';
const TEAL_LIGHT = '#2A7A8A';
const CREAM = '#F7F4EE';

const BeadRingCounter = memo<BeadRingCounterProps>(({
  count,
  targetCount,
  size = 260,
  beadColor = TEAL,
  activeColor = TEAL_LIGHT,
  spacerColor = GOLD,
  onPress,
  pulseScale = 1,
  testID = 'bead-ring-counter',
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const beadRadius = size * 0.042;
  const spacerRadius = size * 0.048;

  const clampedCount = Math.max(0, Math.min(count, targetCount));
  const progress = targetCount > 0 ? clampedCount / targetCount : 0;

  const beads = useMemo(() => {
    const total = Math.max(1, targetCount);
    return Array.from({ length: total }, (_, i) => {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return { x, y, angle, index: i };
    });
  }, [targetCount, cx, cy, radius]);

  const isSpacer = useCallback((index: number) => {
    if (targetCount <= 1) return false;
    // Golden spacers every third of the ring (for 33 beads: 11, 22)
    const step = Math.round(targetCount / 3);
    return step > 0 && index > 0 && index % step === 0;
  }, [targetCount]);

  const isTopMarker = useCallback((index: number) => index === 0, []);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Increment tasbih counter"
      style={[styles.container, { width: size, height: size, transform: [{ scale: pulseScale }] }]}
    >
      <View style={[styles.ringShadow, { width: size, height: size, borderRadius: size / 2 }]} />
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <RadialGradient id="beadGradient" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#3A8A9A" />
            <Stop offset="100%" stopColor={beadColor} />
          </RadialGradient>
          <RadialGradient id="activeGradient" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#5AB0B8" />
            <Stop offset="100%" stopColor={activeColor} />
          </RadialGradient>
          <RadialGradient id="goldGradient" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#F5D78E" />
            <Stop offset="50%" stopColor={spacerColor} />
            <Stop offset="100%" stopColor="#A67C00" />
          </RadialGradient>
        </Defs>

        {beads.map((bead) => {
          const active = bead.index < clampedCount;
          const spacer = isSpacer(bead.index);
          const topMarker = isTopMarker(bead.index);

          if (topMarker) {
            return (
              <G key={`marker-${bead.index}`} transform={`translate(${bead.x}, ${bead.y})`}>
                {/* Decorative pendant / top marker */}
                <Circle r={spacerRadius * 1.35} fill="url(#goldGradient)" opacity={0.95} />
                <Circle r={spacerRadius * 1.1} fill="none" stroke={CREAM} strokeWidth={1.5} opacity={0.6} />
                <Path
                  d={`M ${-spacerRadius * 0.5} ${-spacerRadius * 0.15} 
                      Q 0 ${-spacerRadius * 0.6} ${spacerRadius * 0.5} ${-spacerRadius * 0.15}
                      Q ${spacerRadius * 0.25} ${spacerRadius * 0.35} 0 ${spacerRadius * 0.55}
                      Q ${-spacerRadius * 0.25} ${spacerRadius * 0.35} ${-spacerRadius * 0.5} ${-spacerRadius * 0.15} Z`}
                  fill={CREAM}
                  opacity={0.85}
                />
                <Circle r={spacerRadius * 0.18} fill={CREAM} />
              </G>
            );
          }

          if (spacer) {
            return (
              <G key={`spacer-${bead.index}`} transform={`translate(${bead.x}, ${bead.y})`}>
                <Circle r={spacerRadius} fill="url(#goldGradient)" />
                <Circle r={spacerRadius * 0.65} fill={active ? 'url(#activeGradient)' : beadColor} />
                <Circle r={spacerRadius * 0.4} fill="none" stroke={active ? CREAM : GOLD} strokeWidth={1.2} opacity={0.7} />
              </G>
            );
          }

          return (
            <Circle
              key={`bead-${bead.index}`}
              cx={bead.x}
              cy={bead.y}
              r={beadRadius}
              fill={active ? 'url(#activeGradient)' : 'url(#beadGradient)'}
              opacity={active ? 1 : 0.92}
            />
          );
        })}
      </Svg>

      <View style={[styles.centerCircle, { width: size * 0.55, height: size * 0.55, borderRadius: size * 0.275 }]}>
        <Text style={[styles.countText, { fontSize: size * 0.22 }]} numberOfLines={1}>
          {count.toLocaleString('ar-SA')}
        </Text>
        <Text style={styles.targetText}>/{targetCount.toLocaleString('ar-SA')}</Text>
      </View>
    </TouchableOpacity>
  );
});

BeadRingCounter.displayName = 'BeadRingCounter';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringShadow: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
      },
    }),
  },
  svg: {
    position: 'absolute',
  },
  centerCircle: {
    position: 'absolute',
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: GOLD,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
      },
    }),
  },
  countText: {
    fontWeight: '800' as const,
    color: '#1B4332',
    textAlign: 'center' as const,
    includeFontPadding: false,
  },
  targetText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#8A9B91',
    marginTop: -3,
  },
});

export default BeadRingCounter;
