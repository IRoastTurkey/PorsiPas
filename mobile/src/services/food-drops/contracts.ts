import { FoodDrop, FoodDropSummary, UUID } from '@/domain/types';

export interface FoodDropReadService {
  listActive(options: {
    origin?: { latitude: number; longitude: number };
  }): Promise<FoodDropSummary[]>;
  getById(id: UUID): Promise<FoodDrop | null>;
  subscribeToFoodDrop(id: UUID, onChange: (foodDrop: FoodDrop) => void): () => void;
}
