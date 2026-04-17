import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: COLORS.accentGlow,
  },
  disc: {
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  groove: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    elevation: 5,
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
