import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { getPublicUrl } from '../lib/storage';
import { styles } from '../styles/Vinyl.styles';

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

