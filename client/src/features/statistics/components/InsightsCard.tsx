import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { formatStat } from "../helpers/nutrients";
import { Insight } from "../helpers/insights";
import { StatCard } from "./StatCard";

type Props = {
  insights: Insight[];
};

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export function InsightsCard({ insights }: Props) {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const kcal = t("units.kcal");

  function describe(insight: Insight): { icon: IconName; color: string; title: string; body: string } {
    switch (insight.kind) {
      case "coverage":
        return {
          icon: "calendar-blank-outline",
          color: colors.textSecondary,
          title: t("insights.coverageTitle"),
          body: t("insights.coverage", { count: insight.missing, range: insight.range }),
        };
      case "protein":
        return {
          icon: "fire",
          color: colors.macroProtein,
          title: t("insights.proteinTitle"),
          body: t("insights.protein", { count: insight.count, logged: insight.logged }),
        };
      case "caloriesWithin":
        return {
          icon: "bullseye-arrow",
          color: colors.accent,
          title: t("insights.caloriesTitle"),
          body: t("insights.caloriesWithin", { pct: insight.pct }),
        };
      case "caloriesAbove":
      case "caloriesBelow":
        return {
          icon: "scale-balance",
          color: colors.accent,
          title: t("insights.caloriesTitle"),
          body: t(insight.kind === "caloriesAbove" ? "insights.caloriesAbove" : "insights.caloriesBelow", {
            value: `${formatStat(insight.value, "kcal")} ${kcal}`,
          }),
        };
      case "topSource":
        return {
          icon: "silverware-fork-knife",
          color: colors.accent,
          title: t("insights.topSourceTitle"),
          body: t("insights.topSource", { name: insight.name, pct: insight.pct }),
        };
    }
  }

  return (
    <StatCard title={t("insights.title")} subtitle={t("insights.subtitle")}>
      <View style={styles.list}>
        {insights.map((insight) => {
          const item = describe(insight);
          return (
            <View key={insight.kind} style={[styles.item, dir.row]} accessible>
              <View style={styles.icon}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.text}>
                <Text style={[styles.title, dir.text]}>{item.title}</Text>
                <Text style={[styles.body, dir.text]}>{item.body}</Text>
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
      list: {
        gap: spacing.sm,
      },
      item: {
        alignItems: "center",
        gap: spacing.ms,
        padding: spacing.ms,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      icon: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.glassBorder,
      },
      text: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      title: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      body: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
    }),
  );
