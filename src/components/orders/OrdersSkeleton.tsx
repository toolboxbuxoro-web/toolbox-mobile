import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

export function OrdersSkeleton() {
  return (
    <ScrollView style={styles.container} scrollEnabled={false}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.orderIdSkeleton} />
            <View style={styles.badgeSkeleton} />
          </View>
          <View style={styles.dateSkeleton} />
          <View style={styles.summarySkeleton} />
          <View style={styles.footer}>
            <View style={styles.labelSkeleton} />
            <View style={styles.priceSkeleton} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderIdSkeleton: {
    width: 120,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  badgeSkeleton: {
    width: 60,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  dateSkeleton: {
    width: 100,
    height: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    marginBottom: 16,
  },
  summarySkeleton: {
    width: '80%',
    height: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 12,
  },
  labelSkeleton: {
    width: 80,
    height: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  priceSkeleton: {
    width: 100,
    height: 18,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
});
