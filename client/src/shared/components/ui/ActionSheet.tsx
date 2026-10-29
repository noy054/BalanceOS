import { useRef } from "react";
import type { ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { spacing, states, typography, useAppTheme, useThemedStyles } from "../../theme";
import { useDirection } from "../../hooks/useDirection";
import { BottomSheet } from "./BottomSheet";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type SheetAction = {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  actions: SheetAction[];
  onClose: () => void;
};

export function ActionSheet({ visible, title, subtitle, actions, onClose }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const pendingRef = useRef<(() => void) | null>(null);
  const shownRef = useRef({ title, subtitle, actions });

  if (visible) {
    shownRef.current = { title, subtitle, actions };
  }

  const shown = shownRef.current;

  function runPending() {
    const pending = pendingRef.current;
    pendingRef.current = null;
    pending?.();
  }

  function handleSelect(action: SheetAction) {
    pendingRef.current = action.onPress;
    onClose();

    if (Platform.OS !== "ios") {
      setTimeout(runPending, 0);
    }
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      onDismiss={runPending}
      title={shown.title}
      subtitle={shown.subtitle}
    >
      <View style={styles.list}>
        {shown.actions.map((action, index) => {
          const tint = action.destructive ? colors.danger : colors.textPrimary;

          return (
            <Pressable
              key={action.key}
              onPress={() => handleSelect(action)}
              disabled={action.disabled}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityState={{ disabled: action.disabled }}
              style={({ pressed }) => [
                styles.row,
                dir.row,
                index > 0 && styles.rowDivider,
                pressed && styles.rowPressed,
                action.disabled && styles.rowDisabled,
              ]}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={20}
                color={action.destructive ? colors.danger : colors.textSecondary}
              />
              <Text style={[styles.label, dir.text, { color: tint }]}>{action.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      list: {
        marginHorizontal: -spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },
      row: {
        minHeight: 52,
        alignItems: "center",
        gap: spacing.ms,
        paddingHorizontal: spacing.md,
      },
      rowDivider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },
      rowPressed: {
        backgroundColor: colors.surfaceMuted,
      },
      rowDisabled: {
        opacity: states.disabledOpacity,
      },
      label: {
        flex: 1,
        ...typography.body,
      },
    }),
  );
