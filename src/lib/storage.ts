import * as FileSystem from 'expo-file-system';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

const BUCKET = 'tracks';

async function uploadFile(path: string, fileUri: string, mimeType: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? SUPABASE_ANON_KEY;

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const result = await FileSystem.uploadAsync(url, fileUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
  });

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`Storage upload failed (${result.status}): ${result.body}`);
  }
}

export async function uploadAudio(
  userId: string,
  trackId: string,
  fileUri: string,
  mimeType: string
): Promise<string> {
  const path = `${userId}/audio/${trackId}.${getExtension(mimeType)}`;
  await uploadFile(path, fileUri, mimeType);
  return path;
}

export async function uploadCover(
  userId: string,
  trackId: string,
  fileUri: string,
  mimeType: string
): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const path = `${userId}/covers/${trackId}.${ext}`;
  await uploadFile(path, fileUri, mimeType);
  return path;
}

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(userId: string, fileUri: string, mimeType: string): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const path = `${userId}/avatar.${ext}`;
  await uploadFile(path, fileUri, mimeType);
  return path;
}

export async function deleteTrackFiles(userId: string, trackId: string): Promise<void> {
  const files = [
    `${userId}/audio/${trackId}.mp3`,
    `${userId}/audio/${trackId}.aac`,
    `${userId}/audio/${trackId}.flac`,
    `${userId}/covers/${trackId}.jpg`,
    `${userId}/covers/${trackId}.png`,
  ];
  await supabase.storage.from(BUCKET).remove(files);
}

function getExtension(mimeType: string): string {
  if (mimeType.includes('flac')) return 'flac';
  if (mimeType.includes('aac') || mimeType.includes('mp4')) return 'aac';
  return 'mp3';
}
