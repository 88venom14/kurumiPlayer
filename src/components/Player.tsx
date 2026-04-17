import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Vinyl } from './Vinyl';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { VolumeSlider } from './VolumeSlider';
import { usePlayer } from '../hooks/usePlayer';
import { COLORS, FONTS } from '../theme/colors';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    isShuffled,
    repeatMode,
    progress,
    duration,
    volume,
    isLoading,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeatMode,
    seekTo,
    setVolume,
    formatTime,
  } = usePlayer();

  return (
    <View style={styles.container}>
      {/* Vinyl Disc */}
      <View style={styles.vinylContainer}>
        <Vinyl
          isPlaying={isPlaying}
          coverPath={currentTrack?.cover_path ?? null}
          size={260}
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack?.title ?? 'No Track Selected'}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack?.artist ?? 'Select a track from Library'}
        </Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        duration={duration}
        onSeek={seekTo}
        formatTime={formatTime}
      />

      {/* Playback Controls */}
      <Controls
        isPlaying={isPlaying}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        onPlayPause={togglePlayPause}
        onNext={playNext}
        onPrevious={playPrevious}
        onShuffle={toggleShuffle}
        onRepeat={cycleRepeatMode}
        isLoading={isLoading}
      />

      {/* Volume Slider */}
      <VolumeSlider volume={volume} onVolumeChange={setVolume} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  vinylContainer: {
    marginBottom: 16,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.serif,
    textAlign: 'center',
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.mono,
    textAlign: 'center',
  },
});
