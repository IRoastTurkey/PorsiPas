import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { FeatureCard } from '@/components/feature-card';
import { PageHeader } from '@/components/page-header';
import { StatTile } from '@/components/stat-tile';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

export default function DiscoverScreen() {
  return (
    <AppScreen>
      <PageHeader
        eyebrow="PorsiPas"
        title="Catch a FoodDrop"
        description="Find surplus meals nearby before they disappear. Every rescue keeps good food out of the bin."
      />

      <View style={styles.hero}>
        <View style={styles.meteorBubble}>
          <Text style={styles.meteor}>☄️</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>DISCOVER</Text>
          <Text style={styles.heroTitle}>The map is preparing for impact.</Text>
          <Text style={styles.heroDescription}>
            Live FoodDrops, distance sorting, and pickup details arrive once the backend is connected.
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatTile label="Active drops" value="0" />
        <StatTile label="Alert radius" value="Adjustable" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Built for a fast rescue</Text>
        <FeatureCard
          icon="📍"
          title="Nearest first"
          description="Open the app to refresh your location and sort available meals by distance."
          tone="mint"
        />
        <FeatureCard
          icon="🥡"
          title="Live availability"
          description="See remaining portions and the pickup deadline before making the trip."
          tone="peach"
        />
        <FeatureCard
          icon="✓"
          title="Verified rescue"
          description="Scan the FoodDrop QR code on site to claim one portion and update stock."
          tone="lavender"
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.meteor,
  },
  meteorBubble: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  meteor: {
    fontSize: 36,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  heroEyebrow: {
    color: colors.peach,
    fontSize: typeScale.caption,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    color: colors.white,
    fontSize: typeScale.title,
    fontWeight: '900',
    lineHeight: 29,
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: typeScale.body,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
});
