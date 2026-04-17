import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { supabase } from '../lib/supabase';
import { Track, TrackUpload } from '../types/track';
import { uploadAudio, uploadCover, deleteTrackFiles } from '../lib/storage';

async function readLocalDuration(uri: string): Promise<number | null> {
  try {
    const { sound, status } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false }
    );
    const duration = status.isLoaded ? (status.durationMillis ?? null) : null;
    await sound.unloadAsync();
    return duration;
  } catch {
    return null;
  }
}

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTracks(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadTrack = useCallback(async (upload: TrackUpload) => {
    try {
      setUploading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const trackId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });

      // Read duration from local file before uploading (free, no network)
      const duration = await readLocalDuration(upload.audioUri);

      // Upload audio file
      const filePath = await uploadAudio(
        user.id,
        trackId,
        upload.audioUri,
        upload.audioMimeType
      );

      // Upload cover image (optional)
      let coverPath: string | null = null;
      if (upload.coverUri && upload.coverMimeType) {
        coverPath = await uploadCover(
          user.id,
          trackId,
          upload.coverUri,
          upload.coverMimeType
        );
      }

      // Insert metadata into database
      const { error: insertError } = await supabase.from('tracks').insert({
        id: trackId,
        user_id: user.id,
        title: upload.title,
        artist: upload.artist ?? null,
        duration,
        file_path: filePath,
        cover_path: coverPath,
      });

      if (insertError) throw insertError;

      // Refresh track list
      await fetchTracks();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [fetchTracks]);

  const deleteTrack = useCallback(async (trackId: string) => {
    setError(null);

    // Fetch the track first so we know the user_id for storage cleanup
    const track = tracks.find((t) => t.id === trackId);

    const { error: deleteError } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId);

    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }

    // Delete audio + cover files from storage (best-effort, don't block on errors)
    if (track) {
      deleteTrackFiles(track.user_id, trackId).catch(() => {});
    }

    await fetchTracks();
  }, [tracks, fetchTracks]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return {
    tracks,
    loading,
    uploading,
    error,
    fetchTracks,
    uploadTrack,
    deleteTrack,
  };
}
