import { RetentionService, WatchZone, WatchZoneService } from '@/domain/retention';

// DEVELOPMENT MOCK: replace this composition boundary with Supabase adapters after upstream services merge.
const mockProfile = {
  id: 'mock-user', displayName: 'Rescue learner', pointsTotal: 300, currentStreak: 2,
  lastQualifiedRescueAt: '2026-08-28T10:00:00.000Z', createdAt: '2026-08-01T10:00:00.000Z',
};

let mockWatchZone: WatchZone | null = {
  id: 'mock-watch-zone', userId: mockProfile.id, centerLatitude: 1.2966, centerLongitude: 103.7764,
  radiusMeters: 250, label: 'Campus canteen', expiresAt: null, enabled: true,
};

export const mockRetentionService: RetentionService = {
  async getMyProfile() { return mockProfile; },
  async listMyCollections() {
    return [{ id: 'mock-collection-1', foodDropId: 'mock-drop-1', userId: mockProfile.id,
      title: 'Vegetable rice bowls', venueName: 'North Hall', verifiedAt: '2026-08-28T10:00:00.000Z', quantity: 1, pointsAwarded: 100 }];
  },
  async getVerifiedImpact() { return { userMealsRescued: 3, totalMealsRescued: 27 }; },
};

export const mockWatchZoneService: WatchZoneService = {
  async getMine() { return mockWatchZone; },
  async saveMine(input) { mockWatchZone = { ...input, id: 'mock-watch-zone', userId: mockProfile.id }; return mockWatchZone; },
  async disableMine() { if (mockWatchZone) mockWatchZone = { ...mockWatchZone, enabled: false }; },
  async deleteMine() { mockWatchZone = null; },
};
