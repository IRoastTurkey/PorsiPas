import { StatePanel, type StateAction } from '@/components/states/state-panel';

export type PermissionKind = 'location' | 'camera' | 'notifications';

type PermissionStateProps = {
  kind: PermissionKind;
  onRequestPermission?: () => void;
  onOpenSettings?: () => void;
  fallbackAction?: StateAction;
};

const COPY: Record<PermissionKind, { title: string; description: string; action: string; symbol: string }> = {
  location: {
    title: 'Choose how to find nearby food',
    description: 'Location lets PorsiPas sort FoodDrops by distance while the app is open. It is not continuously tracked in the background.',
    action: 'Allow location',
    symbol: '⌖',
  },
  camera: {
    title: 'Camera access is needed to scan',
    description: 'PorsiPas uses the camera only while you scan a FoodDrop QR code. A rescue is not recorded until the server confirms it.',
    action: 'Allow camera',
    symbol: '▣',
  },
  notifications: {
    title: 'Stay close to new rescues',
    description: 'Notifications can alert you to FoodDrops you care about. You can still browse and rescue food without enabling them.',
    action: 'Allow notifications',
    symbol: '◉',
  },
};

export function PermissionState({
  kind,
  onRequestPermission,
  onOpenSettings,
  fallbackAction,
}: PermissionStateProps) {
  const copy = COPY[kind];
  const primaryAction = onRequestPermission
    ? { label: copy.action, onPress: onRequestPermission }
    : onOpenSettings
      ? { label: 'Open settings', onPress: onOpenSettings }
      : undefined;

  return (
    <StatePanel
      description={copy.description}
      primaryAction={primaryAction}
      secondaryAction={fallbackAction}
      symbol={copy.symbol}
      title={copy.title}
    />
  );
}
