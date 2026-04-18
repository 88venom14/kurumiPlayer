export interface Track {
  id: string;
  user_id: string;
  title: string;
  artist: string | null;
  duration: number | null;
  file_path: string;
  cover_path: string | null;
  created_at: string;
}

export interface TrackUpload {
  title: string;
  artist?: string;
  audioUri: string;
  audioMimeType: string;
  coverUri?: string;
  coverMimeType?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
