import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaylistWithCount } from '../../types/playlist';
import { COLORS } from '../../theme/colors';
import { styles } from '../../styles/PlaylistsScreen.styles';
import { pluralTracks } from '../../utils/format';

interface PlaylistCardProps {
  playlist: PlaylistWithCount;
  onPress: () => void;
  onDelete: () => void;
}

export function PlaylistCard({ playlist, onPress, onDelete }: PlaylistCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardIcon}>
        <Ionicons name="musical-notes" size={26} color={COLORS.accent} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {playlist.name}
        </Text>
        <Text style={styles.cardMeta}>
          {playlist.track_count} {pluralTracks(playlist.track_count)}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={12} style={styles.cardAction}>
        <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}
