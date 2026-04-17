import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTracks } from '../hooks/useTracks';
import { useProfile } from '../hooks/useProfile';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/ProfileScreen.styles';
import { formatListened, pluralTracks } from '../utils/format';

export function ProfileScreen() {
  const { tracks } = useTracks();
  const {
    email, name, setName, savedName, listenedMs,
    saving, uploadingAvatar,
    saveProfile, pickAvatar,
    avatarUrl, nameChanged,
  } = useProfile();

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
