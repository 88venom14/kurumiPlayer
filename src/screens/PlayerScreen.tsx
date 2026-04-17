import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Player } from '../components/Player';
import { COLORS } from '../theme/colors';

export function PlayerScreen() {
  return (
    <LinearGradient
      colors={['#1A1A1A', COLORS.background, '#0A0A0A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <Player />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
