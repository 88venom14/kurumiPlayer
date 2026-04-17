import React, { useCallback } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import { Track } from '../types/track';
import { TrackItem } from './TrackItem';
import { COLORS } from '../theme/colors';
import { styles } from '../styles/TrackList.styles';
import { TrackListProps } from '../types/props';

export function TrackList({
  tracks,
  currentTrackId,
  isPlaying,
  onTrackPress,
  onTrackLongPress,
  onTrackDelete,
  refreshing,
  onRefresh,
}: TrackListProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: Track; index: number }) => (
      <TrackItem
        track={item}
        index={index}
        isActive={item.id === currentTrackId}
        isPlaying={item.id === currentTrackId && isPlaying}
        onPress={() => onTrackPress(item)}
        onLongPress={onTrackLongPress ? () => onTrackLongPress(item) : undefined}
        onDelete={onTrackDelete ? () => onTrackDelete(item) : undefined}
      />
    ),
    [currentTrackId, isPlaying, onTrackPress, onTrackLongPress, onTrackDelete]
  );

  const keyExtractor = useCallback((item: Track) => item.id, []);

  if (tracks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Треков пока нет</Text>
        <Text style={styles.emptySubtext}>
          Загрузите первый трек, чтобы начать
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tracks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.accent}
        />
      }
    />
  );
}

