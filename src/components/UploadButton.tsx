import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../theme/colors';
import { TrackUpload } from '../types/track';

interface UploadButtonProps {
  onUpload: (data: TrackUpload) => Promise<void>;
  uploading: boolean;
}

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/aac',
  'audio/mp4',
  'audio/flac',
  'audio/x-flac',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function UploadButton({ onUpload, uploading }: UploadButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<{
    uri: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [coverFile, setCoverFile] = useState<{
    uri: string;
    mimeType: string;
  } | null>(null);

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAudioFile(null);
    setCoverFile(null);
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_AUDIO_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (file.size && file.size > MAX_FILE_SIZE) {
        Alert.alert('File too large', 'Maximum file size is 50MB');
        return;
      }

      setAudioFile({
        uri: file.uri,
        mimeType: file.mimeType ?? 'audio/mpeg',
        name: file.name,
      });

      // Auto-fill title from filename
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const pickCover = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setCoverFile({
        uri: asset.uri,
        mimeType: asset.type === 'image' ? 'image/jpeg' : (asset.mimeType ?? 'image/jpeg'),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick cover image');
    }
  };

  const handleUpload = async () => {
    if (!audioFile) {
      Alert.alert('Error', 'Please select an audio file');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a track title');
      return;
    }

    try {
      await onUpload({
        title: title.trim(),
        artist: artist.trim() || undefined,
        audioUri: audioFile.uri,
        audioMimeType: audioFile.mimeType,
        coverUri: coverFile?.uri,
        coverMimeType: coverFile?.mimeType,
      });

      resetForm();
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.uploadFab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.background} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!uploading) {
            resetForm();
            setModalVisible(false);
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Track</Text>

            {/* Audio File Picker */}
            <TouchableOpacity style={styles.filePicker} onPress={pickAudio}>
              <Ionicons
                name={audioFile ? 'musical-note' : 'cloud-upload'}
                size={20}
                color={audioFile ? COLORS.accent : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.filePickerText,
                  audioFile && styles.filePickerTextSelected,
                ]}
                numberOfLines={1}
              >
                {audioFile?.name ?? 'Select audio file (mp3, aac, flac)'}
              </Text>
            </TouchableOpacity>

            {/* Title Input */}
            <TextInput
              style={styles.input}
              placeholder="Track Title *"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Artist Input */}
            <TextInput
              style={styles.input}
              placeholder="Artist (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={artist}
              onChangeText={setArtist}
            />

            {/* Cover Image Picker */}
            <TouchableOpacity style={styles.filePicker} onPress={pickCover}>
              <Ionicons
                name={coverFile ? 'image' : 'image-outline'}
                size={20}
                color={coverFile ? COLORS.accent : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.filePickerText,
                  coverFile && styles.filePickerTextSelected,
                ]}
              >
                {coverFile ? 'Cover image selected' : 'Add cover image (optional)'}
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.background} />
                ) : (
                  <Text style={styles.submitButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  uploadFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 15,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  filePickerText: {
    color: COLORS.textMuted,
    fontSize: 14,
    flex: 1,
  },
  filePickerTextSelected: {
    color: COLORS.accent,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '700',
  },
});
