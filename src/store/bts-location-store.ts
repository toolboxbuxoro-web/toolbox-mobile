import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BtsRegion, BtsPoint, getBtsRegion, getBtsPoint } from '../lib/bts';

interface BtsLocationState {
  // Selected location
  regionId: string | null;
  pointId: string | null;
  
  // Cached data for display
  regionName: string | null;
  pointName: string | null;
  pointAddress: string | null;
  
  // Actions
  selectLocation: (regionId: string, pointId: string) => void;
  clearLocation: () => void;
  
  // Getters
  getSelectedRegion: () => BtsRegion | undefined;
  getSelectedPoint: () => BtsPoint | undefined;
  hasLocation: () => boolean;
  getDisplayName: () => string;
}

export const useBtsLocationStore = create<BtsLocationState>()(
  persist(
    (set, get) => ({
      regionId: null,
      pointId: null,
      regionName: null,
      pointName: null,
      pointAddress: null,
      
      selectLocation: (regionId: string, pointId: string) => {
        const region = getBtsRegion(regionId);
        const point = getBtsPoint(regionId, pointId);
        
        set({
          regionId,
          pointId,
          regionName: region?.nameRu || null,
          pointName: point?.name || null,
          pointAddress: point?.address || null,
        });
      },
      
      clearLocation: () => set({
        regionId: null,
        pointId: null,
        regionName: null,
        pointName: null,
        pointAddress: null,
      }),
      
      getSelectedRegion: () => {
        const { regionId } = get();
        return regionId ? getBtsRegion(regionId) : undefined;
      },
      
      getSelectedPoint: () => {
        const { regionId, pointId } = get();
        return regionId && pointId ? getBtsPoint(regionId, pointId) : undefined;
      },
      
      hasLocation: () => {
        const { regionId, pointId } = get();
        return !!(regionId && pointId);
      },
      
      getDisplayName: () => {
        const { regionName, pointName } = get();
        if (regionName && pointName) {
          return `${regionName}, ${pointName}`;
        }
        if (regionName) {
          return regionName;
        }
        return 'Выбрать пункт выдачи';
      },
    }),
    {
      name: 'bts-location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        regionId: state.regionId,
        pointId: state.pointId,
        regionName: state.regionName,
        pointName: state.pointName,
        pointAddress: state.pointAddress,
      }),
    }
  )
);
