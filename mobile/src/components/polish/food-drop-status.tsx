import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { FoodDropStatus } from '@/domain/types';

export const LOW_STOCK_THRESHOLD = 3;
export const NEAR_EXPIRY_THRESHOLD_MS = 20 * 60 * 1000;

export type FoodDropVisualState =
  | 'active'
  | 'low_stock'
  | 'near_expiry'
  | 'depleted'
  | 'expired'
  | 'cancelled';

const STATUS_COPY: Record<FoodDropVisualState, { icon: string; label: string }> = {
  active: { icon: '●', label: 'Active' },
  low_stock: { icon: '!', label: 'Low stock' },
  near_expiry: { icon: '◷', label: 'Ending soon' },
  depleted: { icon: '×', label: 'Depleted' },
  expired: { icon: '◷', label: 'Expired' },
  cancelled: { icon: '×', label: 'Cancelled' },
};

type ResolveFoodDropVisualStateInput = {
  status: FoodDropStatus;
  remainingStock: number;
  pickupDeadline: string;
  now?: number;
};

export function resolveFoodDropVisualState({
  status,
  remainingStock,
  pickupDeadline,
  now = Date.now(),
}: ResolveFoodDropVisualStateInput): FoodDropVisualState {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'depleted' || remainingStock <= 0) return 'depleted';
  if (status === 'expired' || new Date(pickupDeadline).getTime() <= now) return 'expired';
  if (remainingStock <= LOW_STOCK_THRESHOLD) return 'low_stock';
  if (new Date(pickupDeadline).getTime() - now <= NEAR_EXPIRY_THRESHOLD_MS) {
    return 'near_expiry';
  }
  return 'active';
}

export function getFoodDropStatusLabel(state: FoodDropVisualState) {
  return STATUS_COPY[state].label;
}

type FoodDropStatusBadgeProps = {
  state: FoodDropVisualState;
  compact?: boolean;
};

export function FoodDropStatusBadge({ state, compact = false }: FoodDropStatusBadgeProps) {
  const copy = STATUS_COPY[state];
  return (
    <View
      accessibilityLabel={`FoodDrop status: ${copy.label}`}
      style={[styles.badge, styles[`${state}Badge`], compact && styles.badgeCompact]}>
      <Text style={[styles.icon, styles[`${state}Text`]]}>{copy.icon}</Text>
      <Text style={[styles.label, styles[`${state}Text`]]}>{copy.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.pill,
  },
  badgeCompact: { minHeight: 26, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  icon: { fontSize: typeScale.caption, fontWeight: '900' },
  label: { fontSize: typeScale.caption, fontWeight: '900' },
  activeBadge: { borderColor: colors.primary, backgroundColor: colors.mint },
  activeText: { color: colors.primaryDark },
  low_stockBadge: { borderColor: '#B85E2D', backgroundColor: colors.peach },
  low_stockText: { color: '#873D1B' },
  near_expiryBadge: { borderColor: colors.meteor, backgroundColor: colors.lavender },
  near_expiryText: { color: colors.meteor },
  depletedBadge: { borderColor: colors.muted, backgroundColor: colors.surfaceMuted },
  depletedText: { color: colors.ink },
  expiredBadge: { borderColor: colors.muted, backgroundColor: colors.surfaceMuted },
  expiredText: { color: colors.ink },
  cancelledBadge: { borderColor: '#A33A35', backgroundColor: '#FCE7E5' },
  cancelledText: { color: '#8B2E2A' },
});
