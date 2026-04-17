import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { MainTabs } from './src/navigation/MainTabs';
import { AuthScreen } from './src/screens/AuthScreen';
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { COLORS } from './src/theme/colors';
import { styles } from './src/styles/App.styles';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut();
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          supabase.auth.signOut();
          return;
        }
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: COLORS.accent,
              background: COLORS.background,
              card: COLORS.surface,
              text: COLORS.text,
              border: COLORS.surfaceLight,
              notification: COLORS.accent,
            },
          }}
        >
          <StatusBar style="light" />
          {session ? <MainTabs /> : <AuthScreen />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

