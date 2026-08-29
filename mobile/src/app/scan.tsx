import { useCallback, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppScreen } from '@/components/app-screen';
import { LoadingState, PermissionState } from '@/components/states';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import { setLastCollectionAttempt } from '@/features/collections/collection-result-store';
import { collectionService } from '@/features/food-drops/food-drop-service';

export default function ScanScreen() {
  const router = useRouter();
  const { foodDropId } = useLocalSearchParams<{ foodDropId?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [pending, setPending] = useState(false);
  const scanLocked = useRef(false);

  const handleScan = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      if (scanLocked.current || pending) return;
      scanLocked.current = true;
      setPending(true);

      const result = await collectionService.collectByQrPayload(data);
      setLastCollectionAttempt({
        result,
        sourceFoodDropId: foodDropId ?? null,
      });
      router.replace('/rescue-result');
    },
    [foodDropId, pending, router],
  );

  if (!permission) {
    return (
      <AppScreen>
        <LoadingState
          description="Checking camera permission on this device."
          title="Preparing the scanner…"
        />
      </AppScreen>
    );
  }

  if (!permission.granted) {
    return (
      <AppScreen>
        <PermissionState
          fallbackAction={{ label: 'Cancel and go back', onPress: () => router.back() }}
          kind="camera"
          onOpenSettings={permission.canAskAgain ? undefined : () => void Linking.openSettings()}
          onRequestPermission={permission.canAskAgain ? () => void requestPermission() : undefined}
        />
      </AppScreen>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        accessibilityLabel="QR code scanner"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={pending ? undefined : handleScan}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.topPanel}>
          <Text style={styles.scannerTitle}>Scan the pickup QR</Text>
          <Text style={styles.scannerDescription}>
            Hold the host’s PorsiPas QR inside the frame. Collection is verified by the server.
          </Text>
        </View>
        <View accessibilityElementsHidden style={styles.scanFrame} />
        <View style={styles.bottomPanel}>
          <Text accessibilityLiveRegion="polite" style={styles.pendingText}>
            {pending ? 'Verifying collection… Please wait.' : 'Ready to scan one QR code'}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={pending}
            onPress={() => router.back()}
            style={[styles.cancelButton, pending && styles.disabledButton]}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  overlay: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.xxxl, backgroundColor: 'rgba(0, 0, 0, 0.34)' },
  topPanel: { gap: spacing.sm, padding: spacing.lg, borderRadius: radii.md, backgroundColor: 'rgba(20, 34, 27, 0.88)' },
  scannerTitle: { color: colors.white, fontSize: typeScale.title, fontWeight: '900' },
  scannerDescription: { color: colors.white, fontSize: typeScale.body, lineHeight: 21 },
  scanFrame: { alignSelf: 'center', width: 250, height: 250, borderWidth: 4, borderColor: colors.white, borderRadius: radii.lg, backgroundColor: 'transparent' },
  bottomPanel: { gap: spacing.md, padding: spacing.lg, borderRadius: radii.md, backgroundColor: 'rgba(20, 34, 27, 0.88)' },
  pendingText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900', textAlign: 'center' },
  cancelButton: { alignItems: 'center', padding: spacing.md, borderRadius: radii.pill, backgroundColor: colors.surface },
  cancelButtonText: { color: colors.ink, fontWeight: '900' },
  disabledButton: { opacity: 0.5 },
});
