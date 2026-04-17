import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  emptyTitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8
  },
  emptyHint: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 3
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700'
  },
  cardMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.mono
  },
  cardAction: {
    padding: 6
  },

  sharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shareCode: {
    color: COLORS.accent,
    fontSize: 13,
    fontFamily: FONTS.mono,
    fontWeight: '700',
    letterSpacing: 1,
  },
  shareLabel: {
    color: COLORS.textMuted,
    fontSize: 11
  },

  deleteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  deleteFooterText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600'
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 22,
    gap: 14,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700'
  },
  sheetHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: -6
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceHighlight,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  },
  btnGhost: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  btnGhostText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600'
  },
  btnAccent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
  },
  btnAccentText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700'
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  addRowCheck: {
    width: 28,
    alignItems: 'center'
  },
  addRowTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600'
  },
  addRowMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.mono,
    marginTop: 2
  },
});
