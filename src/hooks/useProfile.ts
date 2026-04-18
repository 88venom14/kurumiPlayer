import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { uploadAvatar, getPublicUrl } from '../lib/storage';
import { IMAGE_ASPECT_RATIO, IMAGE_QUALITY } from '../constants/media';
import { getListenedMs } from '../lib/listenedTime';
import { usePlayerStore } from '../store/playerStore';
import { Profile } from '../types/profile';

export function useProfile() {
  const progress = usePlayerStore((s) => s.progress);

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [listenedMs, setListenedMs] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    setEmail(user.email ?? '');

    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_path')
      .eq('id', user.id)
      .single();

    const profile = data as Profile | null;
    const displayName = profile?.display_name ?? '';
    const avatar = profile?.avatar_path ?? null;
    setName(displayName);
    setSavedName(displayName);
    setAvatarPath(avatar);
    setListenedMs(await getListenedMs());
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => { getListenedMs().then(setListenedMs); }, [progress]);

  const saveProfile = async () => {
    if (!name.trim() || !userId) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: name.trim(),
      avatar_path: avatarPath,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      Alert.alert('Ошибка', error.message);
    } else {
      setSavedName(name.trim());
      Alert.alert('Сохранено', 'Профиль обновлён');
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: IMAGE_ASPECT_RATIO,
      quality: IMAGE_QUALITY,
    });
    if (result.canceled || !userId) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';

    setUploadingAvatar(true);
    try {
      const path = await uploadAvatar(userId, asset.uri, mimeType);
      setAvatarPath(path);
      await supabase.from('profiles').upsert({
        id: userId,
        display_name: savedName,
        avatar_path: path,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatarUrl = avatarPath ? getPublicUrl(avatarPath) : null;
  const nameChanged = name.trim() !== savedName && name.trim().length > 0;

  return {
    email, name, setName, savedName, listenedMs,
    saving, uploadingAvatar,
    saveProfile, pickAvatar,
    avatarUrl, nameChanged,
  };
}
