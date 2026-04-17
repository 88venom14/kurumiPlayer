import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { styles } from '../../styles/PlaylistsScreen.styles';

interface ImportPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (code: string) => void;
}

export function ImportPlaylistModal({ visible, onClose, onImport }: ImportPlaylistModalProps) {
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
