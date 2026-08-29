import * as Location from 'expo-location';

export type ForegroundPoint = {
  latitude: number;
  longitude: number;
  label: string;
};

export type ForegroundLocationResult =
  | { status: 'granted'; point: ForegroundPoint }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; message: string };

export const NUS_CAMPUS_FALLBACK: ForegroundPoint = {
  latitude: 1.2966,
  longitude: 103.7764,
  label: 'NUS campus centre',
};

export async function requestForegroundPoint(): Promise<ForegroundLocationResult> {
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (!permission.granted) {
      return { status: 'denied', canAskAgain: permission.canAskAgain };
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return { status: 'unavailable', message: 'Turn on device location and try again.' };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      status: 'granted',
      point: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: 'Last approved device location',
      },
    };
  } catch (error) {
    return {
      status: 'unavailable',
      message: error instanceof Error ? error.message : 'Location is unavailable right now.',
    };
  }
}
