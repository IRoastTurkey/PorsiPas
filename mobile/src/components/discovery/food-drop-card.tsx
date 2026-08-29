import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FoodDropSummary } from '@/domain/types';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

type Props = { drop: FoodDropSummary; onPress: () => void };

function formatDeadline(value: string) {
  return new Intl.DateTimeFormat('en-SG', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(value),
  );
}

export function FoodDropCard({ drop, onPress }: Props) {
  const lowStock = drop.remainingStock <= 3;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${drop.title}`} onPress={onPress} style={styles.card}>
      <Image source={{ uri: drop.photoUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{drop.title}</Text>
          {lowStock ? <Text style={styles.badge}>LOW STOCK</Text> : null}
        </View>
        <Text style={styles.venue}>{drop.venueName}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{drop.remainingStock} portions left</Text>
          <Text style={styles.meta}>Pickup by {formatDeadline(drop.pickupDeadline)}</Text>
        </View>
        <Text style={styles.distance}>
          {drop.distanceMeters === null ? 'Campus area view' : `${drop.distanceMeters} m away`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface },
  image: { width: 92, height: 92, borderRadius: radii.sm, backgroundColor: colors.mint },
  content: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  badge: { color: colors.primaryDark, fontSize: 10, fontWeight: '900' },
  venue: { color: colors.muted, fontSize: typeScale.body },
  metaRow: { gap: 2 },
  meta: { color: colors.ink, fontSize: typeScale.caption, fontWeight: '700' },
  distance: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '800' },
});
