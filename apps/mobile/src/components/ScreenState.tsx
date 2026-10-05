import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../lib/error-message';
import { colors, spacing, typography } from '../theme';
import { PrimaryButton } from './PrimaryButton';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.description}>{label}</Text>
    </View>
  );
}

type ErrorStateProps = { error: unknown; onRetry?: () => void };

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={44} color={colors.danger} />
      <Text style={styles.title}>Algo ha fallado</Text>
      <Text style={styles.description}>{getErrorMessage(error)}</Text>
      {onRetry && <PrimaryButton label="Reintentar" icon="refresh" onPress={onRetry} />}
    </View>
  );
}

type EmptyStateProps = {
  icon: IoniconName;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={44} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  description: {
    ...typography.caption,
    textAlign: 'center',
    maxWidth: 300,
  },
});
