import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  isLoading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'solid',
  disabled = false,
  isLoading = false,
}: PrimaryButtonProps) {
  const isSolid = variant === 'solid';
  const contentColor = isSolid ? colors.onPrimary : colors.primary;
  const isInactive = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: isLoading }}
      style={({ pressed }) => [
        styles.button,
        isSolid ? styles.solid : styles.outline,
        pressed && styles.pressed,
        isInactive && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        icon && <Ionicons name={icon} size={20} color={contentColor} />
      )}
      <Text style={[styles.label, { color: contentColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  solid: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.button,
  },
});
