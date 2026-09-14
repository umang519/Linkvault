import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Pulsing placeholder rectangle — ports the design's `lvpulse` keyframe
 * (opacity .35 ↔ .12, 1.4s ease-in-out loop). Holds real geometry so
 * nothing jumps when data lands (PROJECT.md §14.6, Home "Loading").
 */
export function Skeleton({
  width,
  height,
  style,
  delay = 0,
}: {
  width: number | `${number}%`;
  height: number;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.12,
          duration: 700,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={[{ width, height, backgroundColor: colors.ink, opacity }, style]}
    />
  );
}

/** A skeleton row shaped like LinkRow, for list-loading states. */
export function SkeletonRow() {
  return (
    <Animated.View style={{ flexDirection: 'row', gap: 12, padding: 14 }}>
      <Skeleton width={34} height={34} />
      <Animated.View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="80%" height={13} delay={150} />
        <Skeleton width="40%" height={9} delay={300} />
        <Skeleton width="60%" height={9} delay={450} />
      </Animated.View>
    </Animated.View>
  );
}
