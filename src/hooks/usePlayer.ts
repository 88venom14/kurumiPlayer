import { useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { Track } from '../types/track';

export function usePlayer() {
  const store = usePlayerStore();

  const playTrackFromList = useCallback(
    async (track: Track, playlist: Track[]) => {
      store.setPlaylist(playlist);
      await store.playTrack(track);
    },
    [store]
  );

  const formatTime = useCallback((millis: number): string => {
    if (!millis || millis <= 0) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...store,
    playTrackFromList,
    formatTime,
  };
}
