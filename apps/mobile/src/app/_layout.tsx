import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../auth/AuthProvider';
import { CartProvider } from '../cart/CartProvider';
import { FavoritesProvider } from '../favorites/FavoritesProvider';
import { configureNotificationHandler } from '../lib/notifications';
import { queryClient } from '../lib/query-client';
import { colors } from '../theme';

configureNotificationHandler();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerTintColor: colors.primary,
                headerTitleStyle: { color: colors.text, fontWeight: '700' },
                headerStyle: { backgroundColor: colors.background },
                contentStyle: { backgroundColor: colors.background },
                headerBackButtonDisplayMode: 'minimal',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ title: '' }} />
              <Stack.Screen name="checkout" options={{ title: 'Finalizar compra' }} />
              <Stack.Screen
                name="login"
                options={{ title: 'Iniciar sesión', presentation: 'modal' }}
              />
            </Stack>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
