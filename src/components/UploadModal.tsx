import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/UploadButton.styles';
import { AudioFile, CoverFile } from '../types/upload';

interface UploadModalProps {
  visible: boolean;
  uploading: boolean;
  title: string;
  setTitle: (v: string) => void;
  artist: string;
  setArtist: (v: string) => void;
  audioFile: AudioFile | null;
  coverFile: CoverFile | null;
  pickAudio: () => void;
  pickCover: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function UploadModal({
  visible,
  uploading,
  title,
  setTitle,
  artist,
  setArtist,
  audioFile,
  coverFile,
  pickAudio,
  pickCover,
  onSubmit,
  onClose,
}: UploadModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Загрузить трек</Text>

          <TouchableOpacity style={styles.filePicker} onPress={pickAudio}>
            <Ionicons
              name={audioFile ? 'musical-note' : 'cloud-upload'}
              size={20}
              color={audioFile ? COLORS.accent : COLORS.textMuted}
            />
            <Text
              style={[styles.filePickerText, audioFile && styles.filePickerTextSelected]}
              numberOfLines={1}
            >
              {audioFile?.name ?? 'Выберите аудиофайл (mp3, aac, flac)'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Название трека *"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="Исполнитель (необязательно)"
            placeholderTextColor={COLORS.textMuted}
            value={artist}
            onChangeText={setArtist}
          />

          <TouchableOpacity style={styles.filePicker} onPress={pickCover}>
            <Ionicons
              name={coverFile ? 'image' : 'image-outline'}
              size={20}
              color={coverFile ? COLORS.accent : COLORS.textMuted}
            />
            <Text style={[styles.filePickerText, coverFile && styles.filePickerTextSelected]}>
              {coverFile ? 'Обложка выбрана' : 'Добавить обложку (необязательно)'}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={uploading}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
              onPress={onSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={COLORS.background} />
              ) : (
                <Text style={styles.submitButtonText}>Загрузить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
