import { Track, TrackUpload, RepeatMode } from './track';

export interface ControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  isLoading?: boolean;
}

export interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek: (value: number) => void;
  formatTime: (millis: number) => string;
}

export interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (value: number) => void;
}

export interface UploadButtonProps {
  onUpload: (data: TrackUpload) => Promise<void>;
  uploading: boolean;
}

export interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
}

export interface TrackListProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onTrackPress: (track: Track) => void;
  onTrackDelete?: (track: Track) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export interface VinylProps {
  isPlaying: boolean;
  coverPath: string | null;
  size?: number;
}
