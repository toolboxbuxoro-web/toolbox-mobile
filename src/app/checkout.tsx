import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCheckout } from '../hooks/useCheckout';
import { CheckoutFormData } from '../types/checkout';
import { useCartStore } from '../store/cart-store';
import { CheckoutContactForm } from '../components/checkout/CheckoutContactForm';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { CheckoutStickyCTA } from '../components/checkout/CheckoutStickyCTA';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth-store';
import { AuthSheet } from '../components/auth/AuthSheet';
import { useEffect } from 'react';
import { PaymentMethodSelector, PaymentProviderId } from '../components/checkout/PaymentMethodSelector';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart } = useCartStore();
  const { submitOrder, loading, error, validatePhone } = useCheckout();
  const { customer, status: authStatus } = useAuthStore();
  const isAuthenticated = authStatus === 'authorized';
  
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProviderId>('pp_manual_manual');
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    phone: '',
    comment: '',
    city: 'Бухара',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pre-fill form from customer data
  useEffect(() => {
    if (isAuthenticated && customer) {
      setFormData((prev: CheckoutFormData) => ({
        ...prev,
        name: customer.first_name || prev.name,
        phone: customer.phone || prev.phone,
      }));
    } else if (authStatus === 'unauthorized') {
      setIsAuthVisible(true);
    }
  }, [customer, isAuthenticated, authStatus]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (formData.name.trim().length < 2) {
      errors.name = 'Введите корректное имя';
    }
    
    if (!validatePhone(formData.phone)) {
      errors.phone = 'Неверный формат телефона (+998 XX XXX XX XX)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePressSubmit = async () => {
    if (!isAuthenticated) {
      setIsAuthVisible(true);
      return;
    }

    if (!validateForm()) return;

    try {
      console.log('[Checkout] Submitting order with method:', paymentMethod);
      const result = await submitOrder(formData, paymentMethod);
      console.log('[Checkout] submitOrder result:', result);
      
      if (result) {
        if (result.type === 'order' && result.data) {
          console.log('[Checkout] Manual payment success, redirecting to order-success');
          router.replace({
            pathname: '/order-success',
            params: { displayId: result.data.display_id || result.data.id }
          });
        } else if (result.type === 'payment_required') {
          console.log('[Checkout] Payment required, redirecting to WebView with URL:', result.paymentUrl);
          if (!result.paymentUrl) {
            console.error('[Checkout] Error: paymentUrl is missing in result!');
            Alert.alert('Ошибка', 'Не удалось получить ссылку на оплату. Проверьте настройки бэкенда.');
            return;
          }
          router.push({
            pathname: '/payment-webview',
            params: { 
              url: result.paymentUrl, 
              collectionId: result.collectionId,
              cartId: result.cartId,
              providerId: result.providerId
            }
          });
        }
      } else {
        console.warn('[Checkout] submitOrder returned null');
      }
    } catch (err) {
      console.error('Checkout execution error:', err);
      Alert.alert('Ошибка', 'Произошла непредвиденная ошибка при оформлении заказа.');
    }
  };

  const isButtonDisabled = formData.name.length < 2 || formData.phone.length < 10;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Оформление заказа</Text>
        
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <CheckoutSummary cart={cart} />
        
        <CheckoutContactForm 
          data={formData} 
          onChange={setFormData} 
          errors={formErrors}
        />

        <PaymentMethodSelector 
          selectedId={paymentMethod}
          onSelect={setPaymentMethod}
        />

        {/* Extra space for scrolling above keyboard */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <CheckoutStickyCTA 
        total={cart?.total || 0}
        onPress={handlePressSubmit}
        loading={loading}
        disabled={isButtonDisabled}
      />

      <AuthSheet 
        isVisible={isAuthVisible} 
        onClose={() => setIsAuthVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  errorBanner: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  paymentMethod: {
    marginVertical: 8,
  },
  methodCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B00', // Selected state highlight
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  methodDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});
