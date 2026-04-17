import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';

export const eqStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  bar: {
    width: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
});

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 2,
  },
  activeContainer: {
    backgroundColor: COLORS.accentGlow,
  },
  numberContainer: {
    width: 24,
    alignItems: 'center',
  },
  number: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.mono,
  },
  activeText: {
    color: COLORS.accent,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: 44,
    height: 44,
  },
  thumbnailPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONTS.mono,
  },
  duration: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.mono,
  },
  removeBtn: {
    padding: 2,
  },
});
