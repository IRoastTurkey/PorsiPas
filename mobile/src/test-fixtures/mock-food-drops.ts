import { FoodDrop, FoodDropSummary } from '@/domain/types';

const mockPhoto =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80';

export const mockFoodDrops: FoodDrop[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    hostId: '99999999-9999-4999-8999-999999999999',
    title: 'Vegetable rice bowls',
    description: 'Fresh surplus bowls prepared for today’s campus event.',
    photoUrl: mockPhoto,
    initialStock: 12,
    remainingStock: 3,
    venueName: 'Student Commons',
    buildingCode: 'SC-01',
    latitude: 1.2966,
    longitude: 103.7764,
    pickupInstructions: 'Collect from the welcome desk beside the main entrance.',
    pickupDeadline: '2026-08-30T14:00:00+08:00',
    dietaryTags: ['halal', 'vegetarian'],
    allergenNote: 'Contains sesame. Ask the host about other allergens.',
    status: 'active',
    createdAt: '2026-08-29T12:00:00+08:00',
    updatedAt: '2026-08-29T12:00:00+08:00',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    hostId: '99999999-9999-4999-8999-999999999999',
    title: 'Fruit and yoghurt cups',
    description: 'Chilled cups remaining from the morning workshop.',
    photoUrl: mockPhoto,
    initialStock: 8,
    remainingStock: 6,
    venueName: 'Innovation Hall',
    buildingCode: 'IH-02',
    latitude: 1.2981,
    longitude: 103.7758,
    pickupInstructions: 'Use the side entrance and follow the FoodDrop sign.',
    pickupDeadline: '2026-08-30T16:30:00+08:00',
    dietaryTags: ['vegetarian'],
    allergenNote: 'Contains dairy. Allergen information may be incomplete.',
    status: 'active',
    createdAt: '2026-08-29T12:15:00+08:00',
    updatedAt: '2026-08-29T12:15:00+08:00',
  },
];

function distanceMeters(
  origin: { latitude: number; longitude: number } | undefined,
  drop: FoodDrop,
): number | null {
  if (!origin) return null;
  const latitudeDelta = ((drop.latitude - origin.latitude) * Math.PI) / 180;
  const longitudeDelta = ((drop.longitude - origin.longitude) * Math.PI) / 180;
  const meanLatitude = ((drop.latitude + origin.latitude) / 2) * (Math.PI / 180);
  return Math.round(
    Math.sqrt(
      (latitudeDelta * 6_371_000) ** 2 +
        (longitudeDelta * 6_371_000 * Math.cos(meanLatitude)) ** 2,
    ),
  );
}

export function listMockActiveFoodDrops(
  origin?: { latitude: number; longitude: number },
): FoodDropSummary[] {
  const now = new Date();
  return mockFoodDrops
    .filter(
      (drop) =>
        drop.status === 'active' &&
        drop.remainingStock > 0 &&
        new Date(drop.pickupDeadline).getTime() > now.getTime(),
    )
    .map((drop) => ({
      id: drop.id,
      title: drop.title,
      photoUrl: drop.photoUrl,
      venueName: drop.venueName,
      latitude: drop.latitude,
      longitude: drop.longitude,
      remainingStock: drop.remainingStock,
      pickupDeadline: drop.pickupDeadline,
      dietaryTags: drop.dietaryTags,
      status: drop.status,
      distanceMeters: distanceMeters(origin, drop),
    }))
    .sort((a, b) => {
      if (a.distanceMeters === null || b.distanceMeters === null) return 0;
      return a.distanceMeters - b.distanceMeters;
    });
}
