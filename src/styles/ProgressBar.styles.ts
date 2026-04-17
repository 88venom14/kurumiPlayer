import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
    paddingHorizontal: 4,
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONTS.mono,
  },
});
