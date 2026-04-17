import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { styles } from '../../styles/PlaylistsScreen.styles';

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreatePlaylistModal({ visible, onClose, onCreate }: CreatePlaylistModalProps) {
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
