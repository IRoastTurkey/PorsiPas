import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

import { useReducedMotion } from '@/components/polish/use-reduced-motion';

type GentleAppearProps = PropsWithChildren<{
  delay?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function GentleAppear({ children, delay = 0, disabled = false, style }: GentleAppearProps) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(disabled || reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (disabled || reduceMotion) {
      progress.setValue(1);
      return;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      delay,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, disabled, progress, reduceMotion]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}
