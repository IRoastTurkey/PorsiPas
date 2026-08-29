import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { FoodDrop } from '@/domain/types';
import { useAuth } from '@/features/auth/auth-provider';
import { foodDropHostService, foodDropReadService } from '@/features/food-drops/food-drop-service';

function formatDeadline(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function HostFoodDropScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { session } = useAuth();
  const [drop, setDrop] = useState<FoodDrop | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      setDrop(await foodDropReadService.getById(id));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not load this FoodDrop.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const runAction = async (action: () => Promise<FoodDrop>) => {
    try {
      setBusy(true);
      setError(null);
      setDrop(await action());
    } catch (nextError) {
      Alert.alert('Could not update FoodDrop', nextError instanceof Error ? nextError.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const adjustStock = (change: number) => {
    if (!drop) return;
    const nextStock = drop.remainingStock + change;
    if (nextStock < 0 || nextStock > drop.initialStock) return;
    const commit = () => void runAction(() => foodDropHostService.adjustStock(drop.id, nextStock, 'Host corrected physical stock'));
    if (nextStock === 0) {
      Alert.alert('Mark as depleted?', 'Zero stock ends this FoodDrop permanently in V1.', [
        { text: 'Keep live', style: 'cancel' },
        { text: 'Mark depleted', style: 'destructive', onPress: commit },
      ]);
      return;
    }
    commit();
  };

  const extend = () => {
    if (!drop) return;
    const base = Math.max(Date.now(), new Date(drop.pickupDeadline).getTime());
    void runAction(() => foodDropHostService.extendDeadline(drop.id, new Date(base + 30 * 60_000).toISOString()));
  };

  const cancel = () => {
    if (!drop) return;
    Alert.alert('Cancel this FoodDrop?', 'Rescuers will no longer be able to collect it. This cannot be undone.', [
      { text: 'Keep live', style: 'cancel' },
      { text: 'Cancel FoodDrop', style: 'destructive', onPress: () => void runAction(() => foodDropHostService.cancel(drop.id)) },
    ]);
  };

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  }

  if (error || !drop || drop.hostId !== session?.user.id) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyIcon}>🛰️</Text>
        <Text style={styles.title}>FoodDrop unavailable</Text>
        <Text style={styles.muted}>{error ?? 'Only the host can manage this FoodDrop.'}</Text>
        <Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Go back</Text></Pressable>
      </SafeAreaView>
    );
  }

  const isActive = drop.status === 'active';
  const isDraft = drop.status === 'draft';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable>
        <Image source={{ uri: drop.photoUrl }} style={styles.photo} />
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.eyebrow}>HOST CONTROL</Text>
            <Text style={styles.title}>{drop.title}</Text>
          </View>
          <View style={[styles.statusPill, !isActive && styles.statusPillEnded]}>
            <Text style={[styles.statusText, !isActive && styles.statusTextEnded]}>{drop.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.stockCard}>
          <Text style={styles.stockNumber}>{drop.remainingStock}</Text>
          <Text style={styles.stockLabel}>of {drop.initialStock} portions left</Text>
          {isActive ? (
            <View style={styles.stockControls}>
              <Pressable disabled={busy || drop.remainingStock <= 0} onPress={() => adjustStock(-1)} style={styles.circleButton}><Text style={styles.circleText}>−</Text></Pressable>
              <Text style={styles.muted}>Correct physical stock</Text>
              <Pressable disabled={busy || drop.remainingStock >= drop.initialStock} onPress={() => adjustStock(1)} style={styles.circleButton}><Text style={styles.circleText}>＋</Text></Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detail}>📍 {drop.venueName}{drop.buildingCode ? ` · ${drop.buildingCode}` : ''}</Text>
          <Text style={styles.detail}>⏳ Closes {formatDeadline(drop.pickupDeadline)}</Text>
          <Text style={styles.detail}>⚠️ Allergens: {drop.allergenNote}</Text>
          {drop.pickupInstructions ? <Text style={styles.detail}>🧭 {drop.pickupInstructions}</Text> : null}
        </View>

        {isActive ? (
          <>
            <Pressable disabled={busy} onPress={() => router.push({ pathname: '/host/food-drop/[id]/qr', params: { id: drop.id } })} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Display pickup QR</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={extend} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Extend deadline by 30 minutes</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={cancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel FoodDrop</Text>
            </Pressable>
          </>
        ) : isDraft ? (
          <>
            <View style={styles.endedCard}>
              <Text style={styles.endedTitle}>This draft is not visible yet.</Text>
              <Text style={styles.muted}>Try publishing again. Its QR will be created only after the server accepts it.</Text>
            </View>
            <Pressable disabled={busy} onPress={() => void runAction(() => foodDropHostService.publish(drop.id))} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Publish FoodDrop</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={cancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Discard draft</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.endedCard}>
            <Text style={styles.endedTitle}>This FoodDrop has ended.</Text>
            <Text style={styles.muted}>Terminal FoodDrops cannot be reopened in V1. Create a new one if more food becomes available.</Text>
          </View>
        )}
        {busy ? <ActivityIndicator color={colors.primary} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl, backgroundColor: colors.background },
  back: { color: colors.primary, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  photo: { width: '100%', height: 230, borderRadius: radii.lg, backgroundColor: colors.surfaceMuted },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleCopy: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.primary, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: typeScale.title, fontWeight: '900' },
  muted: { color: colors.muted, fontSize: typeScale.body, lineHeight: 21, textAlign: 'center' },
  emptyIcon: { fontSize: 44 },
  statusPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: colors.mint },
  statusPillEnded: { backgroundColor: colors.surfaceMuted },
  statusText: { color: colors.primaryDark, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  statusTextEnded: { color: colors.muted },
  stockCard: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.lavender },
  stockNumber: { color: colors.meteor, fontSize: 52, fontWeight: '900' },
  stockLabel: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '800' },
  stockControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.sm },
  circleButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.surface },
  circleText: { color: colors.meteor, fontSize: 24, fontWeight: '900' },
  detailsCard: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface },
  detail: { color: colors.ink, fontSize: typeScale.body, lineHeight: 22 },
  primaryButton: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.primary },
  primaryText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  secondaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, borderWidth: 1, borderColor: colors.primary, borderRadius: radii.pill, backgroundColor: colors.surface },
  secondaryText: { color: colors.primary, fontSize: typeScale.body, fontWeight: '900' },
  cancelButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#A33A35', fontSize: typeScale.body, fontWeight: '900' },
  endedCard: { gap: spacing.sm, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.surfaceMuted },
  endedTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900', textAlign: 'center' },
});
