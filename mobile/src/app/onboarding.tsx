import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PorsiPal } from '@/components/polish';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-provider';

export default function OnboardingScreen() {
  const { setDisplayName } = useAuth();
  const [displayName, setDisplayNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);
      await setDisplayName(displayName);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save your name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <PorsiPal size={112} style={styles.mascot} />
          <Text style={styles.eyebrow}>WELCOME TO PORSIPAS</Text>
          <Text style={styles.title}>What should rescuers call you?</Text>
          <Text style={styles.description}>
            No password needed. Your display name appears on your profile and future host activity.
          </Text>

          <TextInput
            accessibilityLabel="Display name"
            autoCapitalize="words"
            autoCorrect={false}
            editable={!saving}
            maxLength={40}
            onChangeText={setDisplayNameInput}
            onSubmitEditing={() => void submit()}
            placeholder="e.g. Darry"
            placeholderTextColor={colors.tabInactive}
            returnKeyType="done"
            style={styles.input}
            value={displayName}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={saving || displayName.trim().length < 2}
            onPress={() => void submit()}
            style={({ pressed }) => [
              styles.button,
              (saving || displayName.trim().length < 2) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}>
            {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Start rescuing</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1, justifyContent: 'center' },
  content: { gap: spacing.lg, padding: spacing.xl },
  mascot: { alignSelf: 'center' },
  eyebrow: {
    color: colors.primary,
    fontSize: typeScale.caption,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.ink,
    fontSize: typeScale.display,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 40,
  },
  description: { color: colors.muted, fontSize: typeScale.bodyLarge, lineHeight: 24 },
  input: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: typeScale.bodyLarge,
    fontWeight: '700',
  },
  error: { color: '#A33A35', fontSize: typeScale.body },
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' },
});
