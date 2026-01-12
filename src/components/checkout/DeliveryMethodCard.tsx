import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cart } from '../../types/cart';
import { getCartWeightKg } from '../../lib/cart-utils';
import { useBtsLocationStore } from '../../store/bts-location-store';
import { calculateBtsCost } from '../../lib/bts';
import { LocationSheet } from '../location/LocationSheet';
import { formatMoney } from '../../lib/formatters';

interface DeliveryMethodCardProps {
  cart?: Cart | null;
  onSelect?: () => void;
  error?: string | null;
}

export function DeliveryMethodCard({ cart, error }: DeliveryMethodCardProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const { 
    hasLocation, 
    getDisplayName, 
    getSelectedRegion, 
    pointAddress,
    regionId 
  } = useBtsLocationStore();

  const weightKg = getCartWeightKg(cart);
  const region = getSelectedRegion();
  
  // Calculate cost if region is selected
  const deliveryCost = regionId ? calculateBtsCost(weightKg, regionId) : 0;
  const deliveryCostFormatted = formatMoney(deliveryCost);
  
  const hasSelected = hasLocation();
  const displayName = getDisplayName();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Способ получения</Text>
      
      {/* Delivery Method Selector (Single Option for now) */}
      <TouchableOpacity 
        style={[styles.card, error ? styles.cardError : hasSelected && styles.cardSelected]}
        onPress={() => setSheetVisible(true)}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <View style={styles.radioContainer}>
            <View style={[styles.radioOuter, hasSelected && styles.radioOuterSelected]}>
              {hasSelected && <View style={styles.radioInner} />}
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Самовывоз (BTS Express)</Text>
            
            {!hasSelected ? (
              <Text style={styles.prompt}>
                Выберите пункт выдачи на карте или из списка
              </Text>
            ) : (
              <View style={styles.selectedContainer}>
                <Text style={styles.locationName}>{displayName}</Text>
                {pointAddress && (
                  <Text style={styles.address}>{pointAddress}</Text>
                )}
                {/* Working hours could be added here if available in BtsPoint */}
                <Text style={styles.hours}>Ежедневно 09:00 - 18:00</Text> 
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" style={{ alignSelf: 'center' }} />
        </View>

        {/* Price & Weight Block */}
        {hasSelected && (
          <View style={styles.footer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Стоимость доставки:</Text>
              {deliveryCost > 0 ? (
                <Text style={styles.priceValue}>{deliveryCostFormatted}</Text>
              ) : (
                <Text style={styles.priceValueFree}>Бесплатно</Text>
              )}
            </View>
            <View style={styles.weightRow}>
              <Text style={styles.weightLabel}>Вес заказа:</Text>
              <Text style={styles.weightValue}>{weightKg.toFixed(1)} кг</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={14} color="#666" />
              <Text style={styles.infoText}>Оплата доставки при получении</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {error && !hasSelected && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <LocationSheet 
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#fff',
  },
  cardError: {
    borderColor: '#FF3B30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#DC2626',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  prompt: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  selectedContainer: {
    marginTop: 2,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  hours: {
    fontSize: 12,
    color: '#8E8E93',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#000',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  priceValueFree: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34C759',
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weightLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  weightValue: {
    fontSize: 13,
    color: '#8E8E93',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
});
