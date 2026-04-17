export const COLORS = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  surfaceHighlight: '#333333',
  accent: '#AAFF00',
  accentDim: 'rgba(170, 255, 0, 0.3)',
  accentGlow: 'rgba(170, 255, 0, 0.15)',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  error: '#FF4444',
  success: '#44FF44',
  transparent: 'transparent',
} as const;

export const FONTS = {
  serif: 'serif',
  mono: 'monospace',
  sans: 'System',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
