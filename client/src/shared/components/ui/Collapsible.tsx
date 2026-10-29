import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { useReduceMotion } from "../../hooks/useReduceMotion";

type Props = {
  expanded: boolean;
  children: ReactNode;
};

export function Collapsible({ expanded, children }: Props) {
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [isRendered, setIsRendered] = useState(expanded);

  useEffect(() => {
    if (expanded) setIsRendered(true);
    const animation = Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: reduceMotion ? 0 : expanded ? 280 : 220,
      easing: expanded ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished && !expanded) setIsRendered(false);
    });
    return () => animation.stop();
  }, [expanded, progress, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: Animated.multiply(progress, contentHeight),
          opacity: progress,
        },
      ]}
      accessibilityElementsHidden={!expanded}
      importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
    >
      {isRendered ? (
        <View
          style={styles.content}
          onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
        >
          {children}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
