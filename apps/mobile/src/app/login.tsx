import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { loginInputSchema } from '@woo/shared';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';
import { getErrorMessage } from '../lib/error-message';
import { colors, radius, spacing, typography } from '../theme';

const DEMO_EMAIL = 'cliente@demo.com';
const DEMO_PASSWORD = 'demo1234';

export default function LoginScreen() {
  const { login } = useAuth();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: 'checkout' }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsedCredentials = loginInputSchema.safeParse({ email: email.trim(), password });
    if (!parsedCredentials.success) {
      setErrorMessage(parsedCredentials.error.issues[0]?.message ?? 'Revisa los datos');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login(parsedCredentials.data);
      if (redirectTo === 'checkout') router.replace('/checkout');
      else router.back();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.title}>Bienvenido de nuevo</Text>
        <Text style={typography.caption}>Entra para comprar y consultar tus pedidos.</Text>

        {errorMessage && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label} nativeID="email-label">
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabelledBy="email-label"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label} nativeID="password-label">
            Contraseña
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            accessibilityLabelledBy="password-label"
            onSubmitEditing={handleSubmit}
            style={styles.input}
          />
        </View>

        <PrimaryButton
          label="Entrar"
          icon="log-in-outline"
          onPress={handleSubmit}
          isLoading={isSubmitting}
        />
        <PrimaryButton
          label="Usar cuenta demo"
          variant="outline"
          onPress={() => {
            setEmail(DEMO_EMAIL);
            setPassword(DEMO_PASSWORD);
          }}
        />

        <Text style={styles.hint}>
          Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
          {'\n'}API: {API_URL}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
  },
});
