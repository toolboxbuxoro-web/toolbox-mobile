import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBtsLocationStore } from '../../store/bts-location-store';
import { LocationSheet } from './LocationSheet';

/**
 * Location selector button for home header (Uzum/Ozon style)
 * Shows current pickup location or prompt to select
 */
export function LocationSelector() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const { hasLocation, getDisplayName, regionName } = useBtsLocationStore();

  const displayName = getDisplayName();
  const hasSelectedLocation = hasLocation();

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setSheetVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="location" 
          size={18} 
          color={hasSelectedLocation ? "#DC2626" : "#666"} 
        />
        <Text 
          style={[
            styles.text, 
            hasSelectedLocation && styles.textSelected
          ]} 
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#999" />
      </TouchableOpacity>

      <LocationSheet 
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
  },
  text: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 6,
    fontWeight: '500',
    flexShrink: 1,
    maxWidth: 150,
  },
  textSelected: {
    color: '#000',
  },
});
