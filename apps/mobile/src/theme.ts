import type { TextStyle } from 'react-native';

export const colors = {
  background: '#F6F3EF',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEAE3',
  border: '#E3DDD5',
  text: '#1F2523',
  textMuted: '#5D6661',
  primary: '#2F5D50',
  primarySoft: '#DFEAE6',
  onPrimary: '#FFFFFF',
  accent: '#C8743A',
  favorite: '#C0392B',
  success: '#1F6B3F',
  successSoft: '#E3F3E9',
  warning: '#8A5A12',
  warningSoft: '#FBEFD9',
  danger: '#A12D20',
  dangerSoft: '#FBE4E1',
  info: '#234F86',
  infoSoft: '#E2EDF9',
  neutral: '#4E5551',
  neutralSoft: '#EBE8E4',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  caption: { fontSize: 13, color: colors.textMuted },
  price: { fontSize: 17, fontWeight: '800', color: colors.text },
  button: { fontSize: 16, fontWeight: '700' },
} satisfies Record<string, TextStyle>;

export const shadow = {
  shadowColor: '#1F2523',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;
