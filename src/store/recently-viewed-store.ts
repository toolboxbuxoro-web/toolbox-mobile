import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentlyViewedState {
  viewedIds: string[];
  addToRecentlyViewed: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      viewedIds: [],
      addToRecentlyViewed: (id: string) =>
        set((state) => {
          // Remove if exists (to move to front), add to front
          const filtered = state.viewedIds.filter((item) => item !== id);
          return { viewedIds: [id, ...filtered].slice(0, 15) };
        }),
    }),
    {
      name: 'recently-viewed-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
