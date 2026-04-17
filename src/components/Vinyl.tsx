import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';
import { getPublicUrl } from '../lib/storage';

interface VinylProps {
  isPlaying: boolean;
  coverPath: string | null;
  size?: number;
}

export function Vinyl({ isPlaying, coverPath, size = 280 }: VinylProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, {
          duration: 8000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
    }
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const coverUrl = coverPath ? getPublicUrl(coverPath) : null;
  const innerSize = size * 0.35;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.glow,
          {
            width: size + 30,
            height: size + 30,
            borderRadius: (size + 30) / 2,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.disc,
          { width: size, height: size, borderRadius: size / 2 },
          animatedStyle,
        ]}
      >
        {[0.45, 0.55, 0.65, 0.75, 0.85, 0.95].map((ratio, index) => (
          <View
            key={index}
            style={[
              styles.groove,
              {
                width: size * ratio,
                height: size * ratio,
                borderRadius: (size * ratio) / 2,
              },
            ]}
          />
        ))}

        <View
          style={[
            styles.center,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={[
                styles.coverImage,
                {
                  width: innerSize - 4,
                  height: innerSize - 4,
                  borderRadius: (innerSize - 4) / 2,
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.defaultCenter,
                {
                  width: innerSize - 4,
                  height: innerSize - 4,
                  borderRadius: (innerSize - 4) / 2,
                },
              ]}
            />
          )}
          <View style={styles.centerDot} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
