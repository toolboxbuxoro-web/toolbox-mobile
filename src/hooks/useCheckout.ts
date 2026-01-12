import { useState } from 'react';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cart-store';
import { useBtsLocationStore } from '../store/bts-location-store';
import { Order } from '../types/cart';
import { CheckoutFormData } from '../types/checkout';

export function useCheckout() {
  const { cartId, resetCart } = useCartStore();
  const btsLocation = useBtsLocationStore();
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

    // Check if BTS location is selected
    if (!btsLocation.hasLocation()) {
      setError('Пожалуйста, выберите пункт выдачи');
      return null;
    }

    // Prevent double-submit
    if (loading) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Get BTS location data
      const btsRegion = btsLocation.getSelectedRegion();
      const btsPoint = btsLocation.getSelectedPoint();
      
      // Step 1: Update cart with email, shipping address, and BTS metadata
      await cartService.updateCart(cartId, {
        email: `${formData.phone}@phone.local`, // Synthetic email for phone-based auth
        shipping_address: {
          first_name: formData.name,
          phone: formData.phone,
          address_1: btsPoint?.address || formData.comment || 'Самовывоз',
          city: btsRegion?.nameRu || formData.city || 'Бухара',
          country_code: 'uz',
        },
        metadata: {
          bts_delivery: {
            region_id: btsLocation.regionId,
            point_id: btsLocation.pointId,
            region_name: btsRegion?.nameRu,
            point_name: btsPoint?.name,
            point_address: btsPoint?.address,
          },
          order_comment: formData.comment || '',
        },
      });

      // Step 2: Select shipping method - REPLICATE WEB LOGIC
      // Web: finds BTS method from available options, uses actual ID
      try {
        const options = await cartService.getShippingOptions(cartId);
        console.log('[useCheckout] Available shipping options:', options.map(o => ({ id: o.id, name: o.name })));
        
        // Find BTS method (like web does) or fallback to first available
        const btsMethod = options.find(o => 
          (o.name || '').toLowerCase().includes('bts') ||
          (o.name || '').toLowerCase().includes('доставка')
        );
        const methodToUse = btsMethod || options[0];
        
        if (!methodToUse) {
          throw new Error('No shipping options available for this cart');
        }
        
        const optionId = methodToUse.id;
        console.log('[useCheckout] Selected shipping option:', optionId, methodToUse.name);
        
        // Try standard API first, then BTS fallback (like web)
        try {
          await cartService.setShippingMethod(cartId, optionId);
          console.log('[useCheckout] Standard shipping attachment success');
        } catch (stdErr: any) {
          const msg = stdErr.message?.toLowerCase() || '';
          // If no price configured, use BTS workaround (like web)
          if (msg.includes('do not have a price') || msg.includes('does not have a price') || msg.includes('invalid')) {
            console.log('[useCheckout] Standard shipping failed, trying BTS fallback:', stdErr.message);
            await cartService.setShippingMethodBTS(cartId, optionId, 0);
            console.log('[useCheckout] BTS fallback success');
          } else {
            throw stdErr;
          }
        }
      } catch (shipErr) {
        console.error('[useCheckout] All shipping attempts failed:', shipErr);
        throw shipErr;
      }

      // Step 3: Get or Create payment collection (Idempotency - prevent duplicates)
      // Check if cart already has a payment collection before creating new one
      const cartWithPayment = await cartService.getCart(cartId);
      let collectionId: string;
      
      if (cartWithPayment.payment_collection?.id) {
        console.log('[useCheckout] Using existing payment collection:', cartWithPayment.payment_collection.id);
        collectionId = cartWithPayment.payment_collection.id;
      } else {
        console.log('[useCheckout] Creating new payment collection');
        const collectionRes = await cartService.createPaymentCollection(cartId);
        collectionId = collectionRes.payment_collection.id;
      }

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
