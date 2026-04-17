import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Playlist,
  PlaylistTrack,
  PlaylistWithCount,
  extractShareCode,
} from '../types/playlist';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<PlaylistWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('playlists')
        .select('*, playlist_tracks(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped: PlaylistWithCount[] = (data ?? []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        name: p.name,
        share_code: p.share_code,
        created_at: p.created_at,
        track_count: p.playlist_tracks?.[0]?.count ?? 0,
      }));
      setPlaylists(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlaylist = useCallback(async (name: string): Promise<Playlist> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('playlists')
      .insert({ user_id: user.id, name: name.trim() })
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchPlaylists();
    return data;
  }, [fetchPlaylists]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    const { error: delError } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);
    if (delError) throw delError;
    await fetchPlaylists();
  }, [fetchPlaylists]);

  const renamePlaylist = useCallback(async (playlistId: string, name: string) => {
    const { error: updError } = await supabase
      .from('playlists')
      .update({ name: name.trim() })
      .eq('id', playlistId);
    if (updError) throw updError;
    await fetchPlaylists();
  }, [fetchPlaylists]);

  /** Adds a track. Duplicates are prevented at DB level via composite PK. */
  const addTrackToPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      const { data: posData } = await supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);
      const nextPos = (posData?.[0]?.position ?? -1) + 1;

      const { error: insErr } = await supabase
        .from('playlist_tracks')
        .insert({ playlist_id: playlistId, track_id: trackId, position: nextPos });

      // 23505 = unique_violation (duplicate). Treat as no-op.
      if (insErr && insErr.code !== '23505') throw insErr;
    },
    []
  );

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      const { error: delErr } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId);
      if (delErr) throw delErr;
    },
    []
  );

  const getPlaylistTracks = useCallback(
    async (playlistId: string): Promise<PlaylistTrack[]> => {
      const { data, error: fetchErr } = await supabase
        .from('playlist_tracks')
        .select('*, track:tracks(*)')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });
      if (fetchErr) throw fetchErr;
      return (data ?? []).filter((r: any) => r.track) as PlaylistTrack[];
    },
    []
  );

  /**
   * Import a playlist by share link or code.
   * Creates a NEW playlist owned by the current user, referencing the
   * same tracks as the source playlist (no track duplication).
   */
  const importPlaylist = useCallback(
    async (linkOrCode: string): Promise<Playlist> => {
      const code = extractShareCode(linkOrCode);
      if (!code) throw new Error('Invalid share link');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: source, error: srcErr } = await supabase
        .from('playlists')
        .select('id, name')
        .eq('share_code', code)
        .maybeSingle();
      if (srcErr) throw srcErr;
      if (!source) throw new Error('Playlist not found');

      const { data: sourceTracks, error: stErr } = await supabase
        .from('playlist_tracks')
        .select('track_id, position')
        .eq('playlist_id', source.id)
        .order('position', { ascending: true });
      if (stErr) throw stErr;

      const { data: newPlaylist, error: insErr } = await supabase
        .from('playlists')
        .insert({ user_id: user.id, name: `${source.name} (imported)` })
        .select()
        .single();
      if (insErr) throw insErr;

      if (sourceTracks && sourceTracks.length > 0) {
        const rows = sourceTracks.map((r: any, i: number) => ({
          playlist_id: newPlaylist.id,
          track_id: r.track_id,
          position: i,
        }));
        const { error: copyErr } = await supabase
          .from('playlist_tracks')
          .insert(rows);
        if (copyErr) throw copyErr;
      }

      await fetchPlaylists();
      return newPlaylist;
    },
    [fetchPlaylists]
  );

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return {
    playlists,
    loading,
    error,
    fetchPlaylists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getPlaylistTracks,
    importPlaylist,
  };
}
