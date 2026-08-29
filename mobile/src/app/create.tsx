import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { PageHeader } from '@/components/page-header';
import { colors, radii, spacing, typeScale } from '@/constants/theme';

const steps = [
  {
    number: '1',
    title: 'Photograph the food',
    description: 'A clear, current photo is required so rescuers know what is available.',
  },
  {
    number: '2',
    title: 'Set the pickup details',
    description: 'Enter the number of portions, location, and collection deadline.',
  },
  {
    number: '3',
    title: 'Publish and display the QR',
    description: 'Rescuers scan on site; each successful scan reduces stock by one.',
  },
];

export default function CreateScreen() {
  return (
    <AppScreen>
      <PageHeader
        eyebrow="Host a rescue"
        title="Launch a FoodDrop"
        description="Anyone can share safe surplus food. The creation form will stay short enough to finish in under a minute."
      />

      <View style={styles.callout}>
        <Text style={styles.calloutIcon}>🚀</Text>
        <View style={styles.calloutCopy}>
          <Text style={styles.calloutTitle}>Publishing arrives after the foundation</Text>
          <Text style={styles.calloutDescription}>
            This screen establishes the host journey now, before storage and database actions are connected.
          </Text>
        </View>
      </View>

      <View style={styles.steps}>
        {steps.map((step) => (
          <View key={step.number} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.number}</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.safetyCard}>
        <Text style={styles.safetyTitle}>Food safety comes first</Text>
        <Text style={styles.safetyDescription}>
          Hosts will confirm a pickup deadline and basic handling information. Expired drops will disappear automatically.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.lavender,
  },
  calloutIcon: {
    fontSize: 30,
  },
  calloutCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  calloutTitle: {
    color: colors.ink,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
  calloutDescription: {
    color: colors.muted,
    fontSize: typeScale.body,
    lineHeight: 21,
  },
  steps: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
  stepCopy: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: 1,
  },
  stepTitle: {
    color: colors.ink,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
  stepDescription: {
    color: colors.muted,
    fontSize: typeScale.body,
    lineHeight: 21,
  },
  safetyCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  safetyTitle: {
    color: colors.primaryDark,
    fontSize: typeScale.bodyLarge,
    fontWeight: '900',
  },
  safetyDescription: {
    color: colors.muted,
    fontSize: typeScale.body,
    lineHeight: 21,
  },
});
