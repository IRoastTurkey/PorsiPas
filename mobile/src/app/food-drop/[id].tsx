import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import { FoodDrop } from '@/domain/types';
import { mockFoodDropReadService } from '@/services/food-drops/mock-service';

export default function FoodDropDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [drop, setDrop] = useState<FoodDrop | null>(null);

  useEffect(() => { if (id) void mockFoodDropReadService.getById(id).then(setDrop); }, [id]);

  if (!drop) return <AppScreen><Text style={styles.message}>FoodDrop not found.</Text></AppScreen>;
  const collectible = drop.status === 'active' && drop.remainingStock > 0 && new Date(drop.pickupDeadline) > new Date();

  return <AppScreen>
    <Image source={{ uri: drop.photoUrl }} style={styles.image} />
    <View style={styles.header}><Text style={styles.eyebrow}>FOODDROP DETAIL</Text><Text style={styles.title}>{drop.title}</Text><Text style={styles.venue}>{drop.venueName}</Text></View>
    <View style={styles.card}><Text style={styles.stock}>{drop.remainingStock} portions remaining</Text><Text style={styles.detail}>Pickup by {new Date(drop.pickupDeadline).toLocaleString('en-SG')}</Text><Text style={styles.detail}>Status: {drop.status}</Text></View>
    <Text style={styles.description}>{drop.description}</Text>
    <Text style={styles.sectionTitle}>Pickup instructions</Text><Text style={styles.detail}>{drop.pickupInstructions ?? 'Ask the host at the venue.'}</Text>
    <Text style={styles.sectionTitle}>Dietary and allergen information</Text><Text style={styles.detail}>{drop.dietaryTags.join(' · ')} · {drop.allergenNote}</Text>
    <Text style={styles.safety}>Food safety reminder: collect promptly and follow the host’s handling instructions.</Text>
    <Pressable disabled={!collectible} onPress={() => router.push({ pathname: '/scan', params: { foodDropId: drop.id } })} style={[styles.button, !collectible && styles.buttonDisabled]}><Text style={styles.buttonText}>{collectible ? 'Scan pickup QR' : 'Collection unavailable'}</Text></Pressable>
  </AppScreen>;
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 210, borderRadius: radii.lg, backgroundColor: colors.mint },
  header: { gap: spacing.xs }, eyebrow: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1 }, title: { color: colors.ink, fontSize: typeScale.display, fontWeight: '900' }, venue: { color: colors.muted, fontSize: typeScale.bodyLarge }, card: { gap: spacing.xs, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.mint }, stock: { color: colors.primaryDark, fontSize: typeScale.title, fontWeight: '900' }, detail: { color: colors.muted, fontSize: typeScale.body, lineHeight: 22 }, description: { color: colors.ink, fontSize: typeScale.bodyLarge, lineHeight: 24 }, sectionTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' }, safety: { padding: spacing.lg, color: colors.primaryDark, lineHeight: 21, borderRadius: radii.md, backgroundColor: colors.peach }, button: { alignItems: 'center', padding: spacing.lg, borderRadius: radii.pill, backgroundColor: colors.primary }, buttonDisabled: { backgroundColor: colors.tabInactive }, buttonText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' }, message: { color: colors.muted, fontSize: typeScale.bodyLarge },
});
