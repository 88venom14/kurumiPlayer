import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  coverImage: {
    position: 'absolute',
  },
  defaultCenter: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    position: 'absolute',
  },
});
