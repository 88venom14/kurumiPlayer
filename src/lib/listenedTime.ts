import AsyncStorage from '@react-native-async-storage/async-storage';

const LISTENED_KEY = 'vinyl_listened_ms';

export async function addListenedMs(ms: number): Promise<void> {
  if (ms <= 0) return;
  const prev = parseInt((await AsyncStorage.getItem(LISTENED_KEY)) ?? '0', 10);
  await AsyncStorage.setItem(LISTENED_KEY, String(prev + ms));
}

export async function getListenedMs(): Promise<number> {
  return parseInt((await AsyncStorage.getItem(LISTENED_KEY)) ?? '0', 10);
}
