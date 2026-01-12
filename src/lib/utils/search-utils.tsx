import React from 'react';
import { Text } from 'react-native';

/**
 * Splits text into parts and highlights the matching part from the query
 */
export function highlightMatch(text: string, query: string, highlightStyle: object = { fontWeight: 'bold', color: '#DC2626' }) {
  if (!query.trim()) return <Text>{text}</Text>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <Text>
      {parts.map((part, i) => (
        <Text key={i} style={part.toLowerCase() === query.toLowerCase() ? highlightStyle : {}}>
          {part}
        </Text>
      ))}
    </Text>
  );
}

export const POPULAR_SEARCHES = [
  "Дрель",
  "Шуруповерт",
  "Болгарка",
  "Перфоратор",
  "Электропила",
  "Отвертка",
  "Молоток",
  "Лазерный уровень",
  "Шлифмашина",
  "Сварочный аппарат",
  "Набор инструментов",
  "Гаечный ключ",
  "Плоскогубцы",
  "Рулетка",
  "Циркулярная пила"
];
