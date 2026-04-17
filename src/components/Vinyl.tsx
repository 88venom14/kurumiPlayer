import { useEffect } from 'react';
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
import { VinylProps } from '../types/props';

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
      <Animated.View
        style={[
          styles.disc,
          { width: size, height: size, borderRadius: size / 2 },
          animatedStyle,
        ]}
      >
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
