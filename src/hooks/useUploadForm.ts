import { useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { TrackUpload } from '../types/track';
import { AudioFile, CoverFile } from '../types/upload';
import { ALLOWED_AUDIO_TYPES, MAX_FILE_SIZE } from '../constants/upload';
import { IMAGE_ASPECT_RATIO, IMAGE_QUALITY } from '../constants/media';

export function useUploadForm(onUpload: (data: TrackUpload) => Promise<void>) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [coverFile, setCoverFile] = useState<CoverFile | null>(null);

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
        Alert.alert('Файл слишком большой', 'Максимальный размер файла — 50 МБ');
        return;
      }
      setAudioFile({ uri: file.uri, mimeType: file.mimeType ?? 'audio/mpeg', name: file.name });
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    } catch {
      Alert.alert('Ошибка', 'Не удалось выбрать аудиофайл');
    }
  };

  const pickCover = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: IMAGE_ASPECT_RATIO,
        quality: IMAGE_QUALITY,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      setCoverFile({
        uri: asset.uri,
        mimeType: asset.type === 'image' ? 'image/jpeg' : (asset.mimeType ?? 'image/jpeg'),
      });
    } catch {
      Alert.alert('Ошибка', 'Не удалось выбрать обложку');
    }
  };

  const handleUpload = async (onSuccess: () => void) => {
    if (!audioFile) { Alert.alert('Ошибка', 'Выберите аудиофайл'); return; }
    if (!title.trim()) { Alert.alert('Ошибка', 'Введите название трека'); return; }

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
      onSuccess();
    } catch (error: any) {
      Alert.alert('Ошибка загрузки', error.message);
    }
  };

  return { title, setTitle, artist, setArtist, audioFile, coverFile, resetForm, pickAudio, pickCover, handleUpload };
}
