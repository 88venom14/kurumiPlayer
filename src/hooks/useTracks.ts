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
      if (!user) throw new Error('Не авторизован');

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
      if (!user) throw new Error('Не авторизован');

      const trackId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });

      const duration = await readLocalDuration(upload.audioUri);

      const filePath = await uploadAudio(
        user.id,
        trackId,
        upload.audioUri,
        upload.audioMimeType
      );

      let coverPath: string | null = null;
      if (upload.coverUri && upload.coverMimeType) {
        coverPath = await uploadCover(
          user.id,
          trackId,
          upload.coverUri,
          upload.coverMimeType
        );
      }

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

    const track = tracks.find((t) => t.id === trackId);

    const { error: deleteError } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId);

    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }

    if (track) {
      deleteTrackFiles(track.user_id, trackId).catch(() => { });
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
