import { Platform } from 'react-native';

const tintColorLight = '#1B7A5C';
const tintColorDark = '#2ECC9B';

export const Colors = {
  light: {
    text: '#1A1F1E',
    textSecondary: '#5A6A66',
    buttonText: '#FFFFFF',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    link: '#1B7A5C',
    backgroundRoot: '#F5F8F7',
    backgroundDefault: '#E8EFED',
    backgroundSecondary: '#DCE6E3',
    backgroundTertiary: '#CFD9D6',
    accent: '#D4AF37',
    boardLight: '#F0E6D3',
    boardDark: '#1B7A5C',
    pieceWhite: '#FEFEFE',
    pieceBlack: '#1A1A1A',
    highlight: 'rgba(212, 175, 55, 0.5)',
    check: 'rgba(220, 53, 69, 0.6)',
    lastMove: 'rgba(27, 122, 92, 0.3)',
    validMove: 'rgba(46, 204, 155, 0.4)',
    cardGradientStart: '#FFFFFF',
    cardGradientEnd: '#F0F5F3',
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    buttonText: '#FFFFFF',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    link: '#2ECC9B',
    backgroundRoot: '#0A1612',
    backgroundDefault: '#122A22',
    backgroundSecondary: '#1A3D32',
    backgroundTertiary: '#225043',
    accent: '#D4AF37',
    boardLight: '#C9B896',
    boardDark: '#1B5A45',
    pieceWhite: '#F5F5F5',
    pieceBlack: '#2A2A2A',
    highlight: 'rgba(212, 175, 55, 0.6)',
    check: 'rgba(220, 53, 69, 0.7)',
    lastMove: 'rgba(46, 204, 155, 0.25)',
    validMove: 'rgba(46, 204, 155, 0.5)',
    cardGradientStart: '#1A3D32',
    cardGradientEnd: '#122A22',
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
  },
};

export const ChessColors = {
  gold: '#D4AF37',
  goldLight: '#F0D060',
  goldDark: '#B8962E',
  emerald: '#1B7A5C',
  emeraldLight: '#2ECC9B',
  emeraldDark: '#0D3B2E',
  darkEmerald: '#0D3B2E',
  cream: '#F0E6D3',
  ivory: '#FFFEF2',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  woodLight: '#DEB887',
  woodDark: '#8B4513',
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
  inputHeight: 48,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  '2xl': 40,
  '3xl': 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  tiny: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
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

export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
  }),
};
