import { FoodDropReadService } from '@/services/food-drops/contracts';
import { listMockActiveFoodDrops, mockFoodDrops } from '@/test-fixtures/mock-food-drops';

export const mockFoodDropReadService: FoodDropReadService = {
  async listActive({ origin }) {
    return listMockActiveFoodDrops(origin);
  },
  async getById(id) {
    return mockFoodDrops.find((drop) => drop.id === id) ?? null;
  },
  subscribeToFoodDrop(id, onChange) {
    const drop = mockFoodDrops.find((item) => item.id === id);
    if (drop) onChange(drop);
    return () => undefined;
  },
};
