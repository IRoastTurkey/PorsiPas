import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import * as ExpoLinking from 'expo-linking';
import { AppState } from 'react-native';

import type { AlertDelivery } from '@/domain/types';
import { useAuth } from '@/features/auth/auth-provider';
import { foodDropReadService } from '@/features/food-drops/food-drop-service';
import {
  consumeLastNotificationResponse,
  getNotificationPermission,
  presentLocalFoodDropAlert,
  subscribeToNotificationResponses,
} from '@/features/alerts/notification-service';
import { alertDeliveryService } from '@/features/retention/retention-service';

export function AlertProvider({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const processing = useRef(new Set<string>());

  const processAlert = useCallback(async (alert: AlertDelivery) => {
    if (alert.presentedAt || processing.current.has(alert.id)) return;
    processing.current.add(alert.id);
    try {
      if ((await getNotificationPermission()) !== 'granted') return;
      const currentDrop = await foodDropReadService.getById(alert.foodDropId);
      const collectible =
        currentDrop?.status === 'active' &&
        currentDrop.remainingStock > 0 &&
        new Date(currentDrop.pickupDeadline).getTime() > Date.now();
      if (collectible && currentDrop) {
        await presentLocalFoodDropAlert({
          ...alert,
          title: currentDrop.title,
          venueName: currentDrop.venueName,
          remainingStock: currentDrop.remainingStock,
          pickupDeadline: currentDrop.pickupDeadline,
        });
      }
      await alertDeliveryService.markPresented(alert.id);
    } catch {
      // Leave the alert pending so a later foreground refresh can try again.
    } finally {
      processing.current.delete(alert.id);
    }
  }, []);

  const processPending = useCallback(async () => {
    if (status !== 'ready') return;
    try {
      const alerts = await alertDeliveryService.listMine(20);
      await Promise.all(alerts.filter((alert) => !alert.presentedAt).map(processAlert));
    } catch {
      // Alert delivery must never prevent the rest of PorsiPas from loading.
    }
  }, [processAlert, status]);

  useEffect(() => {
    if (status !== 'ready') return;
    void processPending();
    const unsubscribeRealtime = alertDeliveryService.subscribe((alert) => void processAlert(alert));
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void processPending();
    });
    return () => {
      unsubscribeRealtime();
      appStateSubscription.remove();
    };
  }, [processAlert, processPending, status]);

  useEffect(() => {
    if (status !== 'ready') return;
    const openResponse = ({ foodDropId, alertDeliveryId }: {
      foodDropId: string;
      alertDeliveryId: string | null;
    }) => {
        if (alertDeliveryId) void alertDeliveryService.markOpened(alertDeliveryId);
        void ExpoLinking.openURL(ExpoLinking.createURL(`/food-drop/${foodDropId}`));
    };
    void consumeLastNotificationResponse().then((data) => {
      if (data) openResponse(data);
    });
    return subscribeToNotificationResponses(openResponse);
  }, [status]);

  return children;
}
