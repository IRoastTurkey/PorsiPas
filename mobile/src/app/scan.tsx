import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/app-screen';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

export default function ScanScreen() {
  const router = useRouter();
  const { foodDropId } = useLocalSearchParams<{ foodDropId?: string }>();
  return <AppScreen><View style={styles.header}><Text style={styles.eyebrow}>VERIFIED COLLECTION</Text><Text style={styles.title}>Scan the pickup QR</Text><Text style={styles.description}>Camera access will be used to read the venue’s opaque collection token. The server verifies the token and stock.</Text></View><View style={styles.preview}><Text style={styles.previewText}>Camera scanner will be connected here.</Text><Text style={styles.mock}>DEVELOPMENT PLACEHOLDER · NO COLLECTION PERFORMED</Text></View><Pressable onPress={() => router.back()} style={styles.secondary}><Text style={styles.secondaryText}>Back to FoodDrop</Text></Pressable><Text style={styles.context}>FoodDrop: {foodDropId ?? 'not selected'}</Text></AppScreen>;
}
const styles = StyleSheet.create({ header: { gap: spacing.sm }, eyebrow: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1 }, title: { color: colors.ink, fontSize: typeScale.display, fontWeight: '900' }, description: { color: colors.muted, fontSize: typeScale.bodyLarge, lineHeight: 24 }, preview: { height: 300, alignItems: 'center', justifyContent: 'center', gap: spacing.md, borderWidth: 2, borderColor: colors.primary, borderRadius: radii.lg, backgroundColor: colors.mint }, previewText: { color: colors.primaryDark, fontSize: typeScale.bodyLarge, fontWeight: '800' }, mock: { color: colors.muted, fontSize: typeScale.caption, textAlign: 'center' }, secondary: { alignItems: 'center', padding: spacing.lg, borderRadius: radii.pill, backgroundColor: colors.lavender }, secondaryText: { color: colors.ink, fontWeight: '900' }, context: { color: colors.muted, fontSize: typeScale.caption }, });
