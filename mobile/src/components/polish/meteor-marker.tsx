import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  FoodDropVisualState,
  getFoodDropStatusLabel,
} from '@/components/polish/food-drop-status';
import { useReducedMotion } from '@/components/polish/use-reduced-motion';
import { colors, radii, spacing } from '@/constants/theme';

type MeteorMarkerProps = {
  title: string;
  remainingStock: number;
  state?: FoodDropVisualState;
  selected?: boolean;
  onPress?: () => void;
};

export function MeteorMarker({
  title,
  remainingStock,
  state = 'active',
  selected = false,
  onPress,
}: MeteorMarkerProps) {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(selected ? 1.12 : 1)).current;
  const statusLabel = getFoodDropStatusLabel(state);

  useEffect(() => {
    const animation = Animated.spring(scale, {
      toValue: selected && !reduceMotion ? 1.12 : 1,
      speed: 24,
      bounciness: reduceMotion ? 0 : 5,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reduceMotion, scale, selected]);

  return (
    <Pressable
      accessibilityHint="Opens this FoodDrop"
      accessibilityLabel={`${title}. ${statusLabel}. ${remainingStock} portions remaining.`}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}>
      <Animated.View
        style={[
          styles.touchTarget,
          { transform: [{ scale }] },
          selected && styles.selectedTarget,
        ]}>
        <View style={[styles.tail, styles[`${state}Tail`]]} />
        <View style={[styles.meteor, styles[`${state}Meteor`]]}>
          <Text style={styles.symbol}>☄</Text>
        </View>
        {(state === 'low_stock' || state === 'near_expiry') && (
          <View style={[styles.signal, styles[`${state}Signal`]]}>
            <Text style={styles.signalText}>{state === 'low_stock' ? remainingStock : '◷'}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTarget: {
    shadowColor: colors.meteor,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  tail: {
    position: 'absolute',
    width: 30,
    height: 14,
    left: 2,
    top: 8,
    borderRadius: radii.pill,
    transform: [{ rotate: '-42deg' }],
  },
  meteor: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.meteor,
  },
  symbol: { color: colors.white, fontSize: 25, fontWeight: '900', lineHeight: 28 },
  signal: {
    position: 'absolute',
    right: -2,
    top: -2,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: radii.pill,
  },
  signalText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  activeMeteor: { borderColor: colors.primaryDark, backgroundColor: colors.meteor },
  activeTail: { backgroundColor: colors.lavender },
  low_stockMeteor: { borderColor: '#873D1B', backgroundColor: colors.accent },
  low_stockTail: { backgroundColor: colors.peach },
  low_stockSignal: { backgroundColor: '#873D1B' },
  near_expiryMeteor: { borderColor: colors.meteor, backgroundColor: colors.primary },
  near_expiryTail: { backgroundColor: colors.lavender },
  near_expirySignal: { backgroundColor: colors.meteor },
  depletedMeteor: { borderColor: colors.muted, backgroundColor: colors.tabInactive },
  depletedTail: { backgroundColor: colors.surfaceMuted },
  expiredMeteor: { borderColor: colors.muted, backgroundColor: colors.tabInactive },
  expiredTail: { backgroundColor: colors.surfaceMuted },
  cancelledMeteor: { borderColor: '#8B2E2A', backgroundColor: '#B95D58' },
  cancelledTail: { backgroundColor: '#FCE7E5' },
});
