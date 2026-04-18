import { create } from 'zustand';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Track, RepeatMode } from '../types/track';
import { PlayerStore } from '../types/store';
import { getPublicUrl } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { addListenedMs } from '../lib/listenedTime';

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  isShuffled: false,
  repeatMode: 'off',
  progress: 0,
  duration: 0,
  volume: 0.8,
  sound: null,
  isLoading: false,

  setPlaylist: (tracks) => set({ playlist: tracks }),

  playTrack: async (track) => {
    const { sound: currentSound, volume } = get();

    if (currentSound) {
      await currentSound.unloadAsync();
    }

    set({ isLoading: true, currentTrack: track, progress: 0, duration: 0 });

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });

      const url = getPublicUrl(track.file_path);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        {
          shouldPlay: true,
          volume,
          progressUpdateIntervalMillis: 500,
        },
        onPlaybackStatusUpdate
      );

      set({ sound: newSound, isPlaying: true, isLoading: false });
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
      set({ isLoading: false, isPlaying: false });
    }
  },

  togglePlayPause: async () => {
    const { sound, isPlaying } = get();
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      set({ isPlaying: false });
    } else {
      await sound.playAsync();
      set({ isPlaying: true });
    }
  },

  playNext: async () => {
    const { playlist, currentTrack, isShuffled, repeatMode, playTrack } = get();
    if (playlist.length === 0 || !currentTrack) return;

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    if (repeatMode === 'one') {
      await playTrack(currentTrack);
      return;
    }

    let nextIndex: number;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    await playTrack(playlist[nextIndex]);
  },

  playPrevious: async () => {
    const { playlist, currentTrack, progress, playTrack } = get();
    if (playlist.length === 0 || !currentTrack) return;

    if (progress > 3000) {
      const { sound } = get();
      if (sound) {
        await sound.setPositionAsync(0);
        set({ progress: 0 });
      }
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) return;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    await playTrack(playlist[prevIndex]);
  },

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  cycleRepeatMode: () =>
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { repeatMode: modes[nextIndex] };
    }),

  seekTo: async (position) => {
    const { sound } = get();
    if (!sound) return;
    await sound.setPositionAsync(position);
    set({ progress: position });
  },

  setVolume: async (volume) => {
    const { sound } = get();
    if (sound) {
      await sound.setVolumeAsync(volume);
    }
    set({ volume });
  },

  cleanup: async () => {
    const { sound } = get();
    if (sound) {
      await sound.unloadAsync();
    }
    set({ sound: null, isPlaying: false, currentTrack: null, progress: 0, duration: 0 });
  },
}));

let lastPosition = 0;
let lastUpdateTs = 0;

function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
  if (!status.isLoaded) return;

  const now = Date.now();
  if (status.isPlaying && lastUpdateTs > 0) {
    const elapsed = now - lastUpdateTs;
    const positionDelta = status.positionMillis - lastPosition;
    if (positionDelta > 0 && positionDelta < 2000 && elapsed < 2000) {
      addListenedMs(elapsed);
    }
  }
  lastPosition = status.positionMillis;
  lastUpdateTs = status.isPlaying ? now : 0;

  const durationMillis = status.durationMillis ?? 0;

  if (durationMillis > 0) {
    const { currentTrack } = usePlayerStore.getState();
    if (currentTrack && !currentTrack.duration) {
      const updated = { ...currentTrack, duration: durationMillis };
      usePlayerStore.setState({ currentTrack: updated });
      supabase
        .from('tracks')
        .update({ duration: durationMillis })
        .eq('id', currentTrack.id)
        .then(() => { });
    }
  }

  usePlayerStore.setState({
    progress: status.positionMillis,
    duration: durationMillis,
    isPlaying: status.isPlaying,
  });

  if (status.didJustFinish) {
    usePlayerStore.getState().playNext();
  }
}
