import { useCallback, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

import { AppScreen } from '@/components/app-screen';
import { FoodDropCard } from '@/components/discovery/food-drop-card';
import { PageHeader } from '@/components/page-header';
import { MeteorMarker, resolveFoodDropVisualState } from '@/components/polish';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { DEFAULT_CAMPUS_REGION } from '@/constants/food-drops';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { FoodDropSummary } from '@/domain/types';
import { foodDropReadService } from '@/features/food-drops/food-drop-service';
import {
  getApprovedForegroundOrigin,
  requestForegroundOrigin,
  type LocationPoint,
} from '@/services/location/foreground-location';

type LocationState = 'idle' | 'loading' | 'granted' | 'denied' | 'blocked' | 'unavailable';

export default function DiscoverScreen() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [drops, setDrops] = useState<FoodDropSummary[]>([]);
  const [origin, setOrigin] = useState<LocationPoint | null>(getApprovedForegroundOrigin());
  const [locationState, setLocationState] = useState<LocationState>(origin ? 'granted' : 'idle');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDrops = useCallback(async (nextOrigin: LocationPoint | null) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const results = await foodDropReadService.listActive({
        origin: nextOrigin ?? undefined,
      });
      setDrops(results);
    } catch {
      setErrorMessage('FoodDrops could not be loaded. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDrops(origin);
    }, [loadDrops, origin]),
  );

  const enableLocation = useCallback(async () => {
    setLocationState('loading');
    setLocationMessage(null);
    const result = await requestForegroundOrigin();
    if (result.status === 'granted') {
      setOrigin(result.origin);
      setLocationState('granted');
      return;
    }
    if (result.status === 'denied') {
      setLocationState(result.canAskAgain ? 'denied' : 'blocked');
      setLocationMessage(
        result.canAskAgain
          ? 'Location was denied. Discovery still works with the default campus view.'
          : 'Location is blocked in system settings. Discovery still works with the default campus view.',
      );
      return;
    }
    setLocationState('unavailable');
    setLocationMessage(result.message);
  }, []);

  const openDrop = (id: string) => router.push({ pathname: '/food-drop/[id]', params: { id } });

  return (
    <AppScreen>
      <PageHeader
        eyebrow="PorsiPas"
        title="Catch a FoodDrop"
        description="Find live surplus meals nearby before their pickup windows close."
      />

      <View style={styles.locationCard}>
        <View style={styles.locationCopy}>
          <Text style={styles.locationTitle}>
            {origin ? 'Nearest-first discovery is on' : 'Browse without sharing your location'}
          </Text>
          <Text style={styles.locationDescription}>
            {origin
              ? 'Your foreground location is used only on this device to calculate approximate distance.'
              : 'Use the default campus view, or allow foreground location for distance sorting.'}
          </Text>
          {locationMessage ? <Text style={styles.locationMessage}>{locationMessage}</Text> : null}
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={locationState === 'loading'}
          onPress={() => void enableLocation()}
          style={styles.smallButton}>
          <Text style={styles.smallButtonText}>
            {locationState === 'loading' ? 'Locating…' : origin ? 'Refresh location' : 'Use my location'}
          </Text>
        </Pressable>
        {locationState === 'blocked' ? (
          <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()}>
            <Text style={styles.settingsLink}>Open device settings</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.toolbar}>
        <View style={styles.switcher}>
          {(['list', 'map'] as const).map((option) => (
            <Pressable
              accessibilityRole="button"
              key={option}
              onPress={() => setView(option)}
              style={[styles.switchButton, view === option && styles.switchButtonActive]}>
              <Text style={[styles.switchText, view === option && styles.switchTextActive]}>
                {option === 'list' ? 'List' : 'Map'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={() => void loadDrops(origin)}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {loading && drops.length === 0 ? (
        <LoadingState />
      ) : null}

      {errorMessage ? (
        <ErrorState
          description={errorMessage}
          onRetry={() => void loadDrops(origin)}
          title="Unable to load discovery"
        />
      ) : null}

      {!loading && !errorMessage && drops.length === 0 ? (
        <EmptyState
          description="There are no unexpired drops with portions remaining. Fresh rescues can appear anytime."
          primaryAction={{ label: 'Check again', onPress: () => void loadDrops(origin) }}
          title="No active FoodDrops right now"
        />
      ) : null}

      {!errorMessage && drops.length > 0 && view === 'map' ? (
        <MapView
          key={origin ? `${origin.latitude}:${origin.longitude}` : 'campus'}
          accessibilityLabel="Map of active FoodDrops"
          initialRegion={
            origin
              ? { ...origin, latitudeDelta: 0.012, longitudeDelta: 0.012 }
              : DEFAULT_CAMPUS_REGION
          }
          showsUserLocation={Boolean(origin)}
          style={styles.map}>
          {drops.map((drop) => (
            <Marker
              key={drop.id}
              coordinate={{ latitude: drop.latitude, longitude: drop.longitude }}
              onPress={() => openDrop(drop.id)}>
              <MeteorMarker
                remainingStock={drop.remainingStock}
                state={resolveFoodDropVisualState(drop)}
                title={drop.title}
              />
            </Marker>
          ))}
        </MapView>
      ) : null}

      {!errorMessage && drops.length > 0 && view === 'list' ? (
        <View style={styles.dropList}>
          {drops.map((drop) => (
            <FoodDropCard key={drop.id} drop={drop} onPress={() => openDrop(drop.id)} />
          ))}
        </View>
      ) : null}

      {drops.length > 0 ? (
        <Text style={styles.summary}>
          {drops.length} collectible FoodDrop{drops.length === 1 ? '' : 's'}
        </Text>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  locationCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.mint },
  locationCopy: { gap: spacing.xs },
  locationTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  locationDescription: { color: colors.muted, fontSize: typeScale.body, lineHeight: 21 },
  locationMessage: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '800', lineHeight: 18 },
  smallButton: { alignSelf: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: colors.primary },
  smallButtonText: { color: colors.white, fontWeight: '900' },
  settingsLink: { color: colors.primaryDark, fontWeight: '900', textDecorationLine: 'underline' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switcher: { flex: 1, flexDirection: 'row', padding: 4, borderRadius: radii.pill, backgroundColor: colors.mint },
  switchButton: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.pill },
  switchButtonActive: { backgroundColor: colors.surface },
  switchText: { color: colors.muted, fontWeight: '800' },
  switchTextActive: { color: colors.primaryDark },
  refreshText: { color: colors.primaryDark, fontWeight: '900' },
  dropList: { gap: spacing.md },
  map: { height: 360, borderRadius: radii.md },
  summary: { color: colors.muted, fontSize: typeScale.caption, textAlign: 'center' },
});
