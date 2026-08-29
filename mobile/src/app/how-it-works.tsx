import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { PageHeader } from '@/components/page-header';
import { PorsiPal } from '@/components/polish';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

const STEPS = [
  {
    number: '01',
    symbol: '☄',
    title: 'Spot the meteor',
    body: 'Find a live surplus FoodDrop in the list or meteor map. Stock and pickup timing stay current.',
  },
  {
    number: '02',
    symbol: '▣',
    title: 'Scan at pickup',
    body: 'Travel to the host, check the food details, and scan the physical QR only when collecting one portion.',
  },
  {
    number: '03',
    symbol: '✦',
    title: 'Grow your orbit',
    body: 'A verified rescue updates stock once, grows your weekly mission, and unlocks PorsiPal ranks and badges.',
  },
];

export default function HowItWorksScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <PageHeader
        eyebrow="30-second tour"
        title="Catch. Scan. Rescue."
        description="PorsiPas turns time-sensitive campus surplus into a small, verifiable rescue habit."
      />

      <View style={styles.mascotCard}>
        <PorsiPal size={126} />
        <View style={styles.copy}>
          <Text style={styles.mascotTitle}>Meet PorsiPal</Text>
          <Text style={styles.body}>
            Your cosmic rescue companion celebrates real collections—never taps, estimates, or unverified claims.
          </Text>
        </View>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step) => (
          <View accessible accessibilityLabel={`Step ${step.number}. ${step.title}. ${step.body}`} key={step.number} style={styles.stepCard}>
            <View style={styles.symbolWrap}>
              <Text style={styles.symbol}>{step.symbol}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.stepNumber}>STEP {step.number}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.body}>{step.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.truthCard}>
        <Text style={styles.truthEyebrow}>WHAT COUNTS</Text>
        <Text style={styles.truthTitle}>One server-confirmed collection = one rescued portion</Text>
        <Text style={styles.body}>
          Points, missions, badges, history, and live stock change only after Supabase accepts the QR collection. Duplicate scans earn nothing and cannot reduce stock twice.
        </Text>
      </View>

      <View style={styles.boundaryCard}>
        <Text style={styles.sectionTitle}>Built around trust</Text>
        <BoundaryRow
          title="Private by design"
          body="Location is requested only while the app is open. Watch points stay private and are never shared with hosts."
        />
        <BoundaryRow
          title="Foreground alert baseline"
          body="The hackathon prototype provides in-app and running-app alerts. Closed-app remote push is a future production step."
        />
        <BoundaryRow
          title="Food responsibility"
          body="Hosts describe allergens and confirm unserved surplus. PorsiPas coordinates pickup; it does not certify food safety."
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/')}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryText}>Explore live FoodDrops</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.back()}>
        <Text style={styles.backText}>Go back</Text>
      </Pressable>
    </AppScreen>
  );
}

function BoundaryRow({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.boundaryRow}>
      <Text style={styles.check}>✓</Text>
      <View style={styles.copy}>
        <Text style={styles.boundaryTitle}>{title}</Text>
        <Text style={styles.boundaryBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mascotCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.lavender },
  copy: { flex: 1, gap: spacing.xs },
  mascotTitle: { color: colors.meteor, fontSize: typeScale.title, fontWeight: '900' },
  body: { color: colors.muted, fontSize: typeScale.body, lineHeight: 22 },
  steps: { gap: spacing.md },
  stepCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface },
  symbolWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.mint },
  symbol: { color: colors.primaryDark, fontSize: 25, fontWeight: '900' },
  stepNumber: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  stepTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  truthCard: { gap: spacing.sm, padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.peach },
  truthEyebrow: { color: colors.meteor, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1 },
  truthTitle: { color: colors.ink, fontSize: typeScale.title, fontWeight: '900', lineHeight: 30 },
  boundaryCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.surface },
  sectionTitle: { color: colors.ink, fontSize: typeScale.title, fontWeight: '900' },
  boundaryRow: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  check: { width: 26, color: colors.primary, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  boundaryTitle: { color: colors.ink, fontSize: typeScale.body, fontWeight: '900' },
  boundaryBody: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18 },
  primaryButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radii.pill, backgroundColor: colors.primary },
  primaryText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  backText: { color: colors.primaryDark, fontSize: typeScale.body, fontWeight: '900', textAlign: 'center', textDecorationLine: 'underline' },
  pressed: { opacity: 0.8 },
});
