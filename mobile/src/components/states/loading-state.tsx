import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { StatePanel } from '@/components/states/state-panel';
import { colors, spacing, typeScale } from '@/constants/theme';

type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = 'Looking for FoodDrops…',
  description = 'Checking the latest stock and pickup details.',
}: LoadingStateProps) {
  return (
    <StatePanel description={description} showMascot={false} title={title}>
      <ActivityIndicator accessibilityLabel="Loading" color={colors.primary} size="large" />
      <Text style={styles.waitCopy}>This should only take a moment.</Text>
    </StatePanel>
  );
}

const styles = StyleSheet.create({
  waitCopy: { color: colors.muted, fontSize: typeScale.caption, marginTop: spacing.xs },
});
