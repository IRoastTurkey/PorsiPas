import type { CollectFoodDropResult, UUID } from '@/domain/types';

export type CollectionAttempt = {
  result: CollectFoodDropResult;
  sourceFoodDropId: UUID | null;
};

let lastAttempt: CollectionAttempt | null = null;

export function setLastCollectionAttempt(attempt: CollectionAttempt) {
  lastAttempt = attempt;
}

export function getLastCollectionAttempt() {
  return lastAttempt;
}

export function clearLastCollectionAttempt() {
  lastAttempt = null;
}
