import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cart.service';

interface UsePaymentStatusProps {
  collectionId: string | null;
  onSuccess: () => void;
  onError: (error: string) => void;
  enabled: boolean;
}

export function usePaymentStatus({ collectionId, onSuccess, onError, enabled }: UsePaymentStatusProps) {
  const [status, setStatus] = useState<'pending' | 'authorized' | 'failed' | 'idle'>('idle');
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 30; // 60 seconds with 2s interval

  const poll = useCallback(async () => {
    if (!collectionId) return;

    try {
      const response = await cartService.getPaymentCollection(collectionId);
      const collection = response.payment_collection;
      
      // Medusa 2.0 status can be 'authorized' or 'captured'
      if (collection.status === 'authorized' || collection.status === 'captured') {
        setStatus('authorized');
        onSuccess();
        return;
      }

      if (collection.status === 'failed' || collection.status === 'canceled') {
        setStatus('failed');
        onError('Оплата была отменена или отклонена');
        return;
      }

      // Check if any session is authorized
      const authorizedSession = collection.payment_sessions?.find(
        (s: any) => s.status === 'authorized' || s.status === 'captured'
      );
      
      if (authorizedSession) {
        setStatus('authorized');
        onSuccess();
        return;
      }

      // Continue polling if pending
      setStatus('pending');
      setAttempts(a => a + 1);
    } catch (err) {
      console.error('[usePaymentStatus] Polling error:', err);
      // We don't stop on single error, might be network glitch
      setAttempts(a => a + 1);
    }
  }, [collectionId, onSuccess, onError]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (enabled && collectionId && status !== 'authorized' && status !== 'failed') {
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('failed');
        onError('Время ожидания оплаты истекло. Проверьте статус в профиле.');
        return;
      }

      timer = setTimeout(poll, 2000);
    }

    return () => clearTimeout(timer);
  }, [enabled, collectionId, status, attempts, poll, onError]);

  return { status, attempts };
}
