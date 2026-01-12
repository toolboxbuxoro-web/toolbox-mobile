import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchTrigger } from './SearchTrigger';
import { LocationSelector } from '../location';

interface HomeHeaderProps {
  searchPlaceholder?: string;
  isSearchActive?: boolean;
  onSearchActivate?: () => void;
  onSearchDeactivate?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
}

/**
 * Sticky home header with location selector and search.
 * Uzum/WB style - clean, minimal, one-hand optimized.
 */
export function HomeHeader({ 
  searchPlaceholder,
  isSearchActive,
  onSearchActivate,
  onSearchDeactivate,
  searchQuery,
  onSearchChange
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Location row - hide when search is active like Uzum */}
      {!isSearchActive && (
        <View style={styles.locationRow}>
          <LocationSelector />
        </View>
      )}
      
      {/* Search row */}
      <View style={styles.searchRow}>
        <SearchTrigger 
          placeholder={searchPlaceholder} 
          isActive={isSearchActive}
          onActivate={onSearchActivate}
          onDeactivate={onSearchDeactivate}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationRow: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchRow: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
});
