import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrdersErrorStateProps {
  onRetry: () => void;
}

export function OrdersErrorState({ onRetry }: OrdersErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={64} color="#D1D5DB" />
      <Text style={styles.title}>Не удалось загрузить заказы</Text>
      <Text style={styles.subtitle}>Проверьте соединение с интернетом и попробуйте снова</Text>
      
      <Pressable 
        style={styles.button}
        onPress={onRetry}
        android_ripple={{ color: '#E5E7EB' }}
      >
        <Text style={styles.buttonText}>Повторить</Text>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  buttonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
});
