import React from 'react';
import { View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/VolumeSlider.styles';

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (value: number) => void;
}

export function VolumeSlider({ volume, onVolumeChange }: VolumeSliderProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="volume-low"
        size={20}
        color={COLORS.textSecondary}
      />
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onValueChange={onVolumeChange}
        minimumTrackTintColor={COLORS.accentDim}
        maximumTrackTintColor={COLORS.surfaceLight}
        thumbTintColor={COLORS.accent}
      />
      <Ionicons
        name="volume-high"
        size={20}
        color={COLORS.textSecondary}
      />
    </View>
  );
}

