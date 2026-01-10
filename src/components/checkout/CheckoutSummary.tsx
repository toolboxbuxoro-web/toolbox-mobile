import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Cart } from '../../types/cart';
import { formatMoney } from '../../lib/formatters/money';

interface Props {
  cart: Cart | null;
}

export const CheckoutSummary: React.FC<Props> = ({ cart }) => {
  if (!cart) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ваш заказ</Text>
      
      <View style={styles.itemsList}>
        {cart.items?.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image 
              source={{ uri: item.thumbnail || 'https://via.placeholder.com/50' }} 
              style={styles.thumbnail} 
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemVariant}>{item.variant?.title}</Text>
              <Text style={styles.itemQty}>{item.quantity} шт.</Text>
            </View>
            <Text style={styles.itemPrice}>{formatMoney(item.unit_price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Стоимость товаров</Text>
        <Text style={styles.summaryValue}>{formatMoney(cart.subtotal || 0)}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Доставка (Самовывоз)</Text>
        <Text style={[styles.summaryValue, styles.freeText]}>Бесплатно</Text>
      </View>

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Итого</Text>
        <Text style={styles.totalValue}>{formatMoney(cart.total || 0)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  itemsList: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemVariant: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemQty: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  freeText: {
    color: '#4CAF50',
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
});
