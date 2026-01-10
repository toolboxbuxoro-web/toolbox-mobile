import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { CheckoutFormData } from '../../types/checkout';

interface Props {
  data: CheckoutFormData;
  onChange: (data: CheckoutFormData) => void;
  errors: Record<string, string>;
}

export const CheckoutContactForm: React.FC<Props> = ({ data, onChange, errors }) => {
  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Контактные данные</Text>
      
      <View style={styles.field}>
        <Text style={styles.label}>Имя получателя</Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          value={data.name}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="Иван Иванов"
          placeholderTextColor="#999"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Номер телефона</Text>
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : null]}
          value={data.phone}
          onChangeText={(text) => handleChange('phone', text)}
          placeholder="+998 XX XXX XX XX"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Комментарий к заказу (необязательно)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={data.comment}
          onChangeText={(text) => handleChange('comment', text)}
          placeholder="Например: подъезд 2, этаж 4"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
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
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F9F9F9',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
