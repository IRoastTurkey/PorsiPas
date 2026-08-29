import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { AlertDelivery } from '@/domain/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationPermissionResult = 'granted' | 'denied';

type NotificationRouteData = { foodDropId: string; alertDeliveryId: string | null };

function routeData(data: Record<string, unknown>): NotificationRouteData | null {
  if (typeof data.foodDropId !== 'string') return null;
  return {
    foodDropId: data.foodDropId,
    alertDeliveryId: typeof data.alertDeliveryId === 'string' ? data.alertDeliveryId : null,
  };
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('food-drops', {
    name: 'Nearby FoodDrops',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180, 100, 180],
    lightColor: '#2F7D57',
  });
}

export async function getNotificationPermission(): Promise<NotificationPermissionResult> {
  const permission = await Notifications.getPermissionsAsync();
  return permission.granted ? 'granted' : 'denied';
}

export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted ? 'granted' : 'denied';
}

export async function presentLocalFoodDropAlert(alert: AlertDelivery) {
  await ensureAndroidChannel();
  const pickupTime = new Intl.DateTimeFormat('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Singapore',
  }).format(new Date(alert.pickupDeadline));
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${alert.title} just landed`,
      body: `${alert.remainingStock} portions · ${alert.approximateDistanceMeters} m away · pickup by ${pickupTime}`,
      data: { foodDropId: alert.foodDropId, alertDeliveryId: alert.id },
    },
    trigger: null,
  });
}

export function subscribeToNotificationResponses(
  onResponse: (data: NotificationRouteData) => void,
) {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = routeData(response.notification.request.content.data);
    if (data) onResponse(data);
  });
  return () => subscription.remove();
}

export async function consumeLastNotificationResponse() {
  const response = await Notifications.getLastNotificationResponseAsync();
  if (!response) return null;
  const data = routeData(response.notification.request.content.data);
  await Notifications.clearLastNotificationResponseAsync();
  return data;
}
