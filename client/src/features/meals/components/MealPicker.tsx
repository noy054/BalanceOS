import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { ActionSheet } from "../../../shared/components/ui/ActionSheet";
import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, states, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { MEAL_SHORTCUTS } from "../constants/mealShortcuts";
import { LoggableMealType, MEAL_TYPE_ICONS } from "../constants/mealTypes";

type Props = {
  value: string;
  label: string;
  onChange: (mealType: string) => void;
};

export function MealPicker({ value, label, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const [open, setOpen] = useState(false);
  const text = label || t("addItem.chooseMeal");

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("addItem.mealSelectA11y", { meal: text })}
        style={({ pressed }) => [styles.pill, dir.row, pressed && styles.pressed]}
      >
        <View style={styles.icon}>
          <MaterialCommunityIcons name="bowl-mix-outline" size={18} color={colors.accent} />
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {text}
        </Text>
        <View style={styles.chevron}>
          <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} />
        </View>
      </Pressable>

      <ActionSheet
        visible={open}
        title={t("addItem.mealPickerTitle")}
        actions={MEAL_SHORTCUTS.map((shortcut) => ({
          key: shortcut.type,
          label: t(`mealTypes.${shortcut.labelKey}`),
          icon: shortcut.type === value ? ("check" as const) : MEAL_TYPE_ICONS[shortcut.type as LoggableMealType],
          onPress: () => onChange(shortcut.type),
        }))}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      pill: {
        alignSelf: "center",
        alignItems: "center",
        gap: 10,
        minWidth: 200,
        height: 42,
        paddingHorizontal: 6,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: withAlpha(colors.gloss, 0.09),
        backgroundColor: colors.glassCard,
        backgroundImage: `linear-gradient(180deg, ${withAlpha(colors.gloss, 0.06)} 0%, ${withAlpha(colors.gloss, 0)} 70%)`,
      },
      icon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: withAlpha(colors.calorieGauge, 0.12),
      },
      label: {
        flex: 1,
        textAlign: "center",
        fontFamily: fonts.bold,
        fontSize: 15,
        color: colors.textPrimary,
      },
      chevron: {
        width: 32,
        alignItems: "center",
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
    }),
  );
