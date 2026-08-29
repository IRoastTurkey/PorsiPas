import * as Location from 'expo-location';

export type LocationPoint = {
  latitude: number;
  longitude: number;
};

export type ForegroundPoint = LocationPoint & {
  label: string;
};

export type ForegroundLocationResult =
  | { status: 'granted'; origin: LocationPoint }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; message: string };

export type ForegroundPointResult =
  | { status: 'granted'; point: ForegroundPoint }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; message: string };

type CoordinateResult =
  | { status: 'granted'; point: LocationPoint }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; message: string };

export const NUS_CAMPUS_FALLBACK: ForegroundPoint = {
  latitude: 1.2966,
  longitude: 103.7764,
  label: 'NUS campus centre',
};

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

async function requestCoordinates(): Promise<CoordinateResult> {
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
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
    const point = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    approvedOrigin = point;
    return { status: 'granted', point };
  } catch (error) {
    return {
      status: 'unavailable',
      message:
        error instanceof Error
          ? error.message
          : 'Your location is unavailable right now. You can still browse the campus list.',
    };
  }
}

export async function requestForegroundOrigin(): Promise<ForegroundLocationResult> {
  const result = await requestCoordinates();
  if (result.status !== 'granted') return result;
  return { status: 'granted', origin: result.point };
}

export async function requestForegroundPoint(): Promise<ForegroundPointResult> {
  const result = await requestCoordinates();
  if (result.status !== 'granted') return result;
  return {
    status: 'granted',
    point: { ...result.point, label: 'Last approved device location' },
  };
}
