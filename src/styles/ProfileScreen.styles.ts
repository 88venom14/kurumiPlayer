import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background
  },
  content: {
    padding:
      SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.lg
  },
  avatarSection: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.sm
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  displayName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FONTS.serif,
  },
  emailCaption: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.mono
  },
  section: {
    gap: SPACING.xs
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: 15,
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.35
  },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  readOnlyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    flex: 1
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FONTS.mono
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 13
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginTop: SPACING.sm,
  },
  signOutText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '600'
  },
});
