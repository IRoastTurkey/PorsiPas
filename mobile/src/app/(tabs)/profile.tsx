import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { PageHeader } from '@/components/page-header';
import { StatTile } from '@/components/stat-tile';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <AppScreen>
      <PageHeader
        eyebrow="Your impact"
        title="Build a rescue habit"
        description="Your identity, preferences, points, and weekly streak will live here."
      />

      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>P</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.name}>Display name</Text>
          <Text style={styles.identityHint}>Anonymous sign-in begins in Phase 2</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatTile label="Rescue points" value="0" />
        <StatTile label="Week streak" value="0" />
      </View>

      <View style={styles.streakCard}>
        <Text style={styles.streakIcon}>🔥</Text>
        <View style={styles.streakCopy}>
          <Text style={styles.streakTitle}>Weekly, not daily</Text>
          <Text style={styles.streakDescription}>
            Rescue at least one portion in a week to continue your streak. It rewards consistency without pressuring students every day.
          </Text>
        </View>
      </View>

      <View style={styles.preferencesCard}>
        <Text style={styles.preferencesTitle}>Coming with live data</Text>
        <Text style={styles.preference}>📏 Adjustable FoodDrop alert radius</Text>
        <Text style={styles.preference}>🔔 Nearby-drop notification preference</Text>
        <Text style={styles.preference}>✏️ Editable display name</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.white,
    fontSize: typeScale.title,
    fontWeight: '900',
  },
  identityCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.ink,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
  identityHint: {
    color: colors.muted,
    fontSize: typeScale.caption,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.peach,
  },
  streakIcon: {
    fontSize: 28,
  },
  streakCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  streakTitle: {
    color: colors.ink,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
  streakDescription: {
    color: colors.muted,
    fontSize: typeScale.body,
    lineHeight: 21,
  },
  preferencesCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  preferencesTitle: {
    color: colors.ink,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
  preference: {
    color: colors.muted,
    fontSize: typeScale.body,
    lineHeight: 21,
  },
});
