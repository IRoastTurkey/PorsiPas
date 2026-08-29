import { StatePanel, type StateAction } from '@/components/states/state-panel';

type EmptyStateProps = {
  title?: string;
  description?: string;
  primaryAction?: StateAction;
  secondaryAction?: StateAction;
};

export function EmptyState({
  title = 'No FoodDrops nearby yet',
  description = 'Fresh rescues can appear anytime. Check again soon or widen the area you are viewing.',
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <StatePanel
      description={description}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      symbol="○"
      title={title}
    />
  );
}
