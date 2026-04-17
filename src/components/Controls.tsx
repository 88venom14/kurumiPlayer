import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { RepeatMode } from '../types/track';

interface ControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  isLoading?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Controls({
  isPlaying,
  isShuffled,
  repeatMode,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffle,
  onRepeat,
  isLoading,
}: ControlsProps) {
  const playScale = useSharedValue(1);

  const playAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const handlePlayPress = () => {
    playScale.value = withSpring(0.9, {}, () => {
      playScale.value = withSpring(1);
    });
    onPlayPause();
  };

  const getRepeatIcon = (): keyof typeof Ionicons.glyphMap => {
    if (repeatMode === 'one') return 'repeat';
    return 'repeat';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onShuffle} style={styles.sideButton}>
        <Ionicons
          name="shuffle"
          size={24}
          color={isShuffled ? COLORS.accent : COLORS.textMuted}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPrevious} style={styles.sideButton}>
        <Ionicons name="play-skip-back" size={28} color={COLORS.text} />
      </TouchableOpacity>

      <AnimatedTouchable
        onPress={handlePlayPress}
        style={[styles.playButton, playAnimatedStyle]}
        disabled={isLoading}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={COLORS.background}
          style={isPlaying ? undefined : { marginLeft: 3 }}
        />
      </AnimatedTouchable>

      <TouchableOpacity onPress={onNext} style={styles.sideButton}>
        <Ionicons name="play-skip-forward" size={28} color={COLORS.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onRepeat} style={styles.sideButton}>
        <View>
          <Ionicons
            name={getRepeatIcon()}
            size={24}
            color={repeatMode !== 'off' ? COLORS.accent : COLORS.textMuted}
          />
          {repeatMode === 'one' && (
            <View style={styles.repeatOneBadge}>
              <Ionicons name="ellipse" size={6} color={COLORS.accent} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 16,
  },
  sideButton: {
    padding: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  repeatOneBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
});
