import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/UploadButton.styles';
import { UploadButtonProps } from '../types/props';
import { useUploadForm } from '../hooks/useUploadForm';
import { UploadModal } from './UploadModal';

export function UploadButton({ onUpload, uploading }: UploadButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const form = useUploadForm(onUpload);

  const handleClose = () => {
    form.resetForm();
    setModalVisible(false);
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

      <UploadModal
        visible={modalVisible}
        uploading={uploading}
        title={form.title}
        setTitle={form.setTitle}
        artist={form.artist}
        setArtist={form.setArtist}
        audioFile={form.audioFile}
        coverFile={form.coverFile}
        pickAudio={form.pickAudio}
        pickCover={form.pickCover}
        onSubmit={() => form.handleUpload(() => setModalVisible(false))}
        onClose={handleClose}
      />
    </>
  );
}
