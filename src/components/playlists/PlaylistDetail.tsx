import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTracks } from '../../hooks/useTracks';
import { usePlayer } from '../../hooks/usePlayer';
import { buildShareLink, PlaylistTrack, PlaylistWithCount } from '../../types/playlist';
import { Track } from '../../types/track';
import { TrackItem } from '../TrackItem';
import { COLORS } from '../../theme/colors';
import { styles } from '../../styles/PlaylistsScreen.styles';
import { AddTracksModal } from './AddTracksModal';

interface PlaylistDetailProps {
  playlist: PlaylistWithCount;
  onBack: () => void;
  onDelete: () => void;
  addTrack: (playlistId: string, trackId: string) => Promise<void>;
  removeTrack: (playlistId: string, trackId: string) => Promise<void>;
  getPlaylistTracks: (playlistId: string) => Promise<PlaylistTrack[]>;
}

export function PlaylistDetail({
  playlist, onBack, onDelete, addTrack, removeTrack, getPlaylistTracks,
}: PlaylistDetailProps) {
  const [rows, setRows] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const { tracks: libraryTracks, copyTrackToLibrary } = useTracks();
  const { currentTrack, isPlaying, playTrackFromList } = usePlayer();
  const navigation = useNavigation<any>();
  const libraryTrackIds = new Set(libraryTracks.map((t) => t.id));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getPlaylistTracks(playlist.id));
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  }, [playlist.id, getPlaylistTracks]);

  useEffect(() => { load(); }, [load]);

  const sharePlaylist = async () => {
    const link = buildShareLink(playlist.share_code);
    try {
      await Share.share({
        message: `Йоу это мой плейлист 556 67 «${playlist.name}» в KurumiPlayer:\n${link}`,
      });
    } catch { }
  };

  const handleRemove = (trackId: string, title: string) => {
    Alert.alert('Убрать из плейлиста', title, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Убрать',
        style: 'destructive',
        onPress: async () => {
          await removeTrack(playlist.id, trackId);
          load();
        },
      },
    ]);
  };

  const handleSave = async (track: Track) => {
    setSavingIds((prev) => new Set(prev).add(track.id));
    try {
      await copyTrackToLibrary(track);
      setSavedIds((prev) => new Set(prev).add(track.id));
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setSavingIds((prev) => { const s = new Set(prev); s.delete(track.id); return s; });
    }
  };

  const playlistTracks: Track[] = rows.map((r) => r.track);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { flex: 1, fontSize: 20 }]} numberOfLines={1}>
          {playlist.name}
        </Text>
        <TouchableOpacity style={styles.iconBtn} onPress={sharePlaylist}>
          <Ionicons name="share-outline" size={20} color={COLORS.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setAddOpen(true)}>
          <Ionicons name="add" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.sharePill}>
        <Ionicons name="link-outline" size={13} color={COLORS.textMuted} />
        <Text style={styles.shareCode} selectable>{playlist.share_code}</Text>
        <Text style={styles.shareLabel}>код доступа</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="musical-note-outline" size={48} color={COLORS.surfaceLight} />
          <Text style={styles.emptyTitle}>Нет треков</Text>
          <Text style={styles.emptyHint}>Нажмите + чтобы добавить треки из библиотеки</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.track_id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item, index }) => {
            const inLibrary = libraryTrackIds.has(item.track.id);
            const alreadySaved = inLibrary || savedIds.has(item.track.id);
            const isSaving = savingIds.has(item.track.id);
            return (
              <TrackItem
                track={item.track}
                index={index}
                isActive={currentTrack?.id === item.track.id}
                isPlaying={isPlaying && currentTrack?.id === item.track.id}
                onPress={async () => {
                  await playTrackFromList(item.track, playlistTracks);
                  navigation.navigate('Плеер');
                }}
                onRemove={inLibrary ? () => handleRemove(item.track_id, item.track.title) : undefined}
                onSave={!inLibrary ? () => handleSave(item.track) : undefined}
                isSaved={alreadySaved || isSaving}
              />
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.deleteFooter} onPress={onDelete}>
        <Ionicons name="trash-outline" size={15} color={COLORS.error} />
        <Text style={styles.deleteFooterText}>Удалить плейлист</Text>
      </TouchableOpacity>

      <AddTracksModal
        visible={addOpen}
        onClose={() => { setAddOpen(false); load(); }}
        libraryTracks={libraryTracks}
        existingIds={new Set(rows.map((r) => r.track_id))}
        onToggle={async (trackId, isAdded) => {
          if (isAdded) await removeTrack(playlist.id, trackId);
          else await addTrack(playlist.id, trackId);
        }}
      />
    </SafeAreaView>
  );
}
