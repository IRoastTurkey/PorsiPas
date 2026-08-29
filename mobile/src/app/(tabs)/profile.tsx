import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { PageHeader } from '@/components/page-header';
import { StatTile } from '@/components/stat-tile';
import { CollectionRecord, UserProfile, WatchZone } from '@/domain/retention';
import { mockRetentionService, mockWatchZoneService } from '@/features/retention/mock-retention-adapter';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

const radiusOptions = [50, 250, 500, 1000, 2000];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [watchZone, setWatchZone] = useState<WatchZone | null>(null);
  const [history, setHistory] = useState<CollectionRecord[]>([]);
  const [meals, setMeals] = useState({ userMealsRescued: 0, totalMealsRescued: 0 });
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [radius, setRadius] = useState(250);

  useEffect(() => {
    void Promise.all([mockRetentionService.getMyProfile(), mockWatchZoneService.getMine(), mockRetentionService.listMyCollections(), mockRetentionService.getVerifiedImpact()])
      .then(([nextProfile, nextZone, nextHistory, nextMeals]) => {
        setProfile(nextProfile); setWatchZone(nextZone); setRadius(nextZone?.radiusMeters ?? 250);
        setAlertsEnabled(nextZone?.enabled ?? false); setHistory(nextHistory); setMeals(nextMeals);
      });
  }, []);

  async function toggleAlerts(enabled: boolean) {
    setAlertsEnabled(enabled);
    if (enabled && watchZone) setWatchZone(await mockWatchZoneService.saveMine({ ...watchZone, enabled, radiusMeters: radius }));
    if (!enabled) { await mockWatchZoneService.disableMine(); setWatchZone((current) => current ? { ...current, enabled: false } : current); }
  }

  async function changeRadius(nextRadius: number) {
    setRadius(nextRadius);
    if (watchZone) setWatchZone(await mockWatchZoneService.saveMine({ ...watchZone, radiusMeters: nextRadius }));
  }

  return (
    <AppScreen>
      <PageHeader eyebrow="Your impact" title="Build a rescue habit" description="Your verified rescues, alert preferences, and weekly progress live here." />
      <View style={styles.identityCard}><View style={styles.avatar}><Text style={styles.avatarText}>{profile?.displayName.charAt(0).toUpperCase() ?? 'P'}</Text></View><View style={styles.identityCopy}><Text style={styles.name}>{profile?.displayName ?? 'Loading profile'}</Text><Text style={styles.identityHint}>Your profile is private to you.</Text></View></View>
      <View style={styles.statsRow}><StatTile label="Rescue points" value={String(profile?.pointsTotal ?? 0)} /><StatTile label="Week streak" value={`${profile?.currentStreak ?? 0} weeks`} /></View>

      <View style={styles.card}><View style={styles.row}><View style={styles.copy}><Text style={styles.cardTitle}>FoodDrop alerts</Text><Text style={styles.muted}>Get notified about new drops near your saved watch point.</Text></View><Switch value={alertsEnabled} onValueChange={toggleAlerts} trackColor={{ false: colors.border, true: colors.mint }} thumbColor={alertsEnabled ? colors.primary : colors.muted} /></View><Text style={styles.savedPoint}>Saved watch point: {watchZone?.label ?? 'No watch point selected'}</Text><Text style={styles.note}>This is your saved alert area, not your live location. Location refresh happens only while the app is open.</Text><Text style={styles.label}>Alert radius: {radius} m</Text><View style={styles.options}>{radiusOptions.map((option) => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: radius === option }} onPress={() => void changeRadius(option)} style={[styles.option, radius === option && styles.selectedOption]}><Text style={[styles.optionText, radius === option && styles.selectedText]}>{option} m</Text></Pressable>)}</View><Pressable accessibilityRole="button" onPress={() => void toggleAlerts(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Disable saved watch area</Text></Pressable></View>

      <View style={styles.impactCard}><Text style={styles.cardTitle}>Verified impact</Text><View style={styles.statsRow}><StatTile label="Your meals rescued" value={String(meals.userMealsRescued)} /><StatTile label="Prototype total" value={String(meals.totalMealsRescued)} /></View><Text style={styles.note}>Measured from successful server-verified collections. One portion equals one rescued meal.</Text></View>
      <View style={styles.card}><Text style={styles.cardTitle}>Rescue history</Text>{history.length === 0 ? <Text style={styles.muted}>Your verified rescues will appear here.</Text> : history.map((item) => <View key={item.id} style={styles.historyRow}><View style={styles.copy}><Text style={styles.historyTitle}>{item.title}</Text><Text style={styles.muted}>{item.venueName} · {new Date(item.verifiedAt).toLocaleDateString()}</Text></View><Text style={styles.points}>+{item.pointsAwarded}</Text></View>)}</View>
      <Text style={styles.mockLabel}>DEMO PREVIEW · USING MOCK RETENTION ADAPTER</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  identityCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface },
  avatar: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.primary },
  avatarText: { color: colors.white, fontSize: typeScale.title, fontWeight: '900' }, identityCopy: { flex: 1, gap: spacing.xs }, name: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' }, identityHint: { color: colors.muted, fontSize: typeScale.caption }, statsRow: { flexDirection: 'row', gap: spacing.md },
  card: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface }, impactCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.mint }, row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, copy: { flex: 1, gap: spacing.xs }, cardTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' }, muted: { color: colors.muted, fontSize: typeScale.body, lineHeight: 21 }, savedPoint: { color: colors.primaryDark, fontWeight: '800' }, note: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18 }, label: { color: colors.ink, fontWeight: '800' }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, option: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border }, selectedOption: { backgroundColor: colors.primary, borderColor: colors.primary }, optionText: { color: colors.muted, fontWeight: '800' }, selectedText: { color: colors.white }, secondaryButton: { alignItems: 'center', padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.lavender }, secondaryButtonText: { color: colors.primaryDark, fontWeight: '900' }, historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }, historyTitle: { color: colors.ink, fontWeight: '800' }, points: { color: colors.primary, fontWeight: '900' }, mockLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
});
