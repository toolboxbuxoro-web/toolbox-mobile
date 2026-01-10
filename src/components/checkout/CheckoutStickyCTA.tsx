import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney } from '../../lib/formatters/money';

interface Props {
  total: number;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}

export const CheckoutStickyCTA: React.FC<Props> = ({ total, onPress, loading, disabled }) => {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.content}>
          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>Итого к оплате</Text>
            <Text style={styles.totalValue}>{formatMoney(total)}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Оформить заказ</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 16,
    paddingHorizontal: 16,
    // Add shadow for better visual separation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    backgroundColor: '#FF6B00', // Brand orange
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
