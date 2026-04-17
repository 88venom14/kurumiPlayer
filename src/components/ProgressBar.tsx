import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/ProgressBar.styles';
import { ProgressBarProps } from '../types/props';

export function ProgressBar({
  progress,
  duration,
  onSeek,
  formatTime,
}: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={progress}
        onSlidingComplete={onSeek}
        minimumTrackTintColor={COLORS.accent}
        maximumTrackTintColor={COLORS.surfaceLight}
        thumbTintColor={COLORS.accent}
      />
      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(progress)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

