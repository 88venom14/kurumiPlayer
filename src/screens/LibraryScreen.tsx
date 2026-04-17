import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TrackList } from '../components/TrackList';
import { UploadButton } from '../components/UploadButton';
import { useTracks } from '../hooks/useTracks';
import { usePlayer } from '../hooks/usePlayer';
import { Track } from '../types/track';
import { COLORS } from '../theme/colors';

export function LibraryScreen() {
  const { tracks, loading, uploading, fetchTracks, uploadTrack, deleteTrack } = useTracks();
  const { currentTrack, isPlaying, playTrackFromList } = usePlayer();
  const navigation = useNavigation<any>();

  const handleTrackDelete = useCallback(
    (track: Track) => {
      Alert.alert(
        'Delete track',
        `"${track.title}" will be permanently removed from your library.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTrack(track.id);
              } catch (e: any) {
                Alert.alert('Delete failed', e.message);
              }
            },
          },
        ]
      );
    },
    [deleteTrack]
  );

  const handleTrackPress = useCallback(
    async (track: Track) => {
      await playTrackFromList(track, tracks);
      navigation.navigate('Player');
    },
    [tracks, playTrackFromList, navigation]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <Text style={styles.trackCount}>
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <TrackList
          tracks={tracks}
          currentTrackId={currentTrack?.id ?? null}
          isPlaying={isPlaying}
          onTrackPress={handleTrackPress}
          onTrackDelete={handleTrackDelete}
          refreshing={loading}
          onRefresh={fetchTracks}
        />
      )}

      <UploadButton onUpload={uploadTrack} uploading={uploading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 2,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },
  trackCount: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
