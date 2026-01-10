import React, { useEffect } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useOrders } from '../hooks/useOrders';
import { useAuthStore } from '../store/auth-store';
import { OrderCard } from '../components/orders/OrderCard';
import { OrdersEmptyState } from '../components/orders/OrdersEmptyState';
import { OrdersErrorState } from '../components/orders/OrdersErrorState';
import { OrdersSkeleton } from '../components/orders/OrdersSkeleton';
import { AuthSheet } from '../components/auth/AuthSheet';

export default function OrdersScreen() {
  const { state, orders, refreshing, refresh, retry } = useOrders();
  const { status } = useAuthStore();
  const router = useRouter();
  const [isAuthVisible, setIsAuthVisible] = React.useState(false);

  useEffect(() => {
    if (status === 'unauthorized') {
      setIsAuthVisible(true);
    }
  }, [status]);

  const handleOrderPress = (id: string) => {
    router.push(`/order/${id}`);
  };

  const handleCatalogPress = () => {
    router.push('/(tabs)/catalog');
  };

  const renderContent = () => {
    if (status === 'unauthorized') {
      return (
        <OrdersEmptyState onCatalogPress={handleCatalogPress} />
      );
    }

    switch (state) {
      case 'loading':
        return <OrdersSkeleton />;
      case 'empty':
        return <OrdersEmptyState onCatalogPress={handleCatalogPress} />;
      case 'error':
        return <OrdersErrorState onRetry={retry} />;
      case 'loaded':
        return (
          <FlatList
            data={orders}
            renderItem={({ item }) => (
              <OrderCard order={item} onPress={handleOrderPress} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={refresh} 
                tintColor="#DC2626" 
              />
            }
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Мои заказы',
          headerBackTitle: 'Назад',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: false,
        }} 
      />

      {renderContent()}

      <AuthSheet 
        isVisible={isAuthVisible} 
        onClose={() => setIsAuthVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 8,
  },
});
