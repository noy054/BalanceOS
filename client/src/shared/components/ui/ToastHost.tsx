import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { hideToast, useToastStore } from "../../helpers/toast";
import { useDirection } from "../../hooks/useDirection";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import { radius, shadows, spacing, typography, useAppTheme, useThemedStyles } from "../../theme";

const VISIBLE_MS = 3500;
const BOTTOM_OFFSET = 100;

export function ToastHost() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const toast = useToastStore((state) => state.toast);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    AccessibilityInfo.announceForAccessibility(toast.message);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotion ? 0 : 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 0,
        duration: reduceMotion ? 0 : 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => hideToast(toast.id));
    }, VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [toast, progress, reduceMotion]);

  if (!toast) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <View pointerEvents="box-none" style={[styles.layer, { bottom: insets.bottom + BOTTOM_OFFSET }]}>
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[styles.toast, dir.row, { opacity: progress, transform: [{ translateY }] }]}
      >
        <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
        <Text style={[styles.message, dir.text]} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.actionLabel && toast.onAction ? (
          <Pressable
            onPress={() => {
              toast.onAction?.();
              hideToast(toast.id);
            }}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionLabel}>{toast.actionLabel}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      layer: {
        position: "absolute",
        left: spacing.md,
        right: spacing.md,
        alignItems: "center",
      },
      toast: {
        width: "100%",
        maxWidth: 480,
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 52,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.borderStrong,
        backgroundColor: colors.surfaceElevated,
        ...shadows.lg,
      },
      message: {
        flex: 1,
        ...typography.callout,
        color: colors.textPrimary,
      },
      action: {
        minHeight: 36,
        justifyContent: "center",
        paddingHorizontal: spacing.xs,
      },
      actionLabel: {
        ...typography.label,
        fontSize: 14,
        color: colors.accent,
      },
      pressed: {
        opacity: 0.7,
      },
    }),
  );
