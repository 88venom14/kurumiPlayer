import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlaylists } from '../hooks/usePlaylists';
import { useTracks } from '../hooks/useTracks';
import { usePlayer } from '../hooks/usePlayer';
import { buildShareLink, PlaylistTrack, PlaylistWithCount } from '../types/playlist';
import { Track } from '../types/track';
import { TrackItem } from '../components/TrackItem';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/PlaylistsScreen.styles';

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

  if (selectedId) {
    const playlist = playlists.find((p) => p.id === selectedId);
    if (!playlist) {
      setSelectedId(null);
      return null;
    }
    return (
      <PlaylistDetail
        playlist={playlist}
        onBack={() => {
          setSelectedId(null);
          fetchPlaylists();
        }}
        onDelete={async () => {
          await deletePlaylist(playlist.id);
          setSelectedId(null);
        }}
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

function PlaylistCard({
  playlist,
  onPress,
  onDelete,
}: {
  playlist: PlaylistWithCount;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardIcon}>
        <Ionicons name="musical-notes" size={26} color={COLORS.accent} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {playlist.name}
        </Text>
        <Text style={styles.cardMeta}>
          {playlist.track_count} {playlist.track_count % 10 === 1 && playlist.track_count % 100 !== 11 ? 'трек' : playlist.track_count % 10 >= 2 && playlist.track_count % 10 <= 4 && (playlist.track_count % 100 < 10 || playlist.track_count % 100 >= 20) ? 'трека' : 'треков'}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={12} style={styles.cardAction}>
        <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

function PlaylistDetail({
  playlist,
  onBack,
  onDelete,
  addTrack,
  removeTrack,
  getPlaylistTracks,
}: {
  playlist: PlaylistWithCount;
  onBack: () => void;
  onDelete: () => void;
  addTrack: (playlistId: string, trackId: string) => Promise<void>;
  removeTrack: (playlistId: string, trackId: string) => Promise<void>;
  getPlaylistTracks: (playlistId: string) => Promise<PlaylistTrack[]>;
}) {
  const [rows, setRows] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const { tracks: libraryTracks } = useTracks();
  const { currentTrack, isPlaying, playTrackFromList } = usePlayer();
  const navigation = useNavigation<any>();

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
        message: `Посмотри мой плейлист «${playlist.name}» в KurumiPlayer:\n${link}`,
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
          renderItem={({ item, index }) => (
            <TrackItem
              track={item.track}
              index={index}
              isActive={currentTrack?.id === item.track.id}
              isPlaying={isPlaying && currentTrack?.id === item.track.id}
              onPress={async () => {
                await playTrackFromList(item.track, playlistTracks);
                navigation.navigate('Плеер');
              }}
              onRemove={() => handleRemove(item.track_id, item.track.title)}
            />
          )}
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

function CreatePlaylistModal({
  visible, onClose, onCreate,
}: { visible: boolean; onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  useEffect(() => { if (!visible) setName(''); }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Новый плейлист</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Название плейлиста"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            autoFocus
            maxLength={80}
          />
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAccent, !name.trim() && { opacity: 0.4 }]}
              disabled={!name.trim()}
              onPress={() => onCreate(name)}
            >
              <Text style={styles.btnAccentText}>Создать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ImportPlaylistModal({
  visible, onClose, onImport,
}: { visible: boolean; onClose: () => void; onImport: (code: string) => void }) {
  const [value, setValue] = useState('');
  useEffect(() => { if (!visible) setValue(''); }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Импорт плейлиста</Text>
          <Text style={styles.sheetHint}>Вставьте ссылку или 12-значный код</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="vinylplayer://playlist/..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAccent, !value.trim() && { opacity: 0.4 }]}
              disabled={!value.trim()}
              onPress={() => onImport(value)}
            >
              <Text style={styles.btnAccentText}>Импортировать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AddTracksModal({
  visible, onClose, libraryTracks, existingIds, onToggle,
}: {
  visible: boolean;
  onClose: () => void;
  libraryTracks: Track[];
  existingIds: Set<string>;
  onToggle: (trackId: string, isCurrentlyAdded: boolean) => Promise<void>;
}) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  useEffect(() => { if (visible) setAdded(new Set(existingIds)); }, [visible]);

  const toggle = async (trackId: string) => {
    const isAdded = added.has(trackId);
    try {
      await onToggle(trackId, isAdded);
      setAdded((prev) => {
        const next = new Set(prev);
        if (isAdded) next.delete(trackId); else next.add(trackId);
        return next;
      });
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { flex: 1, marginLeft: 8, fontSize: 20 }]}>
            Добавить треки
          </Text>
        </View>
        {libraryTracks.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>В библиотеке нет треков</Text>
          </View>
        ) : (
          <FlatList
            data={libraryTracks}
            keyExtractor={(t) => t.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => {
              const isAdded = added.has(item.id);
              return (
                <TouchableOpacity
                  style={styles.addRow}
                  activeOpacity={0.7}
                  onPress={() => toggle(item.id)}
                >
                  <View style={styles.addRowCheck}>
                    <Ionicons
                      name={isAdded ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isAdded ? COLORS.accent : COLORS.surfaceHighlight}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addRowTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.addRowMeta} numberOfLines={1}>
                      {item.artist ?? 'Неизвестный исполнитель'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

