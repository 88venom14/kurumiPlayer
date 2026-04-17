import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS, FONTS } from '../theme/colors';

interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek: (value: number) => void;
  formatTime: (millis: number) => string;
}

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

const styles = StyleSheet.create({
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
