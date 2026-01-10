import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cart-store';

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
  const pollingRef = useRef<boolean>(false);

  const completeOrder = async () => {
    if (status === 'placing_order' || !cartId) return;
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
          console.log('[PaymentWebView] Payment completed (Click or redirect), navigating to orders...');
          resetCart();
          router.replace({ pathname: '/order-success', params: {} });
          return true;
        }

        if (paymentStatus === 'authorized') {
          console.log('[PaymentWebView] Payment authorized (Payme), completing order...');
          await completeOrder();
          return true;
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

    const interval = setInterval(async () => {
      attempts++;
      const isDone = await poll();
      
      if (isDone || attempts >= maxAttempts) {
        clearInterval(interval);
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

    // Detect callback redirects - payment was successful or returned to app
    if (
      navUrl.includes('payment_status=checking') || 
      navUrl.includes('payme-callback') || 
      navUrl.includes('click-callback') ||
      navUrl.includes('order-success')
    ) {
      console.log('[PaymentWebView] Callback detected, starting polling...');
      startPolling();
    }
    
    // Detect cancel patterns
    if (navUrl.includes('payment_error=cancelled')) {
      Alert.alert('Оплата отменена', 'Попробуйте еще раз');
      router.back();
    }
  };

  const handleClose = () => {
    if (status === 'checking' || status === 'placing_order') {
      Alert.alert('Внимание', 'Проверка платежа ещё не завершена. Вы уверены, что хотите закрыть окно?', [
        { text: 'Нет', style: 'cancel' },
        { text: 'Да', style: 'destructive', onPress: () => router.back() }
      ]);
    } else {
      router.back();
    }
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
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#FF6B00" />
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
  }
});
