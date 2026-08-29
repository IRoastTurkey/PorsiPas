export type ISODateTime = string;
export type UUID = string;

export type FoodDropStatus = 'draft' | 'active' | 'depleted' | 'expired' | 'cancelled';

export type DietaryTag =
  | 'halal'
  | 'vegetarian'
  | 'vegan'
  | 'contains_pork'
  | 'unknown';

export type CollectionResultCode =
  | 'success'
  | 'invalid_qr'
  | 'duplicate_collection'
  | 'depleted'
  | 'expired'
  | 'cancelled'
  | 'unauthenticated'
  | 'offline'
  | 'server_error';

export interface UserProfile {
  id: UUID;
  displayName: string;
  pointsTotal: number;
  currentStreak: number;
  lastQualifiedRescueAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface FoodDrop {
  id: UUID;
  hostId: UUID;
  title: string;
  description: string | null;
  photoUrl: string;
  initialStock: number;
  remainingStock: number;
  venueName: string;
  buildingCode: string | null;
  latitude: number;
  longitude: number;
  pickupInstructions: string | null;
  pickupDeadline: ISODateTime;
  dietaryTags: DietaryTag[];
  allergenNote: string;
  status: FoodDropStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface FoodDropSummary {
  id: UUID;
  title: string;
  photoUrl: string;
  venueName: string;
  latitude: number;
  longitude: number;
  remainingStock: number;
  pickupDeadline: ISODateTime;
  dietaryTags: DietaryTag[];
  status: FoodDropStatus;
  distanceMeters: number | null;
}

export interface CreateFoodDropInput {
  title: string;
  description: string | null;
  localPhotoUri: string;
  initialStock: number;
  venueName: string;
  buildingCode: string | null;
  latitude: number;
  longitude: number;
  pickupInstructions: string | null;
  pickupDeadline: ISODateTime;
  dietaryTags: DietaryTag[];
  allergenNote: string;
  confirmsUnservedSurplus: true;
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

export interface WatchZone {
  id: UUID;
  userId: UUID;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  label: string | null;
  expiresAt: ISODateTime | null;
  enabled: boolean;
  refreshedAt: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface SaveWatchZoneInput {
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  label: string | null;
  enabled: boolean;
}

export interface AlertDelivery {
  id: UUID;
  foodDropId: UUID;
  approximateDistanceMeters: number;
  title: string;
  venueName: string;
  remainingStock: number;
  pickupDeadline: ISODateTime;
  createdAt: ISODateTime;
  presentedAt: ISODateTime | null;
  openedAt: ISODateTime | null;
}

export interface CollectFoodDropResult {
  code: CollectionResultCode;
  foodDropId: UUID | null;
  collectionId: UUID | null;
  remainingStock: number | null;
  pointsAwarded: number;
  currentStreak: number | null;
}

export interface FoodDropReadService {
  listActive(options: {
    origin?: { latitude: number; longitude: number };
  }): Promise<FoodDropSummary[]>;
  getById(id: UUID): Promise<FoodDrop | null>;
  subscribeToFoodDrop(id: UUID, onChange: (foodDrop: FoodDrop) => void): () => void;
}

export interface FoodDropHostService {
  createDraft(input: CreateFoodDropInput): Promise<FoodDrop>;
  publish(id: UUID): Promise<FoodDrop>;
  adjustStock(id: UUID, remainingStock: number, reason: string): Promise<FoodDrop>;
  extendDeadline(id: UUID, pickupDeadline: ISODateTime): Promise<FoodDrop>;
  cancel(id: UUID): Promise<FoodDrop>;
  getQrPayload(id: UUID): Promise<string>;
}

export interface CollectionService {
  collectByQrPayload(qrPayload: string): Promise<CollectFoodDropResult>;
}

export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  ensureAnonymousSession(displayName: string): Promise<UserProfile>;
  updateDisplayName(displayName: string): Promise<UserProfile>;
}

export interface WatchZoneService {
  getMine(): Promise<WatchZone | null>;
  saveMine(input: SaveWatchZoneInput): Promise<WatchZone>;
  disableMine(): Promise<void>;
  deleteMine(): Promise<void>;
}

export interface RetentionService {
  getMyProfile(): Promise<UserProfile>;
  listMyCollections(): Promise<CollectionRecord[]>;
  getVerifiedImpact(): Promise<{
    userMealsRescued: number;
    totalMealsRescued: number;
  }>;
}

export interface AlertDeliveryService {
  listMine(limit?: number): Promise<AlertDelivery[]>;
  markPresented(id: UUID): Promise<void>;
  markOpened(id: UUID): Promise<void>;
  subscribe(onDelivery: (delivery: AlertDelivery) => void): () => void;
}
