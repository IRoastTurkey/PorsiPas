import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AlertProvider } from '@/features/alerts/alert-provider';
import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { AuthStateScreen } from '@/features/auth/auth-state-screen';

function RootNavigator() {
  const { status, errorMessage, retry } = useAuth();

  if (status === 'loading') return <AuthStateScreen kind="loading" />;
  if (status === 'config_required') return <AuthStateScreen kind="config_required" />;
  if (status === 'error') {
    return <AuthStateScreen kind="error" message={errorMessage} onRetry={() => void retry()} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === 'onboarding_required'}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'ready'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="food-drop/[id]" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="rescue-result" />
        <Stack.Screen name="host/food-drop/[id]" />
        <Stack.Screen name="host/food-drop/[id]/qr" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AlertProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AlertProvider>
    </AuthProvider>
  );
}
