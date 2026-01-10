import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { displayId } = useLocalSearchParams<{ displayId: string }>();

  // Prevent going back to checkout with hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const handleGoToOrders = () => {
    // Navigate to orders screen
    router.replace('/orders');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </View>

        <Text style={styles.title}>Заказ принят!</Text>
        <Text style={styles.description}>
          Спасибо за покупку. Мы уже начали собирать ваш заказ.
        </Text>

        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>Номер заказа</Text>
          <Text style={styles.orderId}>{displayId || '---'}</Text>
        </View>

        <Text style={styles.infoText}>
          Вы можете отслеживать статус заказа в разделе "Мои заказы".
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleGoToOrders}>
          <Text style={styles.buttonText}>Перейти к заказам</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  orderCard: {
    backgroundColor: '#F9F9F9',
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orderId: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
