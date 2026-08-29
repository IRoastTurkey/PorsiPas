import type { CollectionRecord } from '@/domain/types';

export const WEEKLY_RESCUE_GOAL = 3;

export type RescueRank = {
  id: string;
  name: string;
  minimumRescues: number;
  message: string;
};

export type RescueBadge = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  unlocked: boolean;
};

export type EngagementSnapshot = {
  rank: RescueRank;
  nextRank: RescueRank | null;
  rankProgress: number;
  weeklyRescues: number;
  weeklyGoal: number;
  weeklyProgress: number;
  dailyBonusClaimed: boolean;
  badges: RescueBadge[];
};

const RESCUE_RANKS: RescueRank[] = [
  {
    id: 'newcomer',
    name: 'Meteor Newcomer',
    minimumRescues: 0,
    message: 'Your first FoodDrop is waiting to be caught.',
  },
  {
    id: 'catcher',
    name: 'Drop Catcher',
    minimumRescues: 1,
    message: 'You have turned a surplus portion into a real rescue.',
  },
  {
    id: 'scout',
    name: 'Meteor Scout',
    minimumRescues: 3,
    message: 'You are building a repeatable campus rescue habit.',
  },
  {
    id: 'guardian',
    name: 'PorsiPal Guardian',
    minimumRescues: 7,
    message: 'PorsiPal trusts you to keep watch for the next drop.',
  },
  {
    id: 'comet',
    name: 'Campus Comet',
    minimumRescues: 15,
    message: 'Your verified rescues are leaving a visible trail.',
  },
  {
    id: 'legend',
    name: 'Rescue Legend',
    minimumRescues: 30,
    message: 'You have made surplus rescue part of your routine.',
  },
];

type SingaporeDate = {
  year: number;
  month: number;
  day: number;
};

const singaporeDateFormatter = new Intl.DateTimeFormat('en-SG', {
  timeZone: 'Asia/Singapore',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function singaporeDate(value: Date): SingaporeDate {
  const parts = singaporeDateFormatter.formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
  };
}

function dateKey(value: SingaporeDate) {
  return `${value.year.toString().padStart(4, '0')}-${value.month
    .toString()
    .padStart(2, '0')}-${value.day.toString().padStart(2, '0')}`;
}

function singaporeDateKey(value: Date) {
  return dateKey(singaporeDate(value));
}

function singaporeWeekStartKey(value: Date) {
  const local = singaporeDate(value);
  const midnight = new Date(Date.UTC(local.year, local.month - 1, local.day));
  const mondayOffset = (midnight.getUTCDay() + 6) % 7;
  midnight.setUTCDate(midnight.getUTCDate() - mondayOffset);
  return dateKey({
    year: midnight.getUTCFullYear(),
    month: midnight.getUTCMonth() + 1,
    day: midnight.getUTCDate(),
  });
}

function rankFor(totalRescues: number) {
  let rank = RESCUE_RANKS[0];
  for (const candidate of RESCUE_RANKS) {
    if (totalRescues >= candidate.minimumRescues) rank = candidate;
  }
  return rank;
}

function nextRankFor(rank: RescueRank) {
  const index = RESCUE_RANKS.findIndex((candidate) => candidate.id === rank.id);
  return RESCUE_RANKS[index + 1] ?? null;
}

function progressBetweenRanks(totalRescues: number, rank: RescueRank, nextRank: RescueRank | null) {
  if (!nextRank) return 1;
  const range = nextRank.minimumRescues - rank.minimumRescues;
  return Math.min(1, Math.max(0, (totalRescues - rank.minimumRescues) / range));
}

export function buildEngagementSnapshot(
  history: CollectionRecord[],
  totalRescues: number,
  currentStreak: number,
  now = new Date(),
): EngagementSnapshot {
  const todayKey = singaporeDateKey(now);
  const weekStartKey = singaporeWeekStartKey(now);
  const weeklyRescues = history.filter((item) => {
    const itemKey = singaporeDateKey(new Date(item.verifiedAt));
    return itemKey >= weekStartKey && itemKey <= todayKey;
  }).length;
  const dailyBonusClaimed = history.some(
    (item) => singaporeDateKey(new Date(item.verifiedAt)) === todayKey && item.pointsAwarded > 0,
  );
  const rank = rankFor(totalRescues);
  const nextRank = nextRankFor(rank);

  return {
    rank,
    nextRank,
    rankProgress: progressBetweenRanks(totalRescues, rank, nextRank),
    weeklyRescues,
    weeklyGoal: WEEKLY_RESCUE_GOAL,
    weeklyProgress: Math.min(1, weeklyRescues / WEEKLY_RESCUE_GOAL),
    dailyBonusClaimed,
    badges: [
      {
        id: 'first-catch',
        name: 'First Catch',
        symbol: '✦',
        description: 'Complete one verified rescue.',
        unlocked: totalRescues >= 1,
      },
      {
        id: 'rescue-trio',
        name: 'Rescue Trio',
        symbol: '☄',
        description: 'Complete three verified rescues.',
        unlocked: totalRescues >= 3,
      },
      {
        id: 'week-in-orbit',
        name: 'Week in Orbit',
        symbol: '◎',
        description: 'Complete the three-rescue weekly mission.',
        unlocked: weeklyRescues >= WEEKLY_RESCUE_GOAL,
      },
      {
        id: 'streak-spark',
        name: 'Streak Spark',
        symbol: '◆',
        description: 'Qualify in two consecutive weeks.',
        unlocked: currentStreak >= 2,
      },
    ],
  };
}

export function getRescueRank(totalRescues: number) {
  return rankFor(Math.max(0, totalRescues));
}
