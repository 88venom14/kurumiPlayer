import { useEffect, useState } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../../types/track';
import { COLORS } from '../../theme/colors';
import { styles } from '../../styles/PlaylistsScreen.styles';

interface AddTracksModalProps {
  visible: boolean;
  onClose: () => void;
  libraryTracks: Track[];
  existingIds: Set<string>;
  onToggle: (trackId: string, isCurrentlyAdded: boolean) => Promise<void>;
}

export function AddTracksModal({
  visible, onClose, libraryTracks, existingIds, onToggle,
}: AddTracksModalProps) {
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
