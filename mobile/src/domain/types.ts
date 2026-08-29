export type ISODateTime = string;
export type UUID = string;

export type FoodDropStatus = 'draft' | 'active' | 'depleted' | 'expired' | 'cancelled';
export type DietaryTag = 'halal' | 'vegetarian' | 'vegan' | 'contains_pork' | 'unknown';
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

export interface CollectFoodDropResult {
  code: CollectionResultCode;
  foodDropId: UUID | null;
  collectionId: UUID | null;
  remainingStock: number | null;
  pointsAwarded: number;
  currentStreak: number | null;
}
