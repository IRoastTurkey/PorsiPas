import { StatePanel, type StateAction } from '@/components/states/state-panel';

type OfflineStateProps = {
  onRetry: () => void;
  secondaryAction?: StateAction;
};

export function OfflineState({ onRetry, secondaryAction }: OfflineStateProps) {
  return (
    <StatePanel
      description="PorsiPas needs a connection to show live stock and safely confirm a rescue. Nothing has been claimed yet."
      primaryAction={{ label: 'Try connection again', onPress: onRetry }}
      secondaryAction={secondaryAction}
      symbol="↯"
      title="You appear to be offline"
    />
  );
}
