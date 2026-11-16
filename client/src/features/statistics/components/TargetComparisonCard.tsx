import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { formatStat, NutrientMeta } from "../helpers/nutrients";
import { MacroStat, NutrientKey, StatisticsSummary } from "../types";
import { StatCard } from "./StatCard";

type Props = {
  nutrients: NutrientMeta[];
  accuracy: Record<NutrientKey, MacroStat>;
  summary: StatisticsSummary;
};

const AVG_WIDTH = 62;
const TARGET_WIDTH = 54;
const DIFF_WIDTH = 82;

function signed(value: number, unit: "kcal" | "g") {
  const rounded = Number(formatStat(Math.abs(value), unit).replace(/,/g, ""));
  if (!rounded) return "0";
  const text = formatStat(Math.abs(value), unit);
  return value > 0 ? `\u200E+${text}` : `\u200E−${text}`;
}

function direction(value: number, unit: "kcal" | "g") {
  return signed(value, unit) === "0" ? "even" : value > 0 ? "up" : "down";
}

export function TargetComparisonCard({ nutrients, accuracy, summary }: Props) {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const kcal = t("units.kcal");
  const grams = t("units.g");

  const tiles = [
    { key: "dailyGap", label: t("summary.avgDailyGap"), value: summary.avgDailyCalorieGap, unit: "kcal" as const, unitLabel: kcal, scope: t("comparison.perDay") },
    { key: "proteinGap", label: t("summary.proteinGap"), value: summary.proteinGap, unit: "g" as const, unitLabel: grams, scope: t("comparison.perDay") },
    { key: "balance", label: t("summary.calorieBalance"), value: summary.calorieBalance, unit: "kcal" as const, unitLabel: kcal, scope: t("comparison.total") },
  ];

  const directionLabel = (value: number, unit: "kcal" | "g") => {
    const state = direction(value, unit);
    return state === "even" ? t("comparison.onTarget") : state === "up" ? t("comparison.over") : t("comparison.under");
  };

  return (
    <StatCard title={t("comparison.title")} subtitle={t("comparison.subtitle")}>
      <View style={[styles.tiles, dir.row]}>
        {tiles.map((tile) => {
          const state = direction(tile.value, tile.unit);
          return (
            <View
              key={tile.key}
              style={styles.tile}
              accessible
              accessibilityLabel={`${tile.label}: ${signed(tile.value, tile.unit)} ${tile.unitLabel} ${tile.scope}, ${directionLabel(tile.value, tile.unit)}`}
            >
              <Text style={styles.tileLabel} numberOfLines={1}>
                {tile.label}
              </Text>
              <View style={[styles.tileValueRow, styles.ltrRow]}>
                {state !== "even" ? (
                  <MaterialCommunityIcons
                    name={state === "up" ? "arrow-up" : "arrow-down"}
                    size={14}
                    color={colors.textSecondary}
                  />
                ) : null}
                <Text style={styles.tileValue} numberOfLines={1}>
                  {signed(tile.value, tile.unit)}
                </Text>
              </View>
              <Text style={styles.tileUnit} numberOfLines={1}>
                {`${tile.unitLabel} · ${tile.scope}`}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.table}>
        <View style={[styles.row, styles.headRow, dir.row]}>
          <Text style={[styles.headCell, styles.nameCell, dir.text]}>{t("comparison.nutrient")}</Text>
          <Text style={[styles.headCell, { width: AVG_WIDTH }]}>{t("comparison.average")}</Text>
          <Text style={[styles.headCell, { width: TARGET_WIDTH }]}>{t("comparison.target")}</Text>
          <Text style={[styles.headCell, { width: DIFF_WIDTH }]}>{t("comparison.difference")}</Text>
        </View>

        {nutrients.map((nutrient, index) => {
          const stat = accuracy[nutrient.key];
          const unit = t(`units.${nutrient.unit}`);
          const name = t(`macros.${nutrient.key}`);
          const hasTarget = stat.target > 0;
          const diff = stat.avg - stat.target;
          const state = direction(diff, nutrient.unit);
          return (
            <View
              key={nutrient.key}
              style={[styles.row, index > 0 && styles.divider, dir.row]}
              accessible
              accessibilityLabel={`${name}: ${t("comparison.average")} ${formatStat(stat.avg, nutrient.unit)} ${unit}, ${t("comparison.target")} ${hasTarget ? `${formatStat(stat.target, nutrient.unit)} ${unit}` : "—"}${hasTarget ? `, ${t("comparison.difference")} ${signed(diff, nutrient.unit)} ${unit}, ${directionLabel(diff, nutrient.unit)}` : ""}`}
            >
              <View style={[styles.nameCell, styles.nameWrap, dir.row]}>
                <View style={[styles.icon, { backgroundColor: withAlpha(nutrient.color, 0.14) }]}>
                  <MaterialCommunityIcons name={nutrient.icon} size={15} color={nutrient.color} />
                </View>
                <View style={[styles.nameText, dir.alignStart]}>
                  <Text style={[styles.name, dir.text]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={[styles.unit, dir.text]}>{unit}</Text>
                </View>
              </View>
              <Text style={[styles.num, styles.numStrong, { width: AVG_WIDTH }]} numberOfLines={1}>
                {formatStat(stat.avg, nutrient.unit)}
              </Text>
              <Text style={[styles.num, { width: TARGET_WIDTH }]} numberOfLines={1}>
                {hasTarget ? formatStat(stat.target, nutrient.unit) : "—"}
              </Text>
              <View style={{ width: DIFF_WIDTH, alignItems: "center" }}>
                {hasTarget ? (
                  <View style={[styles.chip, styles.ltrRow, state === "even" && styles.chipEven]}>
                    {state !== "even" ? (
                      <MaterialCommunityIcons
                        name={state === "up" ? "arrow-up" : "arrow-down"}
                        size={12}
                        color={colors.textSecondary}
                      />
                    ) : null}
                    <Text style={styles.chipText} numberOfLines={1}>
                      {signed(diff, nutrient.unit)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.num}>—</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </StatCard>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      tiles: {
        gap: spacing.sm,
      },
      tile: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: 2,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.xs,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: withAlpha(colors.textPrimary, 0.035),
      },
      tileLabel: {
        ...typography.caption,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
      },
      ltrRow: {
        flexDirection: "row",
      },
      tileValueRow: {
        alignItems: "center",
        gap: 2,
      },
      tileValue: {
        ...typography.number,
        fontFamily: fonts.medium,
        fontSize: 18,
        lineHeight: 23,
        color: colors.textPrimary,
      },
      tileUnit: {
        ...typography.caption,
        fontSize: 11,
        color: colors.textMuted,
      },
      table: {
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },
      row: {
        alignItems: "center",
        minHeight: 52,
        gap: spacing.xs,
      },
      headRow: {
        minHeight: 26,
      },
      divider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },
      headCell: {
        ...typography.caption,
        fontFamily: fonts.medium,
        textAlign: "center",
        color: colors.textMuted,
      },
      nameCell: {
        flex: 1,
        minWidth: 0,
      },
      nameWrap: {
        alignItems: "center",
        gap: spacing.sm,
      },
      icon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      },
      nameText: {
        flex: 1,
        minWidth: 0,
      },
      name: {
        ...typography.callout,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      unit: {
        ...typography.caption,
        fontSize: 11,
        lineHeight: 14,
        color: colors.textMuted,
      },
      num: {
        ...typography.callout,
        ...typography.number,
        textAlign: "center",
        color: colors.textSecondary,
      },
      numStrong: {
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },
      chip: {
        alignItems: "center",
        gap: 2,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: withAlpha(colors.textPrimary, 0.07),
      },
      chipEven: {
        backgroundColor: withAlpha(colors.calorieGauge, 0.12),
      },
      chipText: {
        ...typography.footnote,
        ...typography.number,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
    }),
  );
