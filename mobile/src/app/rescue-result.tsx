import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/app-screen';
import { RescueSuccess } from '@/components/polish';
import { EmptyState, OfflineState } from '@/components/states';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { CollectionResultCode } from '@/domain/types';
import { shareVerifiedRescue } from '@/features/engagement/share-rescue';
import {
  clearLastCollectionAttempt,
  getLastCollectionAttempt,
} from '@/features/collections/collection-result-store';

const resultCopy: Record<CollectionResultCode, { title: string; body: string }> = {
  success: {
    title: 'Meal rescued!',
    body: 'The server verified your collection and reduced live stock by exactly one.',
  },
  invalid_qr: {
    title: 'That is not a valid PorsiPas QR',
    body: 'Ask the host for the active FoodDrop QR, then try scanning again.',
  },
  duplicate_collection: {
    title: 'You already collected from this FoodDrop',
    body: 'Each person may collect one portion from a FoodDrop in V1. Stock was not changed again.',
  },
  depleted: {
    title: 'This FoodDrop is depleted',
    body: 'No portions remain, so the server did not create a collection.',
  },
  expired: {
    title: 'The pickup window has ended',
    body: 'This FoodDrop is expired and cannot be collected.',
  },
  cancelled: {
    title: 'This FoodDrop was cancelled',
    body: 'The host ended this FoodDrop, so no collection was recorded.',
  },
  unauthenticated: {
    title: 'Sign-in is required',
    body: 'PorsiPas could not verify your device identity. Return to the app and retry after authentication recovers.',
  },
  offline: {
    title: 'You appear to be offline',
    body: 'The server could not be reached. No success is being claimed; reconnect and scan again.',
  },
  server_error: {
    title: 'Verification is temporarily unavailable',
    body: 'The server could not complete this request. No confirmed collection is being shown. Please try again.',
  },
};

export default function RescueResultScreen() {
  const router = useRouter();
  const attempt = useMemo(() => getLastCollectionAttempt(), []);

  if (!attempt) {
    return (
      <AppScreen>
        <EmptyState
          description="Start from an active FoodDrop and scan its host QR."
          primaryAction={{ label: 'Back to discovery', onPress: () => router.replace('/') }}
          title="No recent scan result"
        />
      </AppScreen>
    );
  }

  const { result, sourceFoodDropId } = attempt;
  const copy = resultCopy[result.code];
  const foodDropId = result.foodDropId ?? sourceFoodDropId;
  const retryable = result.code === 'invalid_qr' || result.code === 'offline' || result.code === 'server_error';

  const leaveFor = (path: 'discovery' | 'detail' | 'retry') => {
    clearLastCollectionAttempt();
    if (path === 'retry' && foodDropId) {
      router.replace({ pathname: '/scan', params: { foodDropId } });
    } else if (path === 'detail' && foodDropId) {
      router.replace({ pathname: '/food-drop/[id]', params: { id: foodDropId } });
    } else {
      router.replace('/');
    }
  };

  if (result.code === 'success') {
    return (
      <AppScreen>
        <RescueSuccess
          onDone={() => leaveFor('discovery')}
          onShare={() => shareVerifiedRescue(result)}
          onViewProfile={() => {
            clearLastCollectionAttempt();
            router.replace('/profile');
          }}
          result={result}
        />
      </AppScreen>
    );
  }

  if (result.code === 'offline') {
    return (
      <AppScreen>
        <OfflineState
          onRetry={() => leaveFor('retry')}
          secondaryAction={{ label: 'Back to discovery', onPress: () => leaveFor('discovery') }}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <Text style={styles.eyebrow}>COLLECTION NOT COMPLETED</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <View style={[styles.resultCard, styles.failureCard]}>
        <Text accessibilityLiveRegion="polite" style={styles.resultCode}>{result.code.replaceAll('_', ' ').toUpperCase()}</Text>
        <Text style={styles.body}>{copy.body}</Text>
      </View>

      {retryable && foodDropId ? (
        <Pressable accessibilityRole="button" onPress={() => leaveFor('retry')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Try scanning again</Text>
        </Pressable>
      ) : null}
      {foodDropId ? (
        <Pressable accessibilityRole="button" onPress={() => leaveFor('detail')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>View FoodDrop</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => leaveFor('discovery')}>
        <Text style={styles.discoveryLink}>Back to discovery</Text>
      </Pressable>
      <Text style={styles.note}>Points and streaks change only after the server confirms a rescue.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: typeScale.display, fontWeight: '900' },
  resultCard: { gap: spacing.md, padding: spacing.xl, borderRadius: radii.lg },
  failureCard: { backgroundColor: colors.peach },
  resultCode: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 0.7 },
  body: { color: colors.muted, fontSize: typeScale.bodyLarge, lineHeight: 24 },
  primaryButton: { alignItems: 'center', padding: spacing.lg, borderRadius: radii.pill, backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', padding: spacing.lg, borderRadius: radii.pill, backgroundColor: colors.lavender },
  secondaryButtonText: { color: colors.ink, fontWeight: '900' },
  discoveryLink: { color: colors.primaryDark, fontSize: typeScale.bodyLarge, fontWeight: '900', textAlign: 'center', textDecorationLine: 'underline' },
  note: { color: colors.muted, fontSize: typeScale.caption, textAlign: 'center' },
});
