import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth-store';
import { AvatarInitials } from './AvatarInitials';

interface ProfileHeaderProps {
  onLoginPress?: () => void;
  onEditPress?: () => void;
}

export function ProfileHeader({ onLoginPress, onEditPress }: ProfileHeaderProps) {
  const insets = useSafeAreaInsets();
  const { customer, status } = useAuthStore();

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('998')) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
    }
    return phone;
  };

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <View style={styles.contentContainer}>
          <View style={[styles.avatarPlaceholder, styles.shimmer]} />
          <View style={styles.textContainer}>
            <View style={[styles.namePlaceholder, styles.shimmer]} />
            <View style={[styles.phonePlaceholder, styles.shimmer]} />
          </View>
        </View>
      );
    }

    if (status === 'unauthorized') {
      return (
        <Pressable 
          style={styles.contentContainer} 
          onPress={onLoginPress}
          android_ripple={{ color: '#E5E7EB' }}
        >
          <AvatarInitials size={48} />
          <View style={styles.textContainer}>
            <Text style={styles.loginTitle}>Войти</Text>
            <Text style={styles.loginSubtitle}>Получить доступ к заказам</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </Pressable>
      );
    }

    const displayName = customer?.first_name 
      ? `${customer.first_name}${customer.last_name ? ' ' + customer.last_name : ''}`
      : 'Пользователь';

    return (
      <Pressable 
        style={styles.contentContainer} 
        onPress={onEditPress}
        android_ripple={{ color: '#E5E7EB' }}
      >
        <AvatarInitials 
          firstName={customer?.first_name} 
          lastName={customer?.last_name} 
          size={48} 
          backgroundColor="#DC2626"
          textColor="#FFFFFF"
        />
        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.phoneText}>{formatPhone(customer?.phone)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  header: {
    height: 96,
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '100%',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  shimmer: {
    opacity: 0.6,
  },
  namePlaceholder: {
    height: 18,
    width: '60%',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 6,
  },
  phonePlaceholder: {
    height: 14,
    width: '40%',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
