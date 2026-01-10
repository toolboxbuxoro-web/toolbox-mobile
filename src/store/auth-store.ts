import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { track } from '../lib/analytics/track';
import { useCartStore } from './cart-store';

export interface Customer {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export type AuthStatus = 'loading' | 'authorized' | 'unauthorized';

interface AuthState {
  customer: Customer | null;
  status: AuthStatus;
  hydrated: boolean;
  
  // Actions
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Customer, 'first_name' | 'last_name' | 'phone'>>) => Promise<void>;
  
  // Internal state setters
  setCustomer: (customer: Customer | null) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Zustand store for Authentication.
 * Handles persistence via AuthService (AsyncStorage) and real Medusa sessions.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  customer: null,
  status: 'unauthorized',
  hydrated: false,

  setCustomer: (customer) => set({ 
    customer, 
    status: customer ? 'authorized' : 'unauthorized' 
  }),
  
  setLoading: (loading) => set({ status: loading ? 'loading' : (get().customer ? 'authorized' : 'unauthorized') }),

  requestOtp: async (phone: string) => {
    set({ status: 'loading' });
    try {
      await authService.requestOtp(phone);
      track('auth_request_otp', { phone });
    } finally {
      // Stay on current customer status if opt request finished (usually still unauthorized)
      set({ status: get().customer ? 'authorized' : 'unauthorized' });
    }
  },

  verifyOtp: async (phone: string, code: string) => {
    set({ status: 'loading' });
    try {
      const cartId = useCartStore.getState().cartId || undefined;
      const { customer } = await authService.verifyOtp(phone, code, cartId);
      console.log('[AuthStore] verifyOtp Success. Customer:', JSON.stringify(customer, null, 2));
      set({ 
        customer, 
        status: 'authorized' 
      });
      track('auth_verify_success', { phone });
    } catch (error) {
      console.error('[AuthStore] verifyOtp Error:', error);
      set({ status: 'unauthorized' });
      track('auth_verify_failed', { phone, error: (error as Error).message });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      track('auth_logout', {});
    } finally {
      set({ 
        customer: null, 
        status: 'unauthorized' 
      });
    }
  },

  restoreSession: async () => {
    const token = await authService.getToken();
    console.log('[AuthStore] restoreSession - Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      set({ hydrated: true, status: 'unauthorized' });
      return;
    }

    set({ status: 'loading' });
    try {
      const customer = await authService.getMe();
      console.log('[AuthStore] restoreSession Success. Customer:', JSON.stringify(customer, null, 2));
      set({ 
        customer, 
        status: 'authorized',
        hydrated: true 
      });
    } catch (error) {
      console.error('[AuthStore] restoreSession Failed:', error);
      // Token probably expired
      await authService.logout();
      set({ hydrated: true, status: 'unauthorized' });
    }
  },

  updateProfile: async (updates: Partial<Pick<Customer, 'first_name' | 'last_name'>>) => {
    set({ status: 'loading' });
    try {
      const updatedCustomer = await authService.updateMe(updates);
      set({ customer: updatedCustomer, status: 'authorized' });
      track('auth_update_profile_success', updates);
    } catch (error) {
      console.error('[AuthStore] updateProfile Error:', error);
      track('auth_update_profile_failed', { ...updates, error: (error as Error).message });
      set({ status: 'authorized' }); // Restore authorized state on error
      throw error;
    }
  },
}));
