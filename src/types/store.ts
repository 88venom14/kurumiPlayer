import { Audio } from 'expo-av';
import { Track, RepeatMode } from './track';

export interface PlayerStore {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  progress: number;
  duration: number;
  volume: number;
  sound: Audio.Sound | null;
  isLoading: boolean;

  setPlaylist: (tracks: Track[]) => void;
  playTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  cleanup: () => Promise<void>;
}
