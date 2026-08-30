import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// These are public client credentials for the shared hackathon demo project.
// Supabase publishable keys are designed to ship inside mobile applications;
// database access remains protected by Auth and Row Level Security.
const demoSupabaseUrl = 'https://ncvlquhvaifcnikqnxrs.supabase.co';
const demoSupabasePublishableKey =
  'sb_publishable_H5FlIPKGaWXF6qjWlXk9Vg_4UFjacf2';

const supabaseUrl = (
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? demoSupabaseUrl
).trim();
const supabasePublishableKey = (
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  demoSupabasePublishableKey
)?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Check the bundled public demo configuration or provide EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in mobile/.env.',
    );
  }

  return supabase;
}

if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
