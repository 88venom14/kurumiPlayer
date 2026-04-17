import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://noozgghctswdfnicmcnd.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_V6FV6OI5mRD-1h30GBZcJQ_RraBw21e';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
