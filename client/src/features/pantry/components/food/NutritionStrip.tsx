import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";

import {
  AppColors,
  radius,
  spacing,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { MacroValues } from "./NutritionLine";

type MacroKey = "protein" | "carbs" | "fat" | "fiber";

type Cell = {
  key: string;
  value: string;
  unit: string;
  label: string;
  spokenLabel: string;
  color?: string;
};

type Props = {
  calories: number;
  macros: MacroValues;
};

function macroColor(colors: AppColors, key: MacroKey) {
  switch (key) {
    case "protein":
      return colors.macroProtein;
    case "carbs":
      return colors.macroCarbs;
    case "fat":
      return colors.macroFat;
    case "fiber":
      return colors.macroFiber;
  }
}

export function NutritionStrip({ calories, macros }: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const { showCarbs, showFat, showFiber } = useMacroVisibility();

  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const gramsUnit = t("strip.gramsUnit");

  const macroCell = (key: MacroKey, value: number | null | undefined): Cell => ({
    key,
    value: value != null ? formatGrams(value) : "—",
    unit: value != null ? gramsUnit : "",
    label: isCompact ? t(`strip.${key}Short`) : t(`macros.${key}`),
    spokenLabel: t(`macros.${key}`),
    color: macroColor(colors, key),
  });

  const cells: Cell[] = [
    {
      key: "calories",
      value: formatCalories(calories),
      unit: "",
      label: t("product.calUnit"),
      spokenLabel: t("macros.calories"),
    },
    macroCell("protein", macros.protein),
    ...(showCarbs ? [macroCell("carbs", macros.carbs)] : []),
    ...(showFat ? [macroCell("fat", macros.fat)] : []),
    ...(showFiber ? [macroCell("fiber", macros.fiber)] : []),
  ];

  const accessibilityLabel = cells
    .map((cell) => `${cell.spokenLabel} ${cell.value}${cell.unit ? ` ${cell.unit}` : ""}`)
    .join(", ");

  return (
    <View
      style={[styles.strip, dir.row]}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      {cells.map((cell, index) => (
        <View
          key={cell.key}
          style={[
            styles.cell,
            index > 0 && (dir.isRTL ? styles.dividerRight : styles.dividerLeft),
          ]}
        >
          <Text
            style={[styles.value, cell.key === "calories" && styles.valueStrong]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {cell.value}
            {cell.unit ? <Text style={styles.unit}>{` ${cell.unit}`}</Text> : null}
          </Text>

          <View style={[styles.labelRow, dir.row]}>
            {cell.color ? (
              <View style={[styles.dot, { backgroundColor: cell.color }]} />
            ) : null}
            <Text style={styles.label} numberOfLines={1}>
              {cell.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      strip: {
        alignItems: "stretch",
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
      },
      cell: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        paddingHorizontal: 2,
      },
      dividerLeft: {
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderLeftColor: colors.border,
      },
      dividerRight: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: colors.border,
      },
      value: {
        ...typography.footnote,
        ...typography.number,
        fontWeight: "600",
        color: colors.textPrimary,
        textAlign: "center",
      },
      valueStrong: {
        ...typography.callout,
        ...typography.number,
        fontWeight: "700",
        color: colors.textPrimary,
      },
      unit: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textSecondary,
      },
      labelRow: {
        alignItems: "center",
        gap: 4,
        maxWidth: "100%",
      },
      dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
      },
      label: {
        flexShrink: 1,
        ...typography.caption,
        fontWeight: "400",
        color: colors.textSecondary,
      },
    }),
  );
