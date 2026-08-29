import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PorsiPal } from '@/components/polish';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { CollectionRecord } from '@/domain/types';
import { buildEngagementSnapshot } from '@/features/engagement/progression';

type RescueJourneyCardProps = {
  currentStreak: number;
  history: CollectionRecord[];
  onShare: () => void;
  totalRescues: number;
};

export function RescueJourneyCard({
  currentStreak,
  history,
  onShare,
  totalRescues,
}: RescueJourneyCardProps) {
  const snapshot = buildEngagementSnapshot(history, totalRescues, currentStreak);
  const rescuesToNext = snapshot.nextRank
    ? snapshot.nextRank.minimumRescues - totalRescues
    : 0;

  return (
    <View style={styles.card}>
      <View style={styles.heroRow}>
        <PorsiPal size={92} />
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>PORSIPAL COSMIC JOURNEY</Text>
          <Text accessibilityRole="header" style={styles.rank}>{snapshot.rank.name}</Text>
          <Text style={styles.message}>{snapshot.rank.message}</Text>
        </View>
      </View>

      <View
        accessibilityLabel={
          snapshot.nextRank
            ? `${totalRescues} verified rescues. ${rescuesToNext} until ${snapshot.nextRank.name}.`
            : `${totalRescues} verified rescues. Highest rescue rank reached.`
        }
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: snapshot.rank.minimumRescues,
          max: snapshot.nextRank?.minimumRescues ?? totalRescues,
          now: totalRescues,
        }}
        accessible>
        <View style={styles.progressTrack}>
          <View style={[styles.rankProgress, { width: `${snapshot.rankProgress * 100}%` }]} />
        </View>
        <Text style={styles.progressCopy}>
          {snapshot.nextRank
            ? `${rescuesToNext} more rescue${rescuesToNext === 1 ? '' : 's'} to ${snapshot.nextRank.name}`
            : 'Highest rescue rank reached'}
        </Text>
      </View>

      <View style={styles.questCard}>
        <View style={styles.questHeading}>
          <View style={styles.copy}>
            <Text style={styles.questEyebrow}>{"THIS WEEK'S MISSION"}</Text>
            <Text style={styles.questTitle}>Catch three FoodDrops</Text>
          </View>
          <Text style={styles.questCount}>
            {Math.min(snapshot.weeklyRescues, snapshot.weeklyGoal)}/{snapshot.weeklyGoal}
          </Text>
        </View>
        <View
          accessibilityLabel={`Weekly rescue mission: ${Math.min(snapshot.weeklyRescues, snapshot.weeklyGoal)} of ${snapshot.weeklyGoal}`}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: snapshot.weeklyGoal,
            now: Math.min(snapshot.weeklyRescues, snapshot.weeklyGoal),
          }}
          style={styles.questTrack}>
          <View style={[styles.questProgress, { width: `${snapshot.weeklyProgress * 100}%` }]} />
        </View>
        <Text style={styles.questNote}>
          {snapshot.weeklyProgress >= 1
            ? 'Mission complete. Your rescue habit is in orbit!'
            : `${snapshot.weeklyGoal - snapshot.weeklyRescues} verified rescue${snapshot.weeklyGoal - snapshot.weeklyRescues === 1 ? '' : 's'} left this week.`}
        </Text>
      </View>

      <View style={styles.dailyRow}>
        <Text style={styles.dailySymbol}>{snapshot.dailyBonusClaimed ? '✓' : '✦'}</Text>
        <View style={styles.copy}>
          <Text style={styles.dailyTitle}>
            {snapshot.dailyBonusClaimed ? 'Daily rescue bonus secured' : 'Daily rescue bonus ready'}
          </Text>
          <Text style={styles.dailyNote}>
            {snapshot.dailyBonusClaimed
              ? 'Come back tomorrow for another first-rescue points opportunity.'
              : 'Your first verified rescue today can award points.'}
          </Text>
        </View>
      </View>

      <View style={styles.badgeSection}>
        <Text style={styles.sectionTitle}>Rescue badges</Text>
        <View style={styles.badges}>
          {snapshot.badges.map((badge) => (
            <View
              accessibilityLabel={`${badge.name}. ${badge.unlocked ? 'Unlocked' : 'Locked'}. ${badge.description}`}
              accessible
              key={badge.id}
              style={[styles.badge, !badge.unlocked && styles.lockedBadge]}>
              <Text style={[styles.badgeSymbol, !badge.unlocked && styles.lockedText]}>
                {badge.symbol}
              </Text>
              <Text style={[styles.badgeName, !badge.unlocked && styles.lockedText]}>
                {badge.name}
              </Text>
              <Text style={styles.badgeState}>{badge.unlocked ? 'Unlocked' : 'Locked'}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityHint="Opens your phone's share sheet without including location or QR data"
        accessibilityRole="button"
        onPress={onShare}
        style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
        <Text style={styles.shareButtonText}>Share my rescue journey</Text>
      </Pressable>
      <Text style={styles.privacyNote}>Shares only your rank, verified meal count, and streak.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#D9CDEE',
    borderRadius: radii.lg,
    backgroundColor: colors.lavender,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.meteor, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 0.8 },
  rank: { color: colors.ink, fontSize: typeScale.title, fontWeight: '900' },
  message: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18 },
  progressTrack: { height: 10, overflow: 'hidden', borderRadius: radii.pill, backgroundColor: colors.surface },
  rankProgress: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.meteor },
  progressCopy: { marginTop: spacing.sm, color: colors.muted, fontSize: typeScale.caption, fontWeight: '700' },
  questCard: { gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface },
  questHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  questEyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  questTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  questCount: { color: colors.meteor, fontSize: typeScale.title, fontWeight: '900' },
  questTrack: { height: 9, overflow: 'hidden', borderRadius: radii.pill, backgroundColor: colors.mint },
  questProgress: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.primary },
  questNote: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18 },
  dailyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.peach },
  dailySymbol: { width: 30, color: colors.meteor, fontSize: typeScale.title, fontWeight: '900', textAlign: 'center' },
  dailyTitle: { color: colors.ink, fontSize: typeScale.body, fontWeight: '900' },
  dailyNote: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18 },
  badgeSection: { gap: spacing.sm },
  sectionTitle: { color: colors.ink, fontSize: typeScale.body, fontWeight: '900' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { width: '48%', minHeight: 104, justifyContent: 'center', gap: spacing.xs, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface },
  lockedBadge: { opacity: 0.58 },
  badgeSymbol: { color: colors.meteor, fontSize: 23, fontWeight: '900' },
  badgeName: { color: colors.ink, fontSize: typeScale.caption, fontWeight: '900' },
  badgeState: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  lockedText: { color: colors.tabInactive },
  shareButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radii.pill, backgroundColor: colors.meteor },
  shareButtonText: { color: colors.white, fontSize: typeScale.body, fontWeight: '900' },
  pressed: { opacity: 0.8 },
  privacyNote: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
