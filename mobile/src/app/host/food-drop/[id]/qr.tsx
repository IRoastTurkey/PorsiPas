import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing, typeScale } from '@/constants/theme';
import { foodDropHostService, foodDropReadService } from '@/features/food-drops/food-drop-service';

export default function HostQrScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [payload, setPayload] = useState<string | null>(null);
  const [title, setTitle] = useState('FoodDrop');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const drop = await foodDropReadService.getById(id);
      setTitle(drop?.title ?? 'FoodDrop');
      setPayload(await foodDropHostService.getQrPayload(id));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not load the pickup QR.');
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Manage</Text></Pressable>
        <Text style={styles.brand}>PORSIPAS</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <Text style={styles.meteor}>☄️</Text>
        <Text style={styles.title}>Scan to rescue</Text>
        <Text style={styles.dropTitle}>{title}</Text>
        <View style={styles.qrCard}>
          {payload ? (
            <QRCode value={payload} size={250} backgroundColor={colors.white} color={colors.ink} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <ActivityIndicator color={colors.primary} size="large" />
          )}
        </View>
        <Text style={styles.instructions}>Each signed-in rescuer scans once when collecting one portion. Stock updates automatically.</Text>
        {error ? <Pressable onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.meteor },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  back: { width: 80, color: colors.white, fontSize: typeScale.body, fontWeight: '900' },
  brand: { color: colors.peach, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1.5 },
  spacer: { width: 80 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  meteor: { fontSize: 46 },
  title: { color: colors.white, fontSize: typeScale.display, fontWeight: '900', textAlign: 'center' },
  dropTitle: { color: colors.peach, fontSize: typeScale.bodyLarge, fontWeight: '800', textAlign: 'center' },
  qrCard: { width: 290, height: 290, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg, padding: 20, borderRadius: radii.lg, backgroundColor: colors.white },
  instructions: { maxWidth: 340, color: 'rgba(255,255,255,0.85)', fontSize: typeScale.body, lineHeight: 22, textAlign: 'center' },
  error: { color: '#A33A35', fontSize: typeScale.body, lineHeight: 21, textAlign: 'center' },
  retry: { marginTop: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radii.pill, backgroundColor: colors.white },
  retryText: { color: colors.meteor, fontWeight: '900' },
});
