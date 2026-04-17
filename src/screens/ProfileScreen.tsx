import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { uploadAvatar, getPublicUrl } from '../lib/storage';
import { useTracks } from '../hooks/useTracks';
import { getListenedMs, usePlayerStore } from '../store/playerStore';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/colors';

interface Profile {
  display_name: string;
  avatar_path: string | null;
}

function formatListened(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes} мин`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours} ч ${mins} м`;
}

function pluralTracks(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'трек';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'трека';
  return 'треков';
}

export function ProfileScreen() {
  const { tracks } = useTracks();
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

    const displayName = (data as Profile | null)?.display_name ?? '';
    const avatar = (data as Profile | null)?.avatar_path ?? null;
    setName(displayName);
    setSavedName(displayName);
    setAvatarPath(avatar);
    setListenedMs(await getListenedMs());
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => {
    getListenedMs().then(setListenedMs);
  }, [progress]);

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
      aspect: [1, 1],
      quality: 0.8,
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
  const totalDurationMs = tracks.reduce((acc, t) => acc + (t.duration ?? 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickAvatar} disabled={uploadingAvatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={44} color={COLORS.accent} />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              {uploadingAvatar
                ? <ActivityIndicator size="small" color={COLORS.background} />
                : <Ionicons name="camera" size={14} color={COLORS.background} />}
            </View>
          </TouchableOpacity>
          <Text style={styles.displayName}>{savedName || 'Нажмите, чтобы указать имя'}</Text>
          <Text style={styles.emailCaption}>{email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Отображаемое имя</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Введите имя"
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity
              style={[styles.saveBtn, !nameChanged && styles.saveBtnDisabled]}
              onPress={saveProfile}
              disabled={!nameChanged || saving}
            >
              {saving
                ? <ActivityIndicator size="small" color={COLORS.background} />
                : <Ionicons name="checkmark" size={20} color={COLORS.background} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Email</Text>
          <View style={styles.readOnly}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.readOnlyText} numberOfLines={1}>{email}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="musical-notes" size={22} color={COLORS.accent} />
            <Text style={styles.statValue}>{tracks.length}</Text>
            <Text style={styles.statLabel}>{pluralTracks(tracks.length)}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="headset" size={22} color={COLORS.accent} />
            <Text style={styles.statValue}>{formatListened(listenedMs)}</Text>
            <Text style={styles.statLabel}>Прослушано</Text>
          </View>
        </View>

        {totalDurationMs > 0 && (
          <View style={styles.infoCard}>
            <Ionicons name="library-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              Библиотека: {formatListened(totalDurationMs)} всего
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() =>
            Alert.alert('Выйти', 'Вы уверены?', [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Выйти', style: 'destructive', onPress: () => supabase.auth.signOut() },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Выйти</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: 40, gap: SPACING.lg },
  avatarSection: { alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  avatarWrapper: { position: 'relative', marginBottom: SPACING.sm },
  avatarImage: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: COLORS.accent,
  },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.accentGlow,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.background,
  },
  displayName: {
    color: COLORS.text, fontSize: 22,
    fontWeight: '800', fontFamily: FONTS.serif,
  },
  emailCaption: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.mono },
  section: { gap: SPACING.xs },
  sectionLabel: {
    color: COLORS.textMuted, fontSize: 11, fontWeight: '600',
    letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4,
  },
  inputRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  input: {
    flex: 1, backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md, color: COLORS.text, fontSize: 15,
  },
  saveBtn: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.35 },
  readOnly: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderWidth: 1, borderColor: COLORS.surfaceLight,
  },
  readOnlyText: { color: COLORS.textSecondary, fontSize: 15, flex: 1 },
  statsRow: { flexDirection: 'row', gap: SPACING.md },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.surfaceLight,
  },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: '800', fontFamily: FONTS.mono },
  statLabel: { color: COLORS.textMuted, fontSize: 12 },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.surfaceLight,
  },
  infoText: { color: COLORS.textSecondary, fontSize: 13 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.surfaceLight, marginTop: SPACING.sm,
  },
  signOutText: { color: COLORS.error, fontSize: 15, fontWeight: '600' },
});
