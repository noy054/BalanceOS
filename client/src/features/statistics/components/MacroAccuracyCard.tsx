import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../shared/theme";
import { MacroStat } from "../types";
import { useStyles as useSectionStyles } from "./styles/SectionCard.styles";
import { useStyles } from "./styles/MacroAccuracyCard.styles";

type MacroAccuracy = {
  calories: MacroStat;
  protein: MacroStat;
  carbs: MacroStat;
  fat: MacroStat;
};

type Props = {
  accuracy: MacroAccuracy;
  isRTL: boolean;
  loggedDays?: number;
  rangeDays?: number;
};

type MacroRow = {
  key: keyof MacroAccuracy;
  labelKey: string;
  unit: string;
  color: string;
};

function r1(value: number) {
  return Math.round(value * 10) / 10;
}

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function MacroAccuracyCard({
  accuracy,
  isRTL,
  loggedDays,
  rangeDays,
}: Props) {
  const { t } = useTranslation("statistics");
  const { colors } = useAppTheme();
  const sectionStyles = useSectionStyles();
  const styles = useStyles();

  const textAlign = isRTL ? "right" : "left";

  const macroRows: MacroRow[] = [
    {
      key: "calories",
      labelKey: "macros.calories",
      unit: t("units.kcal"),
      color: colors.accentFill,
    },
    {
      key: "protein",
      labelKey: "macros.protein",
      unit: t("units.g"),
      color: colors.macroProtein,
    },
    {
      key: "carbs",
      labelKey: "macros.carbs",
      unit: t("units.g"),
      color: colors.macroCarbs,
    },
    {
      key: "fat",
      labelKey: "macros.fat",
      unit: t("units.g"),
      color: colors.macroFat,
    },
  ];

  return (
    <View style={sectionStyles.card}>
      <Text style={[sectionStyles.cardTitle, { textAlign }]}>
        {t("accuracy.title")}
      </Text>

      <Text style={[styles.subtitle, { textAlign }]}>
        {t("accuracy.dailyAverage")}
      </Text>

      {typeof loggedDays === "number" && typeof rangeDays === "number" && (
        <Text style={[styles.rangeMeta, { textAlign }]}>
          {t("accuracy.loggedDays", { loggedDays, rangeDays })}
        </Text>
      )}

      {macroRows.map((row) => {
        const stat = accuracy[row.key];
        const fillWidth = Math.min(stat.pct, 100);
        const diff = r1(stat.avg - stat.target);

        const pctColor =
          stat.pct >= 85 && stat.pct <= 115
            ? colors.success
            : stat.pct > 115
              ? colors.warning
              : colors.textMuted;

        const diffText =
          diff === 0
            ? t("accuracy.exactTarget")
            : diff > 0
              ? t("accuracy.overTarget", {
                  value: formatValue(diff),
                  unit: row.unit,
                })
              : t("accuracy.underTarget", {
                  value: formatValue(Math.abs(diff)),
                  unit: row.unit,
                });

        return (
          <View key={row.key} style={styles.row}>
            <View style={[styles.rowHeader, isRTL && styles.rowHeaderRtl]}>
              <Text style={[styles.macroName, { textAlign }]}>
                {t(row.labelKey as Parameters<typeof t>[0])}
              </Text>

              <Text style={styles.macroNumbers}>
                {formatValue(stat.avg)}
                <Text style={styles.macroTarget}>
                  {" "}/ {formatValue(stat.target)} {row.unit}
                </Text>
              </Text>
            </View>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${fillWidth}%`,
                    backgroundColor: row.color,
                  },
                ]}
              />
            </View>

            <Text style={[styles.pctLabel, { color: pctColor, textAlign }]}>
              {stat.pct}% · {diffText}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
