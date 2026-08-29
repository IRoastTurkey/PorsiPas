export type ISODateTime = string;
export type UUID = string;

export interface UserProfile {
  id: UUID;
  displayName: string;
  pointsTotal: number;
  currentStreak: number;
  lastQualifiedRescueAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface WatchZone {
  id: UUID;
  userId: UUID;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  label: string | null;
  expiresAt: ISODateTime | null;
  enabled: boolean;
}

export interface CollectionRecord {
  id: UUID;
  foodDropId: UUID;
  userId: UUID;
  title: string;
  venueName: string;
  verifiedAt: ISODateTime;
  quantity: 1;
  pointsAwarded: number;
}

export interface RetentionService {
  getMyProfile(): Promise<UserProfile>;
  listMyCollections(): Promise<CollectionRecord[]>;
  getVerifiedImpact(): Promise<{ userMealsRescued: number; totalMealsRescued: number }>;
}

export interface WatchZoneService {
  getMine(): Promise<WatchZone | null>;
  saveMine(input: Omit<WatchZone, 'id' | 'userId'>): Promise<WatchZone>;
  disableMine(): Promise<void>;
  deleteMine(): Promise<void>;
}
