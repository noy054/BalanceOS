import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { formatStat, NutrientMeta, percentOf } from "../helpers/nutrients";
import { MacroStat, NutrientKey } from "../types";
import { StatCard } from "./StatCard";

type Props = {
  nutrients: NutrientMeta[];
  accuracy: Record<NutrientKey, MacroStat>;
  loggedDays: number;
  rangeDays: number;
  selected: NutrientKey;
  onSelect: (key: NutrientKey) => void;
};

export function NutrientProgressCard({
  nutrients,
  accuracy,
  loggedDays,
  rangeDays,
  selected,
  onSelect,
}: Props) {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();

  return (
    <StatCard
      title={t("accuracy.title")}
      subtitle={`${t("accuracy.dailyAverage")} · ${t("accuracy.loggedDays", { loggedDays, rangeDays })}`}
    >
      <View style={styles.list}>
        {nutrients.map((nutrient) => {
          const stat = accuracy[nutrient.key];
          const unit = t(`units.${nutrient.unit}`);
          const name = t(`macros.${nutrient.key}`);
          const pct = percentOf(stat.avg, stat.target);
          const active = nutrient.key === selected;

          return (
            <Pressable
              key={nutrient.key}
              onPress={() => onSelect(nutrient.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${name}: ${formatStat(stat.avg, nutrient.unit)} ${t("accuracy.of")} ${formatStat(stat.target, nutrient.unit)} ${unit}, ${pct}%`}
              accessibilityHint={t("accuracy.selectHint")}
              style={({ pressed }) => [
                styles.row,
                dir.row,
                active && styles.rowActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.icon, { backgroundColor: withAlpha(nutrient.color, 0.16) }]}>
                <MaterialCommunityIcons name={nutrient.icon} size={20} color={nutrient.color} />
              </View>

              <View style={styles.body}>
                <View style={[styles.top, dir.row]}>
                  <Text style={[styles.name, dir.text]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.values} numberOfLines={1}>
                    <Text style={styles.avg}>{formatStat(stat.avg, nutrient.unit)}</Text>
                    {stat.target > 0
                      ? ` / ${formatStat(stat.target, nutrient.unit)} ${unit}`
                      : ` ${unit}`}
                  </Text>
                </View>

                {stat.target > 0 ? (
                  <View style={[styles.barRow, dir.row]}>
                    <View style={[styles.track, dir.row]}>
                      <View
                        style={[
                          styles.fill,
                          { width: `${Math.min(pct, 100)}%`, backgroundColor: nutrient.color },
                        ]}
                      />
                    </View>
                    <Text style={styles.pct}>{`${pct}%`}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </StatCard>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      list: {
        gap: spacing.sm,
      },
      row: {
        alignItems: "center",
        gap: spacing.ms,
        padding: spacing.ms,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      rowActive: {
        borderColor: colors.accentBorder,
      },
      pressed: {
        opacity: 0.8,
      },
      icon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xs + 2,
      },
      top: {
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      name: {
        ...typography.bodyStrong,
        flexShrink: 1,
        color: colors.textPrimary,
      },
      values: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
      avg: {
        fontFamily: fonts.bold,
        fontSize: 16,
        color: colors.textPrimary,
      },
      barRow: {
        alignItems: "center",
        gap: spacing.sm,
      },
      track: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: colors.glassBorder,
      },
      fill: {
        height: "100%",
        borderRadius: 3,
      },
      pct: {
        ...typography.caption,
        ...typography.number,
        minWidth: 36,
        textAlign: "center",
        color: colors.textSecondary,
      },
    }),
  );
