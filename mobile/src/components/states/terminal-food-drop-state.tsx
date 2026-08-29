import { StatePanel, type StateAction } from '@/components/states/state-panel';
import type { FoodDropVisualState } from '@/components/polish/food-drop-status';

type TerminalState = Extract<FoodDropVisualState, 'depleted' | 'expired' | 'cancelled'>;

type TerminalFoodDropStateProps = {
  state: TerminalState;
  onBack: () => void;
  secondaryAction?: StateAction;
};

const COPY: Record<TerminalState, { title: string; description: string; symbol: string }> = {
  depleted: {
    title: 'Every portion found a home',
    description: 'This FoodDrop is depleted and cannot accept another collection.',
    symbol: '✓',
  },
  expired: {
    title: 'Pickup time has ended',
    description: 'This FoodDrop has expired. Browse the map for another active rescue.',
    symbol: '◷',
  },
  cancelled: {
    title: 'This FoodDrop was cancelled',
    description: 'The host has closed this FoodDrop, so collection is no longer available.',
    symbol: '×',
  },
};

export function TerminalFoodDropState({ state, onBack, secondaryAction }: TerminalFoodDropStateProps) {
  const copy = COPY[state];
  return (
    <StatePanel
      description={copy.description}
      primaryAction={{ label: 'Back to FoodDrops', onPress: onBack }}
      secondaryAction={secondaryAction}
      symbol={copy.symbol}
      title={copy.title}
    />
  );
}
