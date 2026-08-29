import * as Location from 'expo-location';

export type LocationPoint = {
  latitude: number;
  longitude: number;
};

export type ForegroundLocationResult =
  | { status: 'granted'; origin: LocationPoint }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; message: string };

let approvedOrigin: LocationPoint | null = null;

export function getApprovedForegroundOrigin() {
  return approvedOrigin;
}

export function distanceBetweenMeters(first: LocationPoint, second: LocationPoint) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const firstLatitude = radians(first.latitude);
  const secondLatitude = radians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine)));
}

export async function requestForegroundOrigin(): Promise<ForegroundLocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { status: 'denied', canAskAgain: permission.canAskAgain };
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      return {
        status: 'unavailable',
        message: 'Turn on device location, then try again. You can still browse the campus list.',
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    approvedOrigin = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    return { status: 'granted', origin: approvedOrigin };
  } catch {
    return {
      status: 'unavailable',
      message: 'Your location is unavailable right now. You can still browse the campus list.',
    };
  }
}
