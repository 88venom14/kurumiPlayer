import { useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TrackList } from '../components/TrackList';
import { UploadButton } from '../components/UploadButton';
import { useTracks } from '../hooks/useTracks';
import { usePlayer } from '../hooks/usePlayer';
import { Track } from '../types/track';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/LibraryScreen.styles';
import { pluralTracks } from '../utils/format';

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
