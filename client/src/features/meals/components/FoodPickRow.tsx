import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../shared/helpers/formatNumber";
import { macroColor } from "../../../shared/helpers/macroColors";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, states, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { FoodThumb } from "../../pantry/components/food/FoodThumb";
import { pickMainMacro } from "../../pantry/components/food/FoodCardValues";
import { FoodCardModel } from "../../pantry/hooks/useFoodCardModels";
import { useMacroVisibility } from "../../pantry/hooks/useMacroVisibility";

type Props = {
  model: FoodCardModel;
  selected: boolean;
  onPress: () => void;
};

export const FoodPickRow = memo(function FoodPickRow({ model, selected, onPress }: Props) {
  const { t } = useTranslation("pantry");
  const { t: tDashboard } = useTranslation("dashboard");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const visibility = useMacroVisibility();
  const macro = pickMainMacro(model.macros, visibility);
  const macroValue = model.macros[macro];
  const detail = [model.meta, model.basis].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${model.title}, ${formatCalories(model.calories)} ${t("product.calUnit")}`}
      accessibilityHint={selected ? tDashboard("addItem.tapToDeselect") : undefined}
      style={({ pressed }) => [styles.row, dir.row, selected && styles.rowSelected, pressed && styles.pressed]}
    >
      <View style={styles.thumb}>
        <FoodThumb imageUrl={model.imageUrl} fallbackIcon={model.fallbackIcon} size={52} />
      </View>

      <View style={[styles.text, dir.alignStart]}>
        <Text style={[styles.name, dir.text]} numberOfLines={2}>
          {model.title}
        </Text>
        {detail ? (
          <Text style={[styles.detail, dir.text]} numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={[styles.values, dir.alignStart]}>
        <Text style={styles.calories} numberOfLines={1}>
          <Text style={styles.caloriesValue}>{formatCalories(model.calories)}</Text>
          {` ${t("product.calUnit")}`}
        </Text>
        {macroValue != null ? (
          <Text style={styles.macro} numberOfLines={1}>
            <Text style={[styles.macroValue, { color: macroColor(macro, colors) }]}>
              {`${formatGrams(macroValue)} ${t("product.gramsShort")}`}
            </Text>
            {` ${t(`macros.${macro}`)}`}
          </Text>
        ) : null}
      </View>

      <View style={[styles.add, selected && styles.addSelected]}>
        <MaterialCommunityIcons
          name={selected ? "check" : "plus"}
          size={20}
          color={selected ? colors.onAccent : colors.accent}
        />
      </View>
    </Pressable>
  );
});

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        gap: 12,
        minHeight: 68,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: withAlpha(colors.gloss, 0.07),
        backgroundColor: colors.glassCard,
        backgroundImage: `linear-gradient(160deg, ${withAlpha(colors.gloss, 0.05)} 0%, ${withAlpha(colors.gloss, 0)} 60%)`,
      },
      rowSelected: {
        borderColor: withAlpha(colors.accent, 0.6),
        backgroundColor: withAlpha(colors.calorieGauge, 0.06),
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      thumb: {
        width: 52,
        height: 52,
        borderRadius: 12,
        overflow: "hidden",
      },
      text: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      name: {
        fontFamily: fonts.bold,
        fontSize: 15,
        lineHeight: 20,
        color: colors.textPrimary,
      },
      detail: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      divider: {
        width: StyleSheet.hairlineWidth,
        height: 30,
        backgroundColor: withAlpha(colors.gloss, 0.14),
      },
      values: {
        minWidth: 70,
        gap: 2,
      },
      calories: {
        fontFamily: fonts.regular,
        fontSize: 13,
        color: colors.textSecondary,
      },
      caloriesValue: {
        ...typography.number,
        fontFamily: fonts.bold,
        fontSize: 17,
        color: colors.textPrimary,
      },
      macro: {
        fontFamily: fonts.regular,
        fontSize: 12,
        color: colors.textSecondary,
      },
      macroValue: {
        ...typography.number,
        fontFamily: fonts.semibold,
      },
      add: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: withAlpha(colors.calorieGauge, 0.3),
        backgroundColor: withAlpha(colors.calorieGauge, 0.14),
      },
      addSelected: {
        borderColor: colors.accentFill,
        backgroundColor: colors.accentFill,
      },
    }),
  );
