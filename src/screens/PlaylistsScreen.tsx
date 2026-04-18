import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylists } from '../hooks/usePlaylists';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/PlaylistsScreen.styles';
import { PlaylistCard } from '../components/playlists/PlaylistCard';
import { PlaylistDetail } from '../components/playlists/PlaylistDetail';
import { CreatePlaylistModal } from '../components/playlists/CreatePlaylistModal';
import { ImportPlaylistModal } from '../components/playlists/ImportPlaylistModal';

export function PlaylistsScreen() {
  const {
    playlists,
    loading,
    createPlaylist,
    deletePlaylist,
    importPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getPlaylistTracks,
    fetchPlaylists,
  } = usePlaylists();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const selectedPlaylist = selectedId ? playlists.find((p) => p.id === selectedId) ?? null : null;

  useEffect(() => {
    if (selectedId && !loading && !selectedPlaylist) setSelectedId(null);
  }, [selectedId, selectedPlaylist, loading]);

  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        onBack={() => { setSelectedId(null); fetchPlaylists(); }}
        onDelete={async () => { await deletePlaylist(selectedPlaylist.id); setSelectedId(null); }}
        addTrack={addTrackToPlaylist}
        removeTrack={removeTrackFromPlaylist}
        getPlaylistTracks={getPlaylistTracks}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Плейлисты</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setImportOpen(true)}>
            <Ionicons name="link-outline" size={20} color={COLORS.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setCreateOpen(true)}>
            <Ionicons name="add" size={22} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : playlists.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="albums-outline" size={56} color={COLORS.surfaceLight} />
          <Text style={styles.emptyTitle}>Нет плейлистов</Text>
          <Text style={styles.emptyHint}>Нажмите + чтобы создать или импортировать</Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          renderItem={({ item }) => (
            <PlaylistCard
              playlist={item}
              onPress={() => setSelectedId(item.id)}
              onDelete={() =>
                Alert.alert('Удалить плейлист', `Удалить «${item.name}»?`, [
                  { text: 'Отмена', style: 'cancel' },
                  {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () => deletePlaylist(item.id).catch((e) => Alert.alert('Ошибка', e.message)),
                  },
                ])
              }
            />
          )}
        />
      )}

      <CreatePlaylistModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (name) => {
          try {
            await createPlaylist(name);
            setCreateOpen(false);
          } catch (e: any) {
            Alert.alert('Ошибка', e.message);
          }
        }}
      />

      <ImportPlaylistModal
        visible={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={async (code) => {
          try {
            await importPlaylist(code);
            setImportOpen(false);
            Alert.alert('Импортировано', 'Плейлист добавлен в библиотеку.');
          } catch (e: any) {
            Alert.alert('Ошибка импорта', e.message);
          }
        }}
      />
    </SafeAreaView>
  );
}
