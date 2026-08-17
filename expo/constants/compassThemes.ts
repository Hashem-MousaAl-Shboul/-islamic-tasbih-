/**
 * Compass visual themes — Islamic art-inspired dial styles and arrow colors.
 * Each dial style controls the overall decorative appearance of the compass face,
 * while arrow colors are independently selectable.
 */

// ── Arrow color options ──────────────────────────────────────
export type ArrowColorId =
  | 'gold'
  | 'emerald'
  | 'crimson'
  | 'turquoise'
  | 'silver'
  | 'indigo';

export interface ArrowColorOption {
  id: ArrowColorId;
  /** Primary arrow color */
  color: string;
  /** Dimmed variant for non-aligned state */
  dimColor: string;
  /** Kaaba marker center color */
  markerColor: string;
  /** Translation key for display name */
  labelKey: string;
}

export const ARROW_COLORS: Record<ArrowColorId, ArrowColorOption> = {
  gold: {
    id: 'gold',
    color: '#D4A853',
    dimColor: '#B8923F',
    markerColor: '#FFFFFF',
    labelKey: 'arrowGold',
  },
  emerald: {
    id: 'emerald',
    color: '#2E8B57',
    dimColor: '#1B6B3F',
    markerColor: '#A8F0C8',
    labelKey: 'arrowEmerald',
  },
  crimson: {
    id: 'crimson',
    color: '#C0392B',
    dimColor: '#922B21',
    markerColor: '#FFD0CC',
    labelKey: 'arrowCrimson',
  },
  turquoise: {
    id: 'turquoise',
    color: '#1ABC9C',
    dimColor: '#148F77',
    markerColor: '#D0FFF5',
    labelKey: 'arrowTurquoise',
  },
  silver: {
    id: 'silver',
    color: '#BDC3C7',
    dimColor: '#95A5A6',
    markerColor: '#FFFFFF',
    labelKey: 'arrowSilver',
  },
  indigo: {
    id: 'indigo',
    color: '#4A6FA5',
    dimColor: '#34507A',
    markerColor: '#C3D4F0',
    labelKey: 'arrowIndigo',
  },
};

export const ARROW_COLOR_LIST: ArrowColorOption[] = Object.values(ARROW_COLORS);

// ── Dial style options ───────────────────────────────────────
export type DialStyleId =
  | 'classic'
  | 'mosaic'
  | 'ottoman'
  | 'moroccan'
  | 'minimal'
  | 'persian';

export interface DialStyleOption {
  id: DialStyleId;
  /** Translation key for display name */
  labelKey: string;
  /** Background gradient colors for the compass face (light mode) */
  faceGradientLight: [string, string];
  /** Background gradient colors for the compass face (dark mode) */
  faceGradientDark: [string, string];
  /** Outer ring gradient (non-aligned) */
  ringGradient: [string, string];
  /** Tick mark style: 'line' | 'diamond' | 'star' */
  tickShape: 'line' | 'diamond' | 'star';
  /** Decorative pattern: 'none' | 'arabesque' | 'geometric' | 'floral' */
  pattern: 'none' | 'arabesque' | 'geometric' | 'floral';
  /** Pattern overlay color (rgba) for light mode */
  patternColorLight: string;
  /** Pattern overlay color (rgba) for dark mode */
  patternColorDark: string;
  /** Inner decorative ring (between ticks and center) */
  innerRingStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  /** Inner ring color */
  innerRingColor: string;
  /** Center medallion shape: 'circle' | 'octagon' | 'star' */
  centerShape: 'circle' | 'octagon' | 'star';
}

export const DIAL_STYLES: Record<DialStyleId, DialStyleOption> = {
  classic: {
    id: 'classic',
    labelKey: 'compassThemeClassic',
    faceGradientLight: ['#FFFFFF', '#F5F1E8'],
    faceGradientDark: ['#232838', '#1B1F2E'],
    ringGradient: ['#232838', '#1B1F2E'],
    tickShape: 'line',
    pattern: 'none',
    patternColorLight: 'rgba(27,67,50,0)',
    patternColorDark: 'rgba(255,255,255,0)',
    innerRingStyle: 'solid',
    innerRingColor: 'rgba(212,168,83,0.2)',
    centerShape: 'circle',
  },
  mosaic: {
    id: 'mosaic',
    labelKey: 'compassThemeMosaic',
    faceGradientLight: ['#FAF5E9', '#F0E6D2'],
    faceGradientDark: ['#2A2E3F', '#1E2230'],
    ringGradient: ['#3A3F52', '#232838'],
    tickShape: 'diamond',
    pattern: 'geometric',
    patternColorLight: 'rgba(27,67,50,0.06)',
    patternColorDark: 'rgba(212,168,83,0.05)',
    innerRingStyle: 'dashed',
    innerRingColor: 'rgba(212,168,83,0.3)',
    centerShape: 'octagon',
  },
  ottoman: {
    id: 'ottoman',
    labelKey: 'compassThemeOttoman',
    faceGradientLight: ['#FFF8EE', '#F5E6CC'],
    faceGradientDark: ['#2E2838', '#1B1825'],
    ringGradient: ['#4A3F2A', '#2E2515'],
    tickShape: 'diamond',
    pattern: 'arabesque',
    patternColorLight: 'rgba(139,115,85,0.08)',
    patternColorDark: 'rgba(212,168,83,0.06)',
    innerRingStyle: 'double',
    innerRingColor: 'rgba(184,146,63,0.35)',
    centerShape: 'circle',
  },
  moroccan: {
    id: 'moroccan',
    labelKey: 'compassThemeMoroccan',
    faceGradientLight: ['#F5F0E0', '#E8DCC8'],
    faceGradientDark: ['#2A3128', '#1A2118'],
    ringGradient: ['#1B4332', '#0F2A1E'],
    tickShape: 'star',
    pattern: 'floral',
    patternColorLight: 'rgba(27,67,50,0.07)',
    patternColorDark: 'rgba(212,168,83,0.05)',
    innerRingStyle: 'dotted',
    innerRingColor: 'rgba(212,168,83,0.3)',
    centerShape: 'octagon',
  },
  minimal: {
    id: 'minimal',
    labelKey: 'compassThemeMinimal',
    faceGradientLight: ['#FFFFFF', '#FAFAFA'],
    faceGradientDark: ['#1E2230', '#161922'],
    ringGradient: ['#2D3142', '#1B1F2E'],
    tickShape: 'line',
    pattern: 'none',
    patternColorLight: 'rgba(27,67,50,0)',
    patternColorDark: 'rgba(255,255,255,0)',
    innerRingStyle: 'solid',
    innerRingColor: 'rgba(255,255,255,0.05)',
    centerShape: 'circle',
  },
  persian: {
    id: 'persian',
    labelKey: 'compassThemePersian',
    faceGradientLight: ['#FBF5EC', '#EDE0C8'],
    faceGradientDark: ['#2A2235', '#1C1626'],
    ringGradient: ['#3D3548', '#261E30'],
    tickShape: 'diamond',
    pattern: 'arabesque',
    patternColorLight: 'rgba(74,111,165,0.07)',
    patternColorDark: 'rgba(212,168,83,0.05)',
    innerRingStyle: 'dashed',
    innerRingColor: 'rgba(74,111,165,0.3)',
    centerShape: 'star',
  },
};

export const DIAL_STYLE_LIST: DialStyleOption[] = Object.values(DIAL_STYLES);

// ── Combined theme ───────────────────────────────────────────
export interface CompassTheme {
  dialStyle: DialStyleOption;
  arrowColor: ArrowColorOption;
}

export function getCompassTheme(
  dialStyleId: DialStyleId,
  arrowColorId: ArrowColorId
): CompassTheme {
  return {
    dialStyle: DIAL_STYLES[dialStyleId],
    arrowColor: ARROW_COLORS[arrowColorId],
  };
}

/** Preview swatch color for dial style (used in picker UI) */
export function getDialStyleSwatch(dialStyleId: DialStyleId): string {
  const style = DIAL_STYLES[dialStyleId];
  return style.ringGradient[0];
}
