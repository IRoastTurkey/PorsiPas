import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { AppScreen } from '@/components/app-screen';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

export default function RescueResultScreen() {
  const router = useRouter();
  return <AppScreen><Text style={styles.eyebrow}>RESCUE RESULT</Text><Text style={styles.title}>Your result will appear here</Text><Text style={styles.body}>Success and classified server responses will use this route after the real Phase 2 collection service is connected.</Text><Text style={styles.notice}>DEVELOPMENT PREVIEW · NO LIVE COLLECTION</Text><Pressable onPress={() => router.replace('/')} style={styles.button}><Text style={styles.buttonText}>Back to discovery</Text></Pressable></AppScreen>;
}
const styles = StyleSheet.create({ eyebrow: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1 }, title: { color: colors.ink, fontSize: typeScale.display, fontWeight: '900', marginTop: spacing.sm }, body: { color: colors.muted, fontSize: typeScale.bodyLarge, lineHeight: 24, marginTop: spacing.lg }, notice: { color: colors.muted, padding: spacing.lg, marginTop: spacing.xl, borderRadius: radii.md, backgroundColor: colors.lavender, fontWeight: '800' }, button: { alignItems: 'center', padding: spacing.lg, marginTop: spacing.xl, borderRadius: radii.pill, backgroundColor: colors.primary }, buttonText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' }, });
