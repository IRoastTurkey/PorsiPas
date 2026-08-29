import { CollectFoodDropResult } from '@/domain/types';

export interface CollectionService {
  collectByQrPayload(qrPayload: string): Promise<CollectFoodDropResult>;
}
