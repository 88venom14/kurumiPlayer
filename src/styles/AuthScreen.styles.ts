import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/colors';

export const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  logoBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  appName: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
    fontFamily: FONTS.serif,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.mono,
  },
  form: {
    gap: SPACING.md
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 2,
    color: COLORS.text,
    fontSize: 15,
  },
  authButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  authButtonDisabled: {
    opacity: 0.6
  },
  authButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  switchText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
