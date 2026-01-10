import { Text } from 'react-native';
import { formatMoney } from '../../lib/formatters/money';

interface InstallmentPriceProps {
  amount: number;
  months?: number;
}

export function InstallmentPrice({ amount, months = 12 }: InstallmentPriceProps) {
  const monthlyPrice = Math.floor(amount / months);
  

  return (
    <Text className="text-gray-500 text-[10px] leading-tight">
      от {formatMoney(monthlyPrice)}/мес
    </Text>
  );
}
