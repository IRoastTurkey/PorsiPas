import { Image, ImageStyle, StyleProp } from 'react-native';

type PorsiPalPose = 'neutral' | 'success';

type PorsiPalProps = {
  pose?: PorsiPalPose;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

const POSES = {
  neutral: require('../../../assets/porsipas/porsipal-neutral.png'),
  success: require('../../../assets/porsipas/porsipal-success.png'),
};

const ACCESSIBILITY_LABELS: Record<PorsiPalPose, string> = {
  neutral: 'PorsiPal, the friendly PorsiPas meteor mascot',
  success: 'PorsiPal celebrating a verified food rescue',
};

export function PorsiPal({ pose = 'neutral', size = 112, style }: PorsiPalProps) {
  return (
    <Image
      accessibilityLabel={ACCESSIBILITY_LABELS[pose]}
      resizeMode="contain"
      source={POSES[pose]}
      style={[{ width: size, height: size }, style]}
    />
  );
}
