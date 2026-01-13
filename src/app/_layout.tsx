import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 min
      gcTime: 10 * 60 * 1000,       // 10 min (React Query v5 uses gcTime instead of cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';

export default function RootLayout() {
  const restoreSession = useAuthStore(state => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="catalog/[categoryHandle]" options={{ headerShown: true }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Оформление' }} />
          <Stack.Screen name="checkout-success" options={{ headerShown: false }} />
          {/* Payment WebView: no system header, no gestures - custom X only */}
          <Stack.Screen 
            name="payment-webview" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
              animation: 'slide_from_bottom',
            }} 
          />
          {/* Order Success: no back navigation */}
          <Stack.Screen 
            name="order-success" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
          <Stack.Screen 
            name="orders" 
            options={{ 
              headerShown: true,
              title: 'Мои заказы',
            }} 
          />
          <Stack.Screen 
            name="reviews/[id]" 
            options={{ 
              headerShown: true,
              title: 'Отзывы',
            }} 
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
