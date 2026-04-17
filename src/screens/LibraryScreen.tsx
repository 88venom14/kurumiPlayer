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

function pluralTracks(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'трек';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'трека';
  return 'треков';
}

export function LibraryScreen() {
  const { tracks, loading, uploading, fetchTracks, uploadTrack, deleteTrack } = useTracks();
  const { currentTrack, isPlaying, playTrackFromList } = usePlayer();
  const navigation = useNavigation<any>();

  const handleTrackDelete = useCallback(
    (track: Track) => {
      Alert.alert(
        'Удалить трек',
        `«${track.title}» будет безвозвратно удалён из библиотеки.`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTrack(track.id);
              } catch (e: any) {
                Alert.alert('Не удалось удалить', e.message);
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
      navigation.navigate('Плеер');
    },
    [tracks, playTrackFromList, navigation]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Библиотека</Text>
        <Text style={styles.trackCount}>
          {tracks.length} {pluralTracks(tracks.length)}
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
