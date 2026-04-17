import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  vinylContainer: {
    marginBottom: 16,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.serif,
    textAlign: 'center',
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.mono,
    textAlign: 'center',
  },
});
