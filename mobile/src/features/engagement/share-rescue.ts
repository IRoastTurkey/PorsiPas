import { Share } from 'react-native';

import type { CollectFoodDropResult } from '@/domain/types';

export async function shareVerifiedRescue(result: CollectFoodDropResult) {
  if (result.code !== 'success') return;

  const reward =
    result.pointsAwarded > 0
      ? ` I earned ${result.pointsAwarded} rescue points today.`
      : '';
  await Share.share({
    title: 'A meal caught with PorsiPas',
    message:
      `I just rescued a verified surplus meal with PorsiPas. ☄️${reward} ` +
      'Catch the drop. Save the meal.',
  });
}

type ShareProgressInput = {
  displayName: string;
  mealsRescued: number;
  rankName: string;
  currentStreak: number;
};

export async function shareRescueProgress({
  displayName,
  mealsRescued,
  rankName,
  currentStreak,
}: ShareProgressInput) {
  const mealWord = mealsRescued === 1 ? 'meal' : 'meals';
  const streakCopy =
    currentStreak > 0 ? ` My weekly streak is ${currentStreak}.` : '';
  await Share.share({
    title: `${displayName}'s PorsiPas rescue journey`,
    message:
      `I'm ${displayName}, a ${rankName} on PorsiPas with ${mealsRescued} verified surplus ${mealWord} rescued.${streakCopy} ` +
      'Catch the drop. Save the meal. ☄️',
  });
}
