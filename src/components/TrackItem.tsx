import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { getPublicUrl } from '../lib/storage';
import { styles } from '../styles/TrackItem.styles';
import { TrackItemProps } from '../types/props';
import { EqualizerBars } from './EqualizerBars';
import { formatDuration } from '../utils/format';

function TrackAction({ onSave, isSaved, isSaving, onRemove, onDelete, duration }: {
  onSave?: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
  onRemove?: () => void;
  onDelete?: () => void;
  duration: number | null;
}) {
  if (onSave) {
    return (
      <TouchableOpacity onPress={isSaving || isSaved ? undefined : onSave} hitSlop={10} style={styles.removeBtn}>
        {isSaving
          ? <ActivityIndicator size="small" color={COLORS.accent} />
          : <Ionicons name={isSaved ? 'checkmark-circle' : 'download-outline'} size={20} color={isSaved ? COLORS.accent : COLORS.textMuted} />
        }
      </TouchableOpacity>
    );
  }
  if (onRemove) {
    return (
      <TouchableOpacity onPress={onRemove} hitSlop={10} style={styles.removeBtn}>
        <Ionicons name="remove-circle-outline" size={22} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }
  if (onDelete) {
    return (
      <TouchableOpacity onPress={onDelete} hitSlop={10} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }
  return <Text style={styles.duration}>{formatDuration(duration)}</Text>;
}

export function TrackItem({
  track,
  index,
  isActive,
  isPlaying,
  onPress,
  onLongPress,
  onRemove,
  onDelete,
  onSave,
  isSaved,
  isSaving,
}: TrackItemProps) {
  const coverUrl = track.cover_path ? getPublicUrl(track.cover_path) : null;

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.7}
    >
      <View style={styles.numberContainer}>
        {isActive && isPlaying
          ? <EqualizerBars />
          : <Text style={[styles.number, isActive && styles.activeText]}>{index + 1}</Text>
        }
      </View>

      <View style={styles.thumbnail}>
        {coverUrl
          ? <Image source={{ uri: coverUrl }} style={styles.thumbnailImage} />
          : <View style={styles.thumbnailPlaceholder}><Ionicons name="musical-note" size={18} color={COLORS.textMuted} /></View>
        }
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, isActive && styles.activeText]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist ?? 'Неизвестный исполнитель'}
        </Text>
      </View>

      <TrackAction
        onSave={onSave}
        isSaved={isSaved}
        isSaving={isSaving}
        onRemove={onRemove}
        onDelete={onDelete}
        duration={track.duration}
      />
    </TouchableOpacity>
  );
}
