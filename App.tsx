import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSession } from './src/hooks/useSession';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/colors';
import { styles } from './src/styles/App.styles';

export default function App() {
  const { session, loading } = useSession();

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
        <AppNavigator session={session} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
