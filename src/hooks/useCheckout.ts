import { useState } from 'react';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cart-store';
import { Order } from '../types/cart';
import { CheckoutFormData } from '../types/checkout';

export function useCheckout() {
  const { cartId, resetCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  // Uzbekistan phone validation: +998 XX XXX XX XX
  const validatePhone = (phone: string): boolean => {
    // Remove all spaces and non-digits except +
    const cleaned = phone.replace(/[\s-]/g, '');
    // Match +998XXXXXXXXX (9 digits after +998) or 998XXXXXXXXX
    const uzbekPhoneRegex = /^(\+998|998)[0-9]{9}$/;
    return uzbekPhoneRegex.test(cleaned);
  };

  const submitOrder = async (formData: CheckoutFormData, providerId: string = 'pp_manual_manual') => {
    if (!cartId) {
      setError('Нет активной корзины');
      return null;
    }

    const { status, customer } = require('../store/auth-store').useAuthStore.getState();
    console.log('[useCheckout] Auth state:', { status, customerId: customer?.id });
    if (status !== 'authorized') {
      console.log('[useCheckout] Not authorized, status is:', status);
      setError('Пожалуйста, войдите в аккаунт для оформления заказа');
      return null;
    }

    // Validate phone
    if (!validatePhone(formData.phone)) {
      setError('Неверный формат телефона. Используйте: +998 XX XXX XX XX');
      return null;
    }

    // Prevent double-submit
    if (loading) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Update cart with email and shipping address
      await cartService.updateCart(cartId, {
        email: `${formData.phone}@phone.local`, // Synthetic email for phone-based auth
        shipping_address: {
          first_name: formData.name,
          phone: formData.phone,
          address_1: formData.comment || 'Самовывоз',
          city: formData.city || 'Бухара',
          country_code: 'uz',
        },
      });

      // Step 2: Select shipping method. Try standard API first (better for Medusa 2.0 validation).
      try {
        // Try to find the "Самовывоз" option dynamically
        const options = await cartService.getShippingOptions(cartId);
        const pickupOption = options.find(o => 
          o.name.toLowerCase().includes('самовывоз') || 
          o.id === 'so_pickup_uzb_0001'
        );
        
        const optionId = pickupOption?.id || 'so_pickup_uzb_0001';
        console.log('[useCheckout] Attaching shipping option:', optionId);
        
        try {
          await cartService.setShippingMethod(cartId, optionId);
          console.log('[useCheckout] Standard shipping attachment success');
        } catch (stdErr: any) {
          console.log('[useCheckout] Standard shipping failed, trying BTS fallback:', stdErr.message);
          // If standard fails (usually due to 0 price not being configured in Admin), 
          // use the BTS workaround to force-attach it.
          await cartService.setShippingMethodBTS(cartId, optionId, 0);
        }
      } catch (shipErr) {
        console.error('[useCheckout] All shipping attempts failed:', shipErr);
        throw shipErr;
      }

      // Step 3: Create payment collection (Required for Medusa 2.0)
      const collectionRes = await cartService.createPaymentCollection(cartId);
      const collectionId = collectionRes.payment_collection.id;

      // Step 4: Initiate payment session
      const sessionRes = await cartService.initiatePaymentSession(collectionId, providerId);
      console.log('[useCheckout] Initiate payment session response:', sessionRes);
      
      const session = sessionRes.payment_collection.payment_sessions?.find(
        (s: any) => s.provider_id === providerId
      );
      console.log('[useCheckout] Found session for provider', providerId, ':', session);

      // Step 5: If manual, complete immediately. If not, return session for WebView
      if (providerId === 'pp_manual_manual') {
        const completedOrder = await cartService.complete(cartId);
        resetCart();
        return { type: 'order', data: completedOrder };
      } else {
        return { 
          type: 'payment_required', 
          collectionId, 
          paymentUrl: session?.data?.payment_url,
          cartId,
          providerId
        };
      }
    } catch (err: any) {
      console.error('Checkout failed:', err);
      
      // User-friendly error messages
      let userMessage = 'Ошибка оформления заказа';
      if (err.message?.includes('404')) {
        userMessage = 'Корзина не найдена. Пожалуйста, начните заново.';
      } else if (err.message?.includes('payment')) {
        userMessage = 'Ошибка оплаты. Проверьте данные и попробуйте снова.';
      } else if (err.message?.includes('inventory')) {
        userMessage = 'Некоторые товары закончились. Обновите корзину.';
      } else if (err.message?.includes('shipping')) {
        userMessage = 'Ошибка доставки. Попробуйте снова.';
      }
      
      setError(userMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitOrder,
    loading,
    error,
    order,
    validatePhone,
  };
}
