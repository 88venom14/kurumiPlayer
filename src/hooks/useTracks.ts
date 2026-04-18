import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { Track, TrackUpload } from '../types/track';
import { uploadAudio, uploadCover, deleteTrackFiles, getPublicUrl, downloadWithTimeout } from '../lib/storage';
import { AUDIO_DOWNLOAD_TIMEOUT_MS, COVER_DOWNLOAD_TIMEOUT_MS } from '../constants/network';
import { generateUuid } from '../utils/format';

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

      const trackId = generateUuid();

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

  const copyTrackToLibrary = useCallback(async (track: Track) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Не авторизован');

    const newId = generateUuid();
    const ext = track.file_path.split('.').pop() ?? 'mp3';
    const mimeType = ext === 'flac' ? 'audio/flac' : ext === 'aac' ? 'audio/aac' : 'audio/mpeg';
    const tempAudio = `${FileSystem.cacheDirectory}copy_audio_${Date.now()}.${ext}`;

    let filePath: string;
    try {
      const audioDownload = await downloadWithTimeout(getPublicUrl(track.file_path), tempAudio, AUDIO_DOWNLOAD_TIMEOUT_MS);
      if (audioDownload.status !== 200)
        throw new Error(`Не удалось скачать аудио (статус ${audioDownload.status})`);
      filePath = await uploadAudio(user.id, newId, tempAudio, mimeType);
    } finally {
      await FileSystem.deleteAsync(tempAudio, { idempotent: true });
    }

    let coverPath: string | null = null;
    if (track.cover_path) {
      const coverExt = track.cover_path.split('.').pop() ?? 'jpg';
      const coverMime = coverExt === 'png' ? 'image/png' : 'image/jpeg';
      const tempCover = `${FileSystem.cacheDirectory}copy_cover_${Date.now()}.${coverExt}`;
      try {
        const coverDownload = await downloadWithTimeout(getPublicUrl(track.cover_path), tempCover, COVER_DOWNLOAD_TIMEOUT_MS);
        if (coverDownload.status === 200)
          coverPath = await uploadCover(user.id, newId, tempCover, coverMime);
      } catch (err: any) {
        console.warn('Не удалось загрузить обложку:', err.message);
      } finally {
        await FileSystem.deleteAsync(tempCover, { idempotent: true });
      }
    }

    const { error: insertError } = await supabase.from('tracks').insert({
      id: newId,
      user_id: user.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      file_path: filePath,
      cover_path: coverPath,
    });
    if (insertError) throw insertError;
    await fetchTracks();
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
    copyTrackToLibrary,
  };
}
