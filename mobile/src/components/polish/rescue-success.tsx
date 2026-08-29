import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GentleAppear } from '@/components/polish/gentle-appear';
import { PorsiPal } from '@/components/polish/porsipal';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { CollectFoodDropResult } from '@/domain/types';

type RescueSuccessProps = {
  result: CollectFoodDropResult;
  onDone: () => void;
  onViewProfile?: () => void;
};

export function RescueSuccess({ result, onDone, onViewProfile }: RescueSuccessProps) {
  if (result.code !== 'success') return null;

  return (
    <GentleAppear style={styles.card}>
      <View style={styles.sparkRow} accessibilityElementsHidden>
        <Text style={styles.spark}>✦</Text>
        <PorsiPal pose="success" size={150} />
        <Text style={styles.spark}>✦</Text>
      </View>
      <Text accessibilityRole="header" style={styles.title}>Rescue confirmed!</Text>
      <Text style={styles.description}>One meal has been collected and the live stock is updated.</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>meal rescued</Text>
        </View>
        {result.remainingStock !== null ? (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{result.remainingStock}</Text>
            <Text style={styles.statLabel}>portions left</Text>
          </View>
        ) : null}
      </View>

      {result.pointsAwarded > 0 || result.currentStreak !== null ? (
        <View style={styles.rewardRow}>
          {result.pointsAwarded > 0 ? <Text style={styles.reward}>+{result.pointsAwarded} points</Text> : null}
          {result.currentStreak !== null ? <Text style={styles.reward}>🔥 Week {result.currentStreak}</Text> : null}
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={onDone} style={styles.primaryButton}>
        <Text style={styles.primaryText}>Find another FoodDrop</Text>
      </Pressable>
      {onViewProfile ? (
        <Pressable accessibilityRole="button" onPress={onViewProfile} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>View my impact</Text>
        </Pressable>
      ) : null}
      <Text style={styles.responsibleCopy}>Take only what you’ll enjoy. Every rescued portion should be eaten.</Text>
    </GentleAppear>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  sparkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spark: { color: colors.accent, fontSize: 25 },
  title: { color: colors.ink, fontSize: typeScale.display, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.muted, fontSize: typeScale.bodyLarge, lineHeight: 24, textAlign: 'center' },
  statsRow: { width: '100%', flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.mint },
  statValue: { color: colors.primaryDark, fontSize: typeScale.title, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: typeScale.caption, fontWeight: '700', textAlign: 'center' },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  reward: { color: colors.meteor, fontSize: typeScale.body, fontWeight: '900' },
  primaryButton: { width: '100%', minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.primary },
  primaryText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  secondaryButton: { width: '100%', minHeight: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: radii.pill },
  secondaryText: { color: colors.primary, fontSize: typeScale.body, fontWeight: '900' },
  responsibleCopy: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18, textAlign: 'center' },
});
