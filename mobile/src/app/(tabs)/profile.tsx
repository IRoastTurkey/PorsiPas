import { useCallback, useState } from 'react';
import * as ExpoLinking from 'expo-linking';
import { useFocusEffect } from 'expo-router';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { PageHeader } from '@/components/page-header';
import { StatTile } from '@/components/stat-tile';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { AlertDelivery, CollectionRecord, UserProfile, WatchZone } from '@/domain/types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  type NotificationPermissionResult,
} from '@/features/alerts/notification-service';
import {
  alertDeliveryService,
  retentionService,
  watchZoneService,
} from '@/features/retention/retention-service';
import {
  NUS_CAMPUS_FALLBACK,
  requestForegroundPoint,
  type ForegroundPoint,
} from '@/services/location/foreground-location';

const RADIUS_OPTIONS = [50, 250, 500, 1000, 2000];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Singapore',
  }).format(new Date(value));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [watchZone, setWatchZone] = useState<WatchZone | null>(null);
  const [history, setHistory] = useState<CollectionRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertDelivery[]>([]);
  const [meals, setMeals] = useState({ userMealsRescued: 0, totalMealsRescued: 0 });
  const [radius, setRadius] = useState(250);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionResult>('denied');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showSettingsAction, setShowSettingsAction] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus('loading');
      const [nextProfile, nextZone, nextHistory, nextMeals, nextAlerts, permission] =
        await Promise.all([
          retentionService.getMyProfile(),
          watchZoneService.getMine(),
          retentionService.listMyCollections(),
          retentionService.getVerifiedImpact(),
          alertDeliveryService.listMine(),
          getNotificationPermission(),
        ]);
      setProfile(nextProfile);
      setWatchZone(nextZone);
      setRadius(nextZone?.radiusMeters ?? 250);
      setHistory(nextHistory);
      setMeals(nextMeals);
      setAlerts(nextAlerts);
      setNotificationPermission(permission);
      setStatus('ready');
    } catch (error) {
      setNotice(errorMessage(error));
      setStatus('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function savePoint(point: ForegroundPoint) {
    setBusy(true);
    setNotice(null);
    setShowSettingsAction(false);
    try {
      const saved = await watchZoneService.saveMine({
        centerLatitude: point.latitude,
        centerLongitude: point.longitude,
        radiusMeters: radius,
        label: point.label,
        enabled: true,
      });
      setWatchZone(saved);
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      setNotice(
        permission === 'granted'
          ? 'Watch area saved. Local FoodDrop alerts are enabled.'
          : 'Watch area saved. You will still see matched alerts in PorsiPas, but device notifications are off.',
      );
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function selectCurrentLocation() {
    setBusy(true);
    setNotice('Checking location while PorsiPas is open…');
    setShowSettingsAction(false);
    const result = await requestForegroundPoint();
    setBusy(false);
    if (result.status === 'granted') {
      await savePoint(result.point);
      return;
    }
    if (result.status === 'denied') {
      setNotice('Location permission is off. Choose the campus fallback or allow location in Settings.');
      setShowSettingsAction(!result.canAskAgain);
      return;
    }
    setNotice(result.message);
  }

  async function toggleAlerts(enabled: boolean) {
    if (!watchZone && enabled) {
      setNotice('Choose a watch point before enabling alerts.');
      return;
    }
    if (!watchZone) return;
    setBusy(true);
    setNotice(null);
    try {
      if (enabled) {
        const saved = await watchZoneService.saveMine({
          centerLatitude: watchZone.centerLatitude,
          centerLongitude: watchZone.centerLongitude,
          radiusMeters: radius,
          label: watchZone.label,
          enabled: true,
        });
        setWatchZone(saved);
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
        setNotice(
          permission === 'granted'
            ? 'Alerts enabled.'
            : 'In-app alerts enabled; device notifications remain off.',
        );
      } else {
        await watchZoneService.disableMine();
        setWatchZone({ ...watchZone, enabled: false });
        setNotice('Watch area disabled. Your saved point remains private and can be re-enabled.');
      }
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function changeRadius(nextRadius: number) {
    setRadius(nextRadius);
    if (!watchZone) return;
    setBusy(true);
    setNotice(null);
    try {
      const saved = await watchZoneService.saveMine({
        centerLatitude: watchZone.centerLatitude,
        centerLongitude: watchZone.centerLongitude,
        radiusMeters: nextRadius,
        label: watchZone.label,
        enabled: watchZone.enabled,
      });
      setWatchZone(saved);
      setNotice(`Alert radius updated to ${nextRadius} metres.`);
    } catch (error) {
      setRadius(watchZone.radiusMeters);
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function deleteWatchZone() {
    setBusy(true);
    setNotice(null);
    try {
      await watchZoneService.deleteMine();
      setWatchZone(null);
      setRadius(250);
      setNotice('Saved watch area deleted.');
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function openAlert(alert: AlertDelivery) {
    try {
      await alertDeliveryService.markOpened(alert.id);
    } catch {
      // Navigation remains useful even if the read receipt cannot be saved.
    }
    await ExpoLinking.openURL(ExpoLinking.createURL(`/food-drop/${alert.foodDropId}`));
  }

  return (
    <AppScreen>
      <PageHeader
        eyebrow="Your impact"
        title="Build a rescue habit"
        description="Your verified rescues, private alert preferences, and weekly progress live here."
      />

      {status === 'loading' ? (
        <View style={styles.messageCard}>
          <Text style={styles.cardTitle}>Loading your verified impact…</Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.errorCard}>
          <Text style={styles.cardTitle}>We could not load your profile</Text>
          <Text style={styles.muted}>{notice}</Text>
          <ActionButton label="Try again" onPress={() => void load()} />
        </View>
      ) : null}

      {profile ? (
        <>
          <View style={styles.identityCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{profile.displayName}</Text>
              <Text style={styles.note}>This profile and its rescue history are private to you.</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatTile label="Rescue points" value={String(profile.pointsTotal)} />
            <StatTile label="Week streak" value={`${profile.currentStreak} weeks`} />
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.cardTitle}>FoodDrop alerts</Text>
                <Text style={styles.muted}>Match new drops against one point you approved.</Text>
              </View>
              <Switch
                accessibilityLabel="FoodDrop alerts"
                disabled={busy || !watchZone}
                onValueChange={(enabled) => void toggleAlerts(enabled)}
                thumbColor={watchZone?.enabled ? colors.primary : colors.muted}
                trackColor={{ false: colors.border, true: colors.mint }}
                value={watchZone?.enabled ?? false}
              />
            </View>

            <View style={styles.privacyCard}>
              <Text style={styles.privacyTitle}>Foreground only</Text>
              <Text style={styles.note}>
                PorsiPas stores only this last approved watch point. It does not track movement in the background or show your coordinates to hosts.
              </Text>
            </View>

            <Text style={styles.savedPoint}>
              Saved watch point: {watchZone?.label ?? 'None selected'}
            </Text>
            {watchZone ? (
              <Text style={styles.note}>Last refreshed {formatDateTime(watchZone.refreshedAt)}</Text>
            ) : null}

            <View style={styles.buttonRow}>
              <ActionButton
                disabled={busy}
                label={busy ? 'Please wait…' : 'Use current location'}
                onPress={() => void selectCurrentLocation()}
              />
              <ActionButton
                disabled={busy}
                label="Use NUS campus fallback"
                onPress={() => void savePoint(NUS_CAMPUS_FALLBACK)}
                secondary
              />
            </View>
            {showSettingsAction ? (
              <ActionButton label="Open device settings" onPress={() => void Linking.openSettings()} secondary />
            ) : null}

            <Text style={styles.label}>Alert radius: {radius} m</Text>
            <View style={styles.options}>
              {RADIUS_OPTIONS.map((option) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: busy, selected: radius === option }}
                  disabled={busy}
                  key={option}
                  onPress={() => void changeRadius(option)}
                  style={[styles.option, radius === option && styles.selectedOption]}>
                  <Text style={[styles.optionText, radius === option && styles.selectedText]}>
                    {option >= 1000 ? `${option / 1000} km` : `${option} m`}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.note}>
              Device notifications: {notificationPermission === 'granted' ? 'allowed' : 'not allowed'}. In-app matched alerts remain available below.
            </Text>
            <Text style={styles.baselineNote}>
              Hackathon baseline: local/foreground and in-app alerts. Closed-app remote push is deferred.
            </Text>

            {watchZone ? (
              <ActionButton
                disabled={busy}
                label="Delete saved watch area"
                onPress={() => void deleteWatchZone()}
                secondary
              />
            ) : null}
          </View>

          {notice ? (
            <View accessibilityLiveRegion="polite" style={styles.noticeCard}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.impactCard}>
            <Text style={styles.cardTitle}>Verified impact</Text>
            <View style={styles.statsRow}>
              <StatTile label="Your meals rescued" value={String(meals.userMealsRescued)} />
              <StatTile label="Prototype total" value={String(meals.totalMealsRescued)} />
            </View>
            <Text style={styles.note}>
              Counted from successful server-verified collections. One collected portion equals one rescued meal.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Matched FoodDrop alerts</Text>
            {alerts.length === 0 ? (
              <Text style={styles.muted}>No FoodDrops have matched your saved watch area yet.</Text>
            ) : (
              alerts.map((alert) => (
                <Pressable
                  accessibilityHint="Opens the latest FoodDrop details"
                  accessibilityRole="button"
                  key={alert.id}
                  onPress={() => void openAlert(alert)}
                  style={({ pressed }) => [styles.historyRow, pressed && styles.pressedButton]}>
                  <View style={styles.copy}>
                    <Text style={styles.historyTitle}>{alert.title}</Text>
                    <Text style={styles.muted}>
                      {alert.venueName} · about {alert.approximateDistanceMeters} m away
                    </Text>
                    <Text style={styles.note}>
                      {alert.remainingStock} portions when matched · pickup by {formatDateTime(alert.pickupDeadline)}
                    </Text>
                  </View>
                  <Text style={styles.openLabel}>Open</Text>
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rescue history</Text>
            {history.length === 0 ? (
              <Text style={styles.muted}>Your verified rescues will appear here.</Text>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.historyRow}>
                  <View style={styles.copy}>
                    <Text style={styles.historyTitle}>{item.title}</Text>
                    <Text style={styles.muted}>
                      {item.venueName} · {formatDateTime(item.verifiedAt)}
                    </Text>
                  </View>
                  <Text style={styles.points}>+{item.pointsAwarded}</Text>
                </View>
              ))
            )}
          </View>

          <ActionButton label="Refresh profile" onPress={() => void load()} secondary />
        </>
      ) : null}
    </AppScreen>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
};

function ActionButton({ label, onPress, secondary = false, disabled = false }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        secondary && styles.secondaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}>
      <Text style={[styles.actionText, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  avatarText: { color: colors.white, fontSize: typeScale.title, fontWeight: '900' },
  copy: { flex: 1, gap: spacing.xs },
  name: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  impactCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.mint },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  muted: { color: colors.muted, fontSize: typeScale.body, lineHeight: 21 },
  savedPoint: { color: colors.primaryDark, fontSize: typeScale.body, fontWeight: '900' },
  note: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18 },
  label: { color: colors.ink, fontSize: typeScale.body, fontWeight: '800' },
  privacyCard: { gap: spacing.xs, padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.mint },
  privacyTitle: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '900' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    minHeight: 44,
    minWidth: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
  },
  selectedOption: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { color: colors.muted, fontWeight: '800' },
  selectedText: { color: colors.white },
  buttonRow: { gap: spacing.sm },
  actionButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  secondaryButton: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  disabledButton: { opacity: 0.5 },
  pressedButton: { opacity: 0.78 },
  actionText: { color: colors.white, fontSize: typeScale.body, fontWeight: '900' },
  secondaryText: { color: colors.primaryDark },
  baselineNote: {
    padding: spacing.md,
    color: colors.meteor,
    fontSize: typeScale.caption,
    fontWeight: '800',
    lineHeight: 18,
    borderRadius: radii.sm,
    backgroundColor: colors.lavender,
  },
  noticeCard: { padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.peach },
  noticeText: { color: colors.ink, fontSize: typeScale.body, lineHeight: 21 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyTitle: { color: colors.ink, fontSize: typeScale.body, fontWeight: '800' },
  points: { color: colors.primary, fontSize: typeScale.body, fontWeight: '900' },
  openLabel: { color: colors.primaryDark, fontSize: typeScale.caption, fontWeight: '900' },
  messageCard: { padding: spacing.xl, borderRadius: radii.md, backgroundColor: colors.surface },
  errorCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.peach },
});
