import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth-store';

/**
 * Profile button for home header.
 * Shows: skeleton (loading), login icon (unauthorized), or initials (authorized).
 */
export function ProfileButton() {
  const router = useRouter();
  const { status, customer } = useAuthStore();

  const handlePress = () => {
    router.push('/(tabs)/profile');
  };

  // Loading state - skeleton circle
  if (status === 'loading') {
    return (
      <View style={[styles.container, styles.skeleton]} />
    );
  }

  // Unauthorized - login icon
  if (status === 'unauthorized') {
    return (
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <Ionicons name="person-outline" size={24} color="#666" />
      </TouchableOpacity>
    );
  }

  // Authorized - show initials avatar
  const getInitials = () => {
    const firstName = customer?.first_name || '';
    const lastName = customer?.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <TouchableOpacity style={[styles.container, styles.avatar]} onPress={handlePress}>
      <Text style={styles.initials}>{getInitials()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  skeleton: {
    backgroundColor: '#E5E5EA',
  },
  avatar: {
    backgroundColor: '#FF6B00',
  },
  initials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
