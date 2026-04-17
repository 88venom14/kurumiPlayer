import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Session } from '@supabase/supabase-js';
import { MainTabs } from './MainTabs';
import { AuthScreen } from '../screens/AuthScreen';
import { COLORS } from '../theme/colors';

const NAV_THEME = {
  dark: true,
  colors: {
    primary: COLORS.accent,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.surfaceLight,
    notification: COLORS.accent,
  },
};

interface AppNavigatorProps {
  session: Session | null;
}

export function AppNavigator({ session }: AppNavigatorProps) {
  return (
    <NavigationContainer theme={NAV_THEME}>
      <StatusBar style="light" />
      {session ? <MainTabs /> : <AuthScreen />}
    </NavigationContainer>
  );
}
