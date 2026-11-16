import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type MoveMealOption = {
  mealType: string;
  label: string;
  icon: IconName;
};

export type MoveTarget = {
  itemId: string;
  name: string;
  mealType: string;
};

type Props = {
  target: MoveTarget | null;
  options: MoveMealOption[];
  onSelect: (target: MoveTarget, option: MoveMealOption) => void;
  onClose: () => void;
};

export function MoveMealSheet({ target, options, onSelect, onClose }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();

  if (!target) return null;
  const choices = options.filter((option) => option.mealType !== target.mealType);

  return (
    <BottomSheet
      visible
      onClose={onClose}
      title={t("moveMeal.title")}
      subtitle={t("moveMeal.subtitle", { name: target.name })}
    >
      <View style={styles.group}>
        {choices.map((option, index) => (
          <Pressable
            key={option.mealType}
            onPress={() => onSelect(target, option)}
            accessibilityRole="button"
            accessibilityLabel={t("moveMeal.optionA11y", { name: target.name, meal: option.label })}
            style={({ pressed }) => [styles.row, dir.row, index > 0 && styles.divider, pressed && styles.pressed]}
          >
            <View style={styles.icon}>
              <MaterialCommunityIcons name={option.icon} size={18} color={colors.accent} />
            </View>
            <Text style={[styles.label, dir.text]} numberOfLines={1}>
              {option.label}
            </Text>
            <MaterialCommunityIcons
              name={dir.isRTL ? "chevron-left" : "chevron-right"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      group: {
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        overflow: "hidden",
      },
      row: {
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 56,
        paddingHorizontal: spacing.md,
      },
      divider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },
      pressed: {
        opacity: 0.75,
      },
      icon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.accentSoft,
      },
      label: {
        flex: 1,
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
    }),
  );
