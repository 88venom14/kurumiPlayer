import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { usePlaylists } from '../hooks/usePlaylists';
import { useTracks } from '../hooks/useTracks';
import { usePlayer } from '../hooks/usePlayer';
import { buildShareLink, PlaylistTrack, PlaylistWithCount } from '../types/playlist';
import { Track } from '../types/track';
import { TrackItem } from '../components/TrackItem';
import { COLORS, FONTS } from '../theme/colors';

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
        <Text style={styles.headerTitle}>Playlists</Text>
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
          <Text style={styles.emptyTitle}>No playlists yet</Text>
          <Text style={styles.emptyHint}>Tap + to create one or import via link</Text>
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
                Alert.alert('Delete playlist', `Remove "${item.name}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deletePlaylist(item.id).catch((e) => Alert.alert('Error', e.message)),
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
            Alert.alert('Error', e.message);
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
            Alert.alert('Imported', 'Playlist added to your library.');
          } catch (e: any) {
            Alert.alert('Import failed', e.message);
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
          {playlist.track_count} {playlist.track_count === 1 ? 'track' : 'tracks'}
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
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [playlist.id, getPlaylistTracks]);

  useEffect(() => { load(); }, [load]);

  const sharePlaylist = async () => {
    const link = buildShareLink(playlist.share_code);
    try {
      await Share.share({
        message: `Check out my playlist "${playlist.name}" on VinylPlayer:\n${link}`,
      });
    } catch {}
  };

  const handleRemove = (trackId: string, title: string) => {
    Alert.alert('Remove from playlist', title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
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
      {/* Header */}
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

      {/* Share code pill */}
      <View style={styles.sharePill}>
        <Ionicons name="link-outline" size={13} color={COLORS.textMuted} />
        <Text style={styles.shareCode} selectable>{playlist.share_code}</Text>
        <Text style={styles.shareLabel}>share code</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="musical-note-outline" size={48} color={COLORS.surfaceLight} />
          <Text style={styles.emptyTitle}>No tracks yet</Text>
          <Text style={styles.emptyHint}>Tap + to add tracks from your library</Text>
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
                navigation.navigate('Player');
              }}
              onRemove={() => handleRemove(item.track_id, item.track.title)}
            />
          )}
        />
      )}

      <TouchableOpacity style={styles.deleteFooter} onPress={onDelete}>
        <Ionicons name="trash-outline" size={15} color={COLORS.error} />
        <Text style={styles.deleteFooterText}>Delete playlist</Text>
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
          <Text style={styles.sheetTitle}>New playlist</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            autoFocus
            maxLength={80}
          />
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAccent, !name.trim() && { opacity: 0.4 }]}
              disabled={!name.trim()}
              onPress={() => onCreate(name)}
            >
              <Text style={styles.btnAccentText}>Create</Text>
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
          <Text style={styles.sheetTitle}>Import playlist</Text>
          <Text style={styles.sheetHint}>Paste a share link or 12-character code</Text>
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
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAccent, !value.trim() && { opacity: 0.4 }]}
              disabled={!value.trim()}
              onPress={() => onImport(value)}
            >
              <Text style={styles.btnAccentText}>Import</Text>
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
      Alert.alert('Error', e.message);
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
            Add tracks
          </Text>
        </View>
        {libraryTracks.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No tracks in library</Text>
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
                      {item.artist ?? 'Unknown Artist'}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', marginLeft: 'auto', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600', marginTop: 8 },
  emptyHint: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },

  /* Playlist card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  cardMeta: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.mono },
  cardAction: { padding: 6 },

  /* Share pill */
  sharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shareCode: {
    color: COLORS.accent,
    fontSize: 13,
    fontFamily: FONTS.mono,
    fontWeight: '700',
    letterSpacing: 1,
  },
  shareLabel: { color: COLORS.textMuted, fontSize: 11 },

  /* Delete footer */
  deleteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  deleteFooterText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },

  /* Modals */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 22,
    gap: 14,
  },
  sheetTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  sheetHint: { color: COLORS.textMuted, fontSize: 12, marginTop: -6 },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceHighlight,
  },
  sheetActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  btnGhost: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnGhostText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  btnAccent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
  },
  btnAccentText: { color: COLORS.background, fontSize: 14, fontWeight: '700' },

  /* Add tracks modal rows */
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  addRowCheck: { width: 28, alignItems: 'center' },
  addRowTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  addRowMeta: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.mono, marginTop: 2 },
});
