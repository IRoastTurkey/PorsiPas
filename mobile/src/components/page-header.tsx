import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typeScale } from '@/constants/theme';

type PageHeaderProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function PageHeader({ description, eyebrow, title }: PageHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.brandRow}>
        <View style={styles.mark}>
          <Text style={styles.markText}>P</Text>
        </View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  markText: {
    color: colors.white,
    fontWeight: '900',
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: typeScale.caption,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: typeScale.display,
    fontWeight: '900',
    letterSpacing: -1.1,
    lineHeight: 39,
  },
  description: {
    maxWidth: 560,
    color: colors.muted,
    fontSize: typeScale.bodyLarge,
    lineHeight: 24,
  },
});
