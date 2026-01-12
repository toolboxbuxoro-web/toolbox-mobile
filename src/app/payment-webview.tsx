import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Linking } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cart-store';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

// Use env or default - allows different domains for staging/prod
const STORE_DOMAIN = process.env.EXPO_PUBLIC_STORE_URL?.replace(/^https?:\/\//, '') || 'toolbox-tools.uz';

// Mobile Safari UA for better responsive layout from payment providers
const MOBILE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

type PaymentStatus = 'idle' | 'checking' | 'placing_order' | 'error' | 'cancelled';

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const { url, collectionId, cartId, providerId } = useLocalSearchParams<{ 
    url: string; 
    collectionId: string; 
    cartId: string;
    providerId: string;
  }>();
  const { resetCart } = useCartStore();
  
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Refs for preventing race conditions and memory leaks
  const pollingRef = useRef<boolean>(false);
  const completingRef = useRef<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const completeOrder = async () => {
    // Guard against double-complete race condition
    if (completingRef.current || status === 'placing_order' || !cartId) {
      console.log('[PaymentWebView] Skipping duplicate complete call');
      return;
    }
    completingRef.current = true;
    setStatus('placing_order');
    
    try {
      console.log('[PaymentWebView] Completing cart:', cartId);
      const order = await cartService.complete(cartId);
      console.log('[PaymentWebView] Order completed:', order.id);
      resetCart();
      
      router.replace({
        pathname: '/order-success',
        params: { displayId: order.display_id || order.id }
      });
    } catch (err: any) {
      console.error('[PaymentWebView] Complete error:', err);
      // If cart already completed (or converted to order), still go to success
      if (err.message?.includes('order') || err.message?.includes('not found')) {
        resetCart();
        router.replace({ pathname: '/order-success', params: {} });
      } else {
        setStatus('error');
        setErrorMessage('Не удалось завершить заказ. Проверьте статус в профиле.');
        Alert.alert('Ошибка', 'Не удалось завершить заказ. Проверьте статус в профиле.');
      }
    }
  };

  const startPolling = async () => {
    if (pollingRef.current || !cartId) return;
    pollingRef.current = true;
    setStatus('checking');

    let attempts = 0;
    const maxAttempts = 12; // ~24 seconds

    const poll = async () => {
      try {
        console.log(`[PaymentWebView] Polling check-payment attempt ${attempts + 1}`);
        const paymentStatus = await cartService.checkPaymentStatus(cartId);
        console.log(`[PaymentWebView] Status: ${paymentStatus}`);

        if (paymentStatus === 'completed') {
          // Click backend auto-completes order - we don't have displayId
          // Redirect to orders page where user can see their order
          console.log('[PaymentWebView] Payment completed (Click), redirecting to orders...');
          resetCart();
          router.replace({ pathname: '/orders' });
          return true;
        }

        if (paymentStatus === 'authorized') {
          // Payme: authorized means payment confirmed, mobile must call complete()
          // Click: backend creates order automatically, wait for 'completed' status
          const isClickProvider = providerId?.includes('click');
          
          if (isClickProvider) {
            console.log('[PaymentWebView] Click authorized, waiting for backend to complete order...');
            // Keep polling - Click will show 'completed' once order is created
            return false;
          } else {
            console.log('[PaymentWebView] Payme authorized, completing order...');
            await completeOrder();
            return true;
          }
        }

        if (paymentStatus === 'cancelled') {
          setStatus('cancelled');
          setErrorMessage('Платёж был отменён');
          Alert.alert('Оплата отменена', 'Попробуйте еще раз');
          router.back();
          return true;
        }

        if (paymentStatus === 'error') {
          setStatus('error');
          setErrorMessage('Ошибка проверки статуса платежа');
          return true;
        }

        return false;
      } catch (err) {
        console.error('[PaymentWebView] Polling error:', err);
        return false;
      }
    };

    intervalRef.current = setInterval(async () => {
      attempts++;
      const isDone = await poll();
      
      if (isDone || attempts >= maxAttempts) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        pollingRef.current = false;
        if (!isDone) {
          setStatus('error');
          setErrorMessage('Не удалось подтвердить платёж. Пожалуйста, проверьте статус заказа в профиле.');
        }
      }
    }, 2000);
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url: navUrl } = navState;
    console.log('[PaymentWebView] Navigating to:', navUrl);

    // Parse URL to check the path, not query params (using configurable domain)
    // Payme: redirects to /api/payme-callback → /checkout?payment_status=checking
    const isPaymeCallback = navUrl.includes(`${STORE_DOMAIN}/api/payme-callback`) && !navUrl.includes('back=');
    
    // Click: redirects to /api/click-callback → /?payment_success=true
    const isClickCallback = navUrl.includes(`${STORE_DOMAIN}/api/click-callback`) && !navUrl.includes('return_url=');
    const isClickSuccess = navUrl.includes('payment_success=true');
    
    // Generic patterns
    const isPaymentStatusCheck = navUrl.includes('payment_status=checking');
    const isOrderSuccess = navUrl.includes('/order-success') || navUrl.includes('/order/confirmed');
    
    if (isPaymeCallback || isClickCallback || isClickSuccess || isPaymentStatusCheck || isOrderSuccess) {
      console.log('[PaymentWebView] Callback detected, starting polling...');
      startPolling();
    }
    
    
    // Detect cancel patterns
    if (navUrl.includes('payment_error=cancelled')) {
      Alert.alert('Оплата отменена', 'Попробуйте еще раз');
      router.back();
    }
  };

  /**
   * Handle deep links in WebView (click://, payme://, intent://)
   * Opens external apps like Click or Payme when user taps "Open in app"
   */
  const handleShouldStartLoad = (request: ShouldStartLoadRequest): boolean => {
    const { url: reqUrl } = request;
    
    // Check for deep link schemes
    const isDeepLink = 
      reqUrl.startsWith('click://') || 
      reqUrl.startsWith('payme://') ||
      reqUrl.startsWith('intent://') ||
      reqUrl.startsWith('uzumbank://');
    
    if (isDeepLink) {
      console.log('[PaymentWebView] Deep link detected, opening external app:', reqUrl);
      
      Linking.openURL(reqUrl).catch((err) => {
        console.warn('[PaymentWebView] Failed to open deep link:', err);
        // App might not be installed - continue in WebView
        Alert.alert(
          'Приложение не найдено',
          'Пожалуйста, оплатите через мобильную версию сайта или установите приложение Click/Payme.'
        );
      });
      
      // Start polling since user is likely going to external app
      startPolling();
      
      // Don't load this URL in WebView
      return false;
    }
    
    return true;
  };

  const handleClose = async () => {
    // Check current payment status to decide where to navigate
    if (cartId) {
      try {
        const currentStatus = await cartService.checkPaymentStatus(cartId);
        
        // If payment was successful, go to success/orders
        if (currentStatus === 'completed' || currentStatus === 'authorized') {
          resetCart();
          
          // Clear entire navigation stack and go to tabs, then orders
          if (currentStatus === 'completed') {
            // Click: order already created by backend
            router.dismissAll();
            router.replace({ pathname: '/(tabs)' });
            setTimeout(() => router.push({ pathname: '/orders' }), 100);
          } else {
            // Payme: need to complete the order
            try {
              const order = await cartService.complete(cartId);
              router.dismissAll();
              router.replace({ 
                pathname: '/order-success',
                params: { displayId: order.display_id || order.id }
              });
            } catch {
              router.dismissAll();
              router.replace({ pathname: '/(tabs)' });
              setTimeout(() => router.push({ pathname: '/orders' }), 100);
            }
          }
          return;
        }
      } catch (err) {
        console.log('[PaymentWebView] Status check on close failed:', err);
      }
    }
    
    // Payment not completed - confirm before going back to checkout
    Alert.alert(
      'Прервать оплату?',
      'Платёж не завершён. Вернуться к оформлению?',
      [
        { text: 'Продолжить оплату', style: 'cancel' },
        { 
          text: 'Вернуться', 
          style: 'destructive', 
          onPress: () => {
            router.dismissAll();
            router.replace({ pathname: '/checkout' });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оплата заказа</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {status !== 'idle' ? (
          <View style={styles.pollingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.pollingText}>
              {status === 'checking' ? 'Проверяем платёж...' : 'Завершаем заказ...'}
            </Text>
            <Text style={styles.subText}>Пожалуйста, не закрывайте это окно</Text>
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            {status === 'error' && (
              <TouchableOpacity onPress={startPolling} style={styles.retryButton}>
                <Text style={styles.retryText}>Попробовать проверить ещё раз</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <WebView
            source={{ uri: url! }}
            userAgent={MOBILE_USER_AGENT}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#FF6B00" />
                <Text style={styles.loadingText}>Загрузка платёжной страницы...</Text>
                <Text style={styles.loadingSubtext}>Не закрывайте окно</Text>
              </View>
            )}
            incognito={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  pollingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  retryText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  }
});
