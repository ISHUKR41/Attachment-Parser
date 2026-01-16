import { Platform } from 'react-native';

const tintColorLight = '#1B7A5C';
const tintColorDark = '#2ECC9B';

export const Colors = {
  light: {
    // Enhanced contrast for better visibility (WCAG AAA compliance)
    text: '#0F1514', // Darker for better contrast
    textSecondary: '#3E4D49', // Improved from #5A6A66
    buttonText: '#FFFFFF',
    tabIconDefault: '#5A6872', // Darker for visibility
    tabIconSelected: tintColorLight,
    link: '#166B50', // Darker, more visible
    backgroundRoot: '#F8FAF9', // Slightly lighter
    backgroundDefault: '#ECF2F0', // Better contrast
    backgroundSecondary: '#E0E8E5', // Improved separation
    backgroundTertiary: '#D3DDD9', // More distinct
    accent: '#D4AF37',
    boardLight: '#F5EBD8', // Brighter light squares
    boardDark: '#1A7256', // Higher contrast dark squares
    pieceWhite: '#FFFFFF', // Pure white for maximum contrast
    pieceBlack: '#0D0D0D', // Deeper black
    highlight: 'rgba(212, 175, 55, 0.65)', // More visible
    check: 'rgba(220, 53, 69, 0.75)', // Stronger warning
    lastMove: 'rgba(27, 122, 92, 0.4)', // More noticeable
    validMove: 'rgba(46, 204, 155, 0.55)', // Enhanced visibility
    cardGradientStart: '#FFFFFF',
    cardGradientEnd: '#F2F7F5',
    success: '#1F9D3A', // Darker green for visibility
    error: '#D32F2F', // More prominent red
    warning: '#F9A825', // Better contrast yellow
  },
  dark: {
    text: '#F5F7FA',
    textSecondary: '#B0B8C1',
    buttonText: '#FFFFFF',
    tabIconDefault: '#8A95A3',
    tabIconSelected: tintColorDark,
    link: '#38E5A7',
    backgroundRoot: '#0C1A15',
    backgroundDefault: '#15312A',
    backgroundSecondary: '#1E4539',
    backgroundTertiary: '#27594A',
    accent: '#FFD700',
    boardLight: '#E8DCC8',
    boardDark: '#229967',
    pieceWhite: '#FFFFFF',
    pieceBlack: '#0A0A0A',
    highlight: 'rgba(255, 215, 0, 0.75)',
    check: 'rgba(255, 51, 51, 0.85)',
    lastMove: 'rgba(0, 255, 136, 0.4)',
    validMove: 'rgba(0, 255, 136, 0.7)',
    cardGradientStart: '#1E4539',
    cardGradientEnd: '#15312A',
    success: '#00FF88',
    error: '#FF3333',
    warning: '#FFAA00',
  },
};

export const ChessColors = {
  gold: '#FFD700',
  goldLight: '#FFEB3B',
  goldDark: '#FFA000',
  emerald: '#229967',
  emeraldLight: '#00FF88',
  emeraldDark: '#0D5C3F',
  darkEmerald: '#063020',
  cream: '#FFF8E7',
  ivory: '#FFFFF8',
  bronze: '#FF8C42',
  silver: '#E8E8E8',
  woodLight: '#F5E6D3',
  woodDark: '#8B4513',
  pearl: '#FEFEFE',
  ebony: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  inputHeight: 52,
  buttonHeight: 56,
  touchTarget: 48,
};

export const BorderRadius = {
  xs: 10, // Increased from 8
  sm: 14, // Increased from 12
  md: 20, // Increased from 18
  lg: 28, // Increased from 24
  xl: 34, // Increased from 30
  '2xl': 44, // Increased from 40
  '3xl': 56, // Increased from 50
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 42, // Increased from 40
    lineHeight: 52, // Increased from 48
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  h2: {
    fontSize: 34, // Increased from 32
    lineHeight: 44, // Increased from 40
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: 28, // Increased from 26
    lineHeight: 36, // Increased from 34
    fontWeight: '700' as const,
  },
  h4: {
    fontSize: 22, // Same
    lineHeight: 30, // Same
    fontWeight: '700' as const, // Increased from 600
  },
  body: {
    fontSize: 18, // Same 
    lineHeight: 28, // Increased from 26
    fontWeight: '500' as const,
  },
  small: {
    fontSize: 16, // Same
    lineHeight: 23, // Increased from 22
    fontWeight: '500' as const,
  },
  tiny: {
    fontSize: 14, // Same
    lineHeight: 19, // Increased from 18
    fontWeight: '600' as const,
  },
  link: {
    fontSize: 18, // Same
    lineHeight: 28, // Increased from 26
    fontWeight: '600' as const,
  },
  button: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Enhanced shadows for better depth perception
export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 }, // Increased from 2
      shadowOpacity: 0.15, // Increased from 0.1
      shadowRadius: 6, // Increased from 4
    },
    android: {
      elevation: 3, // Increased from 2
    },
    web: {
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)', // Enhanced
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 }, // Increased from 4
      shadowOpacity: 0.2, // Increased from 0.15
      shadowRadius: 12, // Increased from 8
    },
    android: {
      elevation: 6, // Increased from 4
    },
    web: {
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)', // Enhanced
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 }, // Increased from 8
      shadowOpacity: 0.28, // Increased from 0.2
      shadowRadius: 20, // Increased from 16
    },
    android: {
      elevation: 12, // Increased from 8
    },
    web: {
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.28)', // Enhanced
    },
  }),
};

// Text Shadow Utilities for enhanced visibility
export const TextShadows = {
  light: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  medium: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  strong: {
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glow: {
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
};
