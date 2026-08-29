import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { FoodDropStatusBadge, resolveFoodDropVisualState } from '@/components/polish';
import { EmptyState, ErrorState, LoadingState, TerminalFoodDropState } from '@/components/states';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { FoodDrop, FoodDropStatus } from '@/domain/types';
import { foodDropReadService } from '@/features/food-drops/food-drop-service';
import {
  distanceBetweenMeters,
  getApprovedForegroundOrigin,
} from '@/services/location/foreground-location';

function displayStatus(drop: FoodDrop): FoodDropStatus {
  if (drop.remainingStock <= 0) return 'depleted';
  if (drop.status === 'active' && new Date(drop.pickupDeadline).getTime() <= Date.now()) {
    return 'expired';
  }
  return drop.status;
}

function formatDeadline(value: string) {
  return new Intl.DateTimeFormat('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Singapore',
  }).format(new Date(value));
}

function formatDistance(value: number | null) {
  if (value === null) return 'Default campus view · enable location from Discover for distance';
  if (value < 1000) return `About ${value} m away`;
  return `About ${(value / 1000).toFixed(1)} km away`;
}

export default function FoodDropDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [drop, setDrop] = useState<FoodDrop | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErrorMessage('This FoodDrop link is incomplete.');
      setLoading(false);
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;

    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const current = await foodDropReadService.getById(id);
        if (!active) return;
        setDrop(current);
        if (current) {
          unsubscribe = foodDropReadService.subscribeToFoodDrop(id, (nextDrop) => {
            if (!active) return;
            const remainingStock = Math.max(0, nextDrop.remainingStock);
            setDrop({
              ...nextDrop,
              remainingStock,
              status: remainingStock === 0 ? 'depleted' : nextDrop.status,
            });
          });
        }
      } catch {
        if (active) setErrorMessage('This FoodDrop could not be refreshed. Check your connection and try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [id]);

  const distanceMeters = useMemo(() => {
    const origin = getApprovedForegroundOrigin();
    if (!origin || !drop) return null;
    return distanceBetweenMeters(origin, {
      latitude: drop.latitude,
      longitude: drop.longitude,
    });
  }, [drop]);

  if (loading) {
    return <AppScreen><LoadingState title="Refreshing FoodDrop details…" /></AppScreen>;
  }

  if (errorMessage) {
    return (
      <AppScreen>
        <ErrorState
          description={errorMessage}
          secondaryAction={{ label: 'Back to discovery', onPress: () => router.back() }}
          title="Unable to open FoodDrop"
        />
      </AppScreen>
    );
  }

  if (!drop) {
    return (
      <AppScreen>
        <EmptyState
          description="This FoodDrop may have ended or no longer be visible. Return to discovery for current options."
          primaryAction={{ label: 'Back to discovery', onPress: () => router.replace('/') }}
          title="FoodDrop unavailable"
        />
      </AppScreen>
    );
  }

  const status = displayStatus(drop);
  const visualState = resolveFoodDropVisualState({
    status,
    remainingStock: drop.remainingStock,
    pickupDeadline: drop.pickupDeadline,
  });
  const collectible = status === 'active' && drop.remainingStock > 0;
  const dietaryTags = drop.dietaryTags.length ? drop.dietaryTags : ['unknown'];
  const allergenNote = drop.allergenNote.trim() || 'Unknown';

  if (visualState === 'depleted' || visualState === 'expired' || visualState === 'cancelled') {
    return (
      <AppScreen>
        <TerminalFoodDropState state={visualState} onBack={() => router.replace('/')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <Pressable accessibilityRole="button" onPress={() => router.back()}>
        <Text style={styles.backLink}>‹ Back</Text>
      </Pressable>
      <Image source={{ uri: drop.photoUrl }} style={styles.image} />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>FOODDROP DETAIL</Text>
        <Text style={styles.title}>{drop.title}</Text>
        <Text style={styles.venue}>{drop.venueName}{drop.buildingCode ? ` · ${drop.buildingCode}` : ''}</Text>
      </View>

      <View style={styles.statusCard}>
        <FoodDropStatusBadge state={visualState} />
        <Text style={styles.stock}>{Math.max(0, drop.remainingStock)} portions remaining</Text>
        <Text style={styles.detail}>Pickup deadline: {formatDeadline(drop.pickupDeadline)}</Text>
        <Text style={styles.detail}>{formatDistance(distanceMeters)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this food</Text>
        <Text style={styles.description}>{drop.description?.trim() || 'No additional description provided.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup instructions</Text>
        <Text style={styles.detail}>{drop.pickupInstructions?.trim() || 'Ask the host at the venue.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary and allergen information</Text>
        <Text style={styles.detail}>Dietary tags: {dietaryTags.join(' · ')}</Text>
        <Text style={styles.detail}>Allergens: {allergenNote}</Text>
      </View>

      <Text style={styles.safety}>
        Food safety reminder: collect promptly, follow the host’s handling instructions, and only take what you intend to consume.
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={!collectible}
        onPress={() => router.push({ pathname: '/scan', params: { foodDropId: drop.id } })}
        style={[styles.button, !collectible && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>{collectible ? 'Scan pickup QR' : 'Collection unavailable'}</Text>
      </Pressable>
      <Text style={styles.realtimeNote}>Stock and status update live while this screen is open.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  backLink: { color: colors.primaryDark, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  image: { width: '100%', height: 210, borderRadius: radii.lg, backgroundColor: colors.mint },
  header: { gap: spacing.xs },
  eyebrow: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: typeScale.display, fontWeight: '900' },
  venue: { color: colors.muted, fontSize: typeScale.bodyLarge },
  statusCard: { gap: spacing.xs, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.mint },
  stock: { color: colors.primaryDark, fontSize: typeScale.title, fontWeight: '900' },
  detail: { color: colors.muted, fontSize: typeScale.body, lineHeight: 22 },
  description: { color: colors.ink, fontSize: typeScale.bodyLarge, lineHeight: 24 },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  safety: { padding: spacing.lg, color: colors.primaryDark, lineHeight: 21, borderRadius: radii.md, backgroundColor: colors.peach },
  button: { alignItems: 'center', padding: spacing.lg, borderRadius: radii.pill, backgroundColor: colors.primary },
  buttonDisabled: { backgroundColor: colors.tabInactive },
  buttonText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  realtimeNote: { color: colors.muted, fontSize: typeScale.caption, textAlign: 'center' },
});
