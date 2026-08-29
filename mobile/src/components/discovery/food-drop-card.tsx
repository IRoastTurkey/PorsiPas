import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FoodDropStatusBadge, resolveFoodDropVisualState } from '@/components/polish';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { FoodDropSummary } from '@/domain/types';

type Props = { drop: FoodDropSummary; onPress: () => void };

function formatDeadline(value: string) {
  return new Intl.DateTimeFormat('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Singapore',
  }).format(new Date(value));
}

function timeRemaining(value: string) {
  const minutes = Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 60_000));
  if (minutes < 60) return `${minutes} min remaining`;
  const hours = Math.floor(minutes / 60);
  const leftoverMinutes = minutes % 60;
  return leftoverMinutes ? `${hours} hr ${leftoverMinutes} min remaining` : `${hours} hr remaining`;
}

function formatDistance(value: number | null) {
  if (value === null) return 'Default campus view';
  if (value < 1000) return `About ${Math.round(value)} m away`;
  return `About ${(value / 1000).toFixed(1)} km away`;
}

export function FoodDropCard({ drop, onPress }: Props) {
  const visualState = resolveFoodDropVisualState(drop);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${drop.title}, ${drop.remainingStock} portions left`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <Image source={{ uri: drop.photoUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{drop.title}</Text>
          <FoodDropStatusBadge compact state={visualState} />
        </View>
        <Text style={styles.venue}>{drop.venueName}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{drop.remainingStock} portions left</Text>
          <Text style={styles.meta}>Pickup by {formatDeadline(drop.pickupDeadline)}</Text>
          <Text style={visualState === 'near_expiry' ? styles.urgent : styles.meta}>
            {visualState === 'near_expiry' ? 'ENDING SOON · ' : ''}{timeRemaining(drop.pickupDeadline)}
          </Text>
        </View>
        <Text style={styles.distance}>{formatDistance(drop.distanceMeters)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface },
  cardPressed: { opacity: 0.75 },
  image: { width: 92, height: 92, borderRadius: radii.sm, backgroundColor: colors.mint },
  content: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  venue: { color: colors.muted, fontSize: typeScale.body },
  metaRow: { gap: 2 },
  meta: { color: colors.ink, fontSize: typeScale.caption, fontWeight: '700' },
  urgent: { color: colors.accent, fontSize: typeScale.caption, fontWeight: '900' },
  distance: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '800' },
});
