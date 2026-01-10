import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type PaymentProviderId = 'pp_manual_manual' | 'pp_payme_payme' | 'pp_click_click';

interface Props {
  selectedId: PaymentProviderId;
  onSelect: (id: PaymentProviderId) => void;
}

const METHODS = [
  {
    id: 'pp_manual_manual' as const,
    title: 'Наличными при получении',
    description: 'Оплата после проверки товара',
    icon: 'cash-outline',
  },
  {
    id: 'pp_payme_payme' as const,
    title: 'Оплата через Payme',
    description: 'Картами Uzcard, Humo, Visa/Mastercard',
    logo: 'https://cdn.paycom.uz/logo/payme_color.png', // Temporary logo URL
  },
  {
    id: 'pp_click_click' as const,
    title: 'Оплата через Click',
    description: 'Быстрая оплата через Click Up или карту',
    logo: 'https://click.uz/click/images/click-logo.png', // Temporary logo URL
  },
];

export const PaymentMethodSelector: React.FC<Props> = ({ selectedId, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Способ оплаты</Text>
      
      {METHODS.map((method) => {
        const isSelected = selectedId === method.id;
        
        return (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, isSelected && styles.methodCardSelected]}
            onPress={() => onSelect(method.id)}
            activeOpacity={0.7}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.methodTitle}>{method.title}</Text>
              <Text style={styles.methodDesc}>{method.description}</Text>
            </View>

            <View style={styles.iconContainer}>
              {method.logo ? (
                <Image source={{ uri: method.logo }} style={styles.logo} resizeMode="contain" />
              ) : (
                <Ionicons name={method.icon as any} size={24} color="#666" />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
    paddingHorizontal: 4,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  methodCardSelected: {
    borderColor: '#FF6B00',
    backgroundColor: '#FFF9F5',
  },
  radioContainer: {
    marginRight: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#FF6B00',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B00',
  },
  info: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  methodDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  iconContainer: {
    marginLeft: 8,
  },
  logo: {
    width: 40,
    height: 24,
  },
});
