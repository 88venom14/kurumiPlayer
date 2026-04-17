export function formatDuration(ms: number | null): string {
  if (!ms) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatListened(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes} мин`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours} ч ${mins} м`;
}

export function pluralTracks(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'трек';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'трека';
  return 'треков';
}
