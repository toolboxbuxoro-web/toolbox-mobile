import { AppState, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cart-store';
import { useCartQueueStore } from '../store/cart-queue.store';

class CartQueueService {
  private isFlushing = false;

  constructor() {
    // Flush when app comes to foreground
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        this.flush();
      }
    });
  }

  async flush() {
    if (this.isFlushing) return;

    // Check connectivity first
    const network = await NetInfo.fetch();
    if (!network.isConnected || network.isInternetReachable === false) {
       console.log('[CartQueue] Offline, skipping flush.');
       return;
    }
    
    const { cartId, setCart } = useCartStore.getState();
    if (!cartId) return;

    const queueStore = useCartQueueStore.getState();
    const next = queueStore.peek();

    if (!next) {
      // Queue is empty - no logging needed to avoid spam
      return;
    }

    this.isFlushing = true;
    console.log('[CartQueue] Flushing mutation:', next.type);

    try {
      let updatedCart;
      switch (next.type) {
        case 'add':
          updatedCart = await cartService.addItem(cartId, next.variantId, next.quantity);
          break;
        case 'update':
          updatedCart = await cartService.updateItem(cartId, next.lineItemId, next.quantity);
          break;
        case 'remove':
          updatedCart = await cartService.removeItem(cartId, next.lineItemId);
          break;
      }

      if (updatedCart) {
        setCart(updatedCart);
      }

      // Mutation successful, remove from queue
      queueStore.dequeue();
      this.isFlushing = false;

      // Recursive call to process next item in queue
      this.flush();
    } catch (error: any) {
       console.error('[CartQueue] Flush failed:', error);
       
       const errorMessage = error?.message || '';
       const isInventoryError = errorMessage.includes('insufficient_inventory');
       const isNotFoundError = errorMessage.includes('not_found');
       const isCompletedError = errorMessage.includes('already completed');

       // Handle cart already completed - reset and create new cart
       if (isCompletedError) {
         console.warn('[CartQueue] Cart already completed. Resetting and creating new cart...');
         const { resetCart, setCartId, setCart } = useCartStore.getState();
         resetCart();
         
         // Create new cart and retry the mutation
         try {
           const newCart = await cartService.createCart();
           setCartId(newCart.id);
           setCart(newCart);
           console.log('[CartQueue] New cart created:', newCart.id);
           
           // Don't dequeue - the mutation will be retried with new cart
           this.isFlushing = false;
           this.flush();
           return;
         } catch (createError) {
           console.error('[CartQueue] Failed to create new cart:', createError);
           Alert.alert(
             "Ошибка корзины",
             "Не удалось создать новую корзину. Пожалуйста, перезапустите приложение."
           );
         }
         
         this.isFlushing = false;
         return;
       }

       if (isInventoryError || isNotFoundError) {
         console.warn(`[CartQueue] Poison pill detected (${isInventoryError ? 'inventory' : 'not_found'}). Removing from queue.`);
         queueStore.dequeue();
         
         if (isInventoryError) {
           Alert.alert(
             "Недостаточно товара",
             "Один из товаров в очереди закончился на складе и был удален из очереди."
           );
         }
         
         // Try to continue with rest of queue
         this.isFlushing = false;
         this.flush();
         return;
       }

       this.isFlushing = false;
       // We keep it in the queue for next retry for other types of errors (network, etc)
    }
  }
}

export const cartQueueService = new CartQueueService();
