import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { eqStyles } from '../styles/TrackItem.styles';

export function EqualizerBars() {
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.6);
  const bar3 = useSharedValue(0.4);

  React.useEffect(() => {
    bar1.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.2, { duration: 300 })),
      -1, true
    );
    bar2.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 300 }), withTiming(0.3, { duration: 400 })),
      -1, true
    );
    bar3.value = withRepeat(
      withSequence(withTiming(1, { duration: 500 }), withTiming(0.1, { duration: 350 })),
      -1, true
    );
  }, []);

  const style1 = useAnimatedStyle(() => ({ height: bar1.value * 16 }));
  const style2 = useAnimatedStyle(() => ({ height: bar2.value * 16 }));
  const style3 = useAnimatedStyle(() => ({ height: bar3.value * 16 }));

  return (
    <View style={eqStyles.container}>
      <Animated.View style={[eqStyles.bar, style1]} />
      <Animated.View style={[eqStyles.bar, style2]} />
      <Animated.View style={[eqStyles.bar, style3]} />
    </View>
  );
}
