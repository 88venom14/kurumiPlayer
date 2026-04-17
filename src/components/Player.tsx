import React from 'react';
import { View, Text } from 'react-native';
import { Vinyl } from './Vinyl';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { VolumeSlider } from './VolumeSlider';
import { usePlayer } from '../hooks/usePlayer';
import { styles } from '../styles/Player.styles';

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
      <View style={styles.vinylContainer}>
        <Vinyl
          isPlaying={isPlaying}
          coverPath={currentTrack?.cover_path ?? null}
          size={260}
        />
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack?.title ?? 'Трек не выбран'}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack?.artist ?? 'Выберите трек из библиотеки'}
        </Text>
      </View>

      <ProgressBar
        progress={progress}
        duration={duration}
        onSeek={seekTo}
        formatTime={formatTime}
      />

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

      <VolumeSlider volume={volume} onVolumeChange={setVolume} />
    </View>
  );
}

