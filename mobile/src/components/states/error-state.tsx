import { StatePanel, type StateAction } from '@/components/states/state-panel';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  secondaryAction?: StateAction;
};

export function ErrorState({
  title = 'That did not work',
  description = 'Your action was not confirmed. Please try again before leaving this screen.',
  onRetry,
  secondaryAction,
}: ErrorStateProps) {
  return (
    <StatePanel
      description={description}
      primaryAction={onRetry ? { label: 'Try again', onPress: onRetry } : undefined}
      secondaryAction={secondaryAction}
      symbol="!"
      title={title}
    />
  );
}
