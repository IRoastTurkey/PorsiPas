import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typeScale } from '@/constants/theme';

type FeatureCardProps = {
  description: string;
  icon: string;
  title: string;
  tone: 'lavender' | 'mint' | 'peach';
};

const backgrounds = {
  lavender: colors.lavender,
  mint: colors.mint,
  peach: colors.peach,
};

export function FeatureCard({ description, icon, title, tone }: FeatureCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: backgrounds[tone] }]}>
      <View style={styles.iconBubble}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.status}>PLANNED</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
  },
  iconBubble: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  icon: {
    fontSize: 21,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.ink,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
  status: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  description: {
    color: colors.muted,
    fontSize: typeScale.body,
    lineHeight: 21,
  },
});
