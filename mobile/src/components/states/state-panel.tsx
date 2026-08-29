import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PorsiPal } from '@/components/polish/porsipal';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

export type StateAction = {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
};

type StatePanelProps = {
  title: string;
  description: string;
  symbol?: string;
  children?: ReactNode;
  primaryAction?: StateAction;
  secondaryAction?: StateAction;
  showMascot?: boolean;
};

export function StatePanel({
  title,
  description,
  symbol,
  children,
  primaryAction,
  secondaryAction,
  showMascot = true,
}: StatePanelProps) {
  return (
    <View style={styles.container}>
      {showMascot ? <PorsiPal size={126} /> : null}
      {symbol ? (
        <View accessibilityElementsHidden style={styles.symbolCircle}>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
      {children}
      {primaryAction ? (
        <Pressable
          accessibilityHint={primaryAction.accessibilityHint}
          accessibilityRole="button"
          onPress={primaryAction.onPress}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>{primaryAction.label}</Text>
        </Pressable>
      ) : null}
      {secondaryAction ? (
        <Pressable
          accessibilityHint={secondaryAction.accessibilityHint}
          accessibilityRole="button"
          onPress={secondaryAction.onPress}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>{secondaryAction.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  symbolCircle: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.mint,
  },
  symbol: { color: colors.primaryDark, fontSize: 25, fontWeight: '900' },
  title: {
    color: colors.ink,
    fontSize: typeScale.title,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    maxWidth: 400,
    color: colors.muted,
    fontSize: typeScale.bodyLarge,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  primaryText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  secondaryButton: {
    width: '100%',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.pill,
  },
  secondaryText: { color: colors.primaryDark, fontSize: typeScale.body, fontWeight: '900' },
  pressed: { opacity: 0.78 },
});
