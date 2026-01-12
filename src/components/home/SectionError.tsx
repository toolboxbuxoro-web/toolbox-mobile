import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SectionErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function SectionError({ 
  title = 'Не удалось загрузить', 
  message = 'Проверьте соединение',
  onRetry 
}: SectionErrorProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={32} color="#9CA3AF" />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onRetry && (
        <Pressable 
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed
          ]}
        >
          <Ionicons name="refresh" size={16} color="#DC2626" />
          <Text style={styles.retryText}>Повторить</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#6B7280',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  retryButtonPressed: {
    backgroundColor: '#FEF2F2',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 4,
  },
});
