import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/track';
import { COLORS, FONTS } from '../theme/colors';
import { getPublicUrl } from '../lib/storage';

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  onDelete?: () => void;
}

function EqualizerBars() {
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.6);
  const bar3 = useSharedValue(0.4);

  React.useEffect(() => {
    bar1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.2, { duration: 300 })
      ),
      -1,
      true
    );
    bar2.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 300 }),
        withTiming(0.3, { duration: 400 })
      ),
      -1,
      true
    );
    bar3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.1, { duration: 350 })
      ),
      -1,
      true
    );
  }, []);

  const style1 = useAnimatedStyle(() => ({ height: bar1.value * 16 }));
  const style2 = useAnimatedStyle(() => ({ height: bar2.value * 16 }));
  const style3 = useAnimatedStyle(() => ({ height: bar3.value * 16 }));

  return (
    <View style={eqStyles.container}>
      <Animated.View style={[eqStyles.bar, style1]} />
      <Animated.View style={[eqStyles.bar, style2]} />
      <Animated.View style={[eqStyles.bar, style3]} />
    </View>
  );
}

const eqStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  bar: {
    width: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
});

export function TrackItem({
  track,
  index,
  isActive,
  isPlaying,
  onPress,
  onLongPress,
  onRemove,
  onDelete,
}: TrackItemProps) {
  const coverUrl = track.cover_path ? getPublicUrl(track.cover_path) : null;

  const formatDuration = (ms: number | null): string => {
    if (!ms) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.7}
    >
      <View style={styles.numberContainer}>
        {isActive && isPlaying ? (
          <EqualizerBars />
        ) : (
          <Text style={[styles.number, isActive && styles.activeText]}>
            {index + 1}
          </Text>
        )}
      </View>

      <View style={styles.thumbnail}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.thumbnailImage} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="musical-note" size={18} color={COLORS.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.title, isActive && styles.activeText]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist ?? 'Неизвестный исполнитель'}
        </Text>
      </View>

      {onRemove ? (
        <TouchableOpacity onPress={onRemove} hitSlop={10} style={styles.removeBtn}>
          <Ionicons name="remove-circle-outline" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      ) : onDelete ? (
        <TouchableOpacity onPress={onDelete} hitSlop={10} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      ) : (
        <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 2,
  },
  activeContainer: {
    backgroundColor: COLORS.accentGlow,
  },
  numberContainer: {
    width: 24,
    alignItems: 'center',
  },
  number: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.mono,
  },
  activeText: {
    color: COLORS.accent,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: 44,
    height: 44,
  },
  thumbnailPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONTS.mono,
  },
  duration: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.mono,
  },
  removeBtn: {
    padding: 2,
  },
});
