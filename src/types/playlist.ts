import { Track } from './track';

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  share_code: string;
  created_at: string;
}

export interface PlaylistWithCount extends Playlist {
  track_count: number;
}

export interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  position: number;
  added_at: string;
  track: Track;
}

export function buildShareLink(shareCode: string): string {
  return `vinylplayer://playlist/${shareCode}`;
}

export function extractShareCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/([a-f0-9]{12})(?:\/|$)/i);
  if (match) return match[1].toLowerCase();
  if (/^[a-f0-9]{12}$/i.test(trimmed)) return trimmed.toLowerCase();
  return null;
}
