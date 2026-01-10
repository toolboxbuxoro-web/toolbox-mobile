import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrdersEmptyStateProps {
  onCatalogPress: () => void;
}

export function OrdersEmptyState({ onCatalogPress }: OrdersEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.title}>У вас пока нет заказов</Text>
      <Text style={styles.subtitle}>Самое время выбрать инструменты</Text>
      
      <Pressable 
        style={styles.button}
        onPress={onCatalogPress}
        android_ripple={{ color: '#B91C1C' }}
      >
        <Text style={styles.buttonText}>Перейти в каталог</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F9FAFB',
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
