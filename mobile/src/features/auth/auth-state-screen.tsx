import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing, typeScale } from '@/constants/theme';

type Props = {
  kind: 'loading' | 'config_required' | 'error';
  message?: string | null;
  onRetry?: () => void;
};

export function AuthStateScreen({ kind, message, onRetry }: Props) {
  const isLoading = kind === 'loading';
  const title =
    kind === 'config_required'
      ? 'Connect Supabase to continue'
      : kind === 'error'
        ? 'PorsiPas could not start'
        : 'Preparing your rescue pass';
  const description =
    kind === 'config_required'
      ? 'Create mobile/.env from .env.example, then add the project URL and publishable key. Restart Expo after saving it.'
      : message ?? 'Signing you in securely. No password needed.';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.meteor}>☄️</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {isLoading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
        {onRetry ? (
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  meteor: { fontSize: 48 },
  title: {
    color: colors.ink,
    fontSize: typeScale.title,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontSize: typeScale.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  buttonText: { color: colors.white, fontWeight: '900' },
});
