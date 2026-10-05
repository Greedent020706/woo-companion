import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type QuantityStepperProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  itemName: string;
};

export function QuantityStepper({
  quantity,
  onChange,
  min = 0,
  max = 99,
  itemName,
}: QuantityStepperProps) {
  const canDecrease = quantity > min;
  const canIncrease = quantity < max;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange(quantity - 1)}
        disabled={!canDecrease}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Quitar una unidad de ${itemName}`}
        style={[styles.button, !canDecrease && styles.disabled]}
      >
        <Ionicons
          name={quantity - 1 === 0 && min === 0 ? 'trash-outline' : 'remove'}
          size={18}
          color={colors.text}
        />
      </Pressable>
      <Text style={styles.quantity} accessibilityLabel={`${quantity} unidades`}>
        {quantity}
      </Text>
      <Pressable
        onPress={() => onChange(quantity + 1)}
        disabled={!canIncrease}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Añadir una unidad de ${itemName}`}
        style={[styles.button, !canIncrease && styles.disabled]}
      >
        <Ionicons name="add" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  disabled: {
    opacity: 0.4,
  },
  quantity: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
