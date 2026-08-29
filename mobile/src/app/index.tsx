import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/app-screen';
import { FeatureCard } from '@/components/feature-card';
import { PageHeader } from '@/components/page-header';
import { StatTile } from '@/components/stat-tile';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import { FoodDropSummary } from '@/domain/types';
import { FoodDropCard } from '@/components/discovery/food-drop-card';
import { mockFoodDropReadService } from '@/services/food-drops/mock-service';

export default function DiscoverScreen() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [drops, setDrops] = useState<FoodDropSummary[]>([]);

  useEffect(() => {
    void mockFoodDropReadService.listActive({}).then(setDrops);
  }, []);

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
            Live data will replace this clearly labelled development preview when Phase 2 services are merged.
          </Text>
        </View>
      </View>

      <View style={styles.switcher}>
        {(['list', 'map'] as const).map((option) => (
          <Pressable key={option} onPress={() => setView(option)} style={[styles.switchButton, view === option && styles.switchButtonActive]}>
            <Text style={[styles.switchText, view === option && styles.switchTextActive]}>{option === 'list' ? 'List' : 'Map'}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.mockNotice}>DEVELOPMENT PREVIEW · MOCK FOODDROPS</Text>
      {view === 'map' ? (
        <MapView
          style={styles.map}
          initialRegion={{ latitude: 1.2974, longitude: 103.7762, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
          accessibilityLabel="FoodDrop map">
          {drops.map((drop) => (
            <Marker key={drop.id} coordinate={{ latitude: drop.latitude, longitude: drop.longitude }} title={drop.title} description={`${drop.remainingStock} portions left`} onCalloutPress={() => router.push(`/food-drop/${drop.id}`)} />
          ))}
        </MapView>
      ) : (
        <View style={styles.dropList}>
          {drops.map((drop) => <FoodDropCard key={drop.id} drop={drop} onPress={() => router.push(`/food-drop/${drop.id}`)} />)}
        </View>
      )}

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
  switcher: { flexDirection: 'row', padding: 4, borderRadius: radii.pill, backgroundColor: colors.mint },
  switchButton: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.pill },
  switchButtonActive: { backgroundColor: colors.surface },
  switchText: { color: colors.muted, fontWeight: '800' },
  switchTextActive: { color: colors.primaryDark },
  mockNotice: { color: colors.muted, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 0.8 },
  dropList: { gap: spacing.md },
  map: { height: 320, borderRadius: radii.md },
});
