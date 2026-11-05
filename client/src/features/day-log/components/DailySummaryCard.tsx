import { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { CalorieRibbon } from "../../../shared/components/ui/CalorieRibbon";
import { useDirection } from "../../../shared/hooks/useDirection";
import { useAppTheme } from "../../../shared/theme";
import {
  formatCalories,
  formatGrams,
} from "../../../shared/helpers/formatNumber";
import { macroColor } from "../../../shared/helpers/macroColors";
import { mixColors, withAlpha } from "../../../shared/helpers/progressColor";
import { MacroItem } from "../types";
import { MACRO_CONFIG } from "../constants/macros";
import { calorieStatus } from "../helpers/calorieStatus";
import { useStyles } from "./styles/DailySummaryCard.styles";

type Props = {
  eaten: number;
  target: number;
  macros: MacroItem[];
  isToday?: boolean;
  showPercentages?: boolean;
};

function percentOf(current: number, target: number) {
  return target > 0 ? Math.min(Math.round((current / target) * 100), 999) : 0;
}

export function DailySummaryCard({
  eaten,
  target,
  macros,
  isToday = true,
  showPercentages = false,
}: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();
  const { colors, resolvedTheme } = useAppTheme();
  const { width } = useWindowDimensions();

  const gaugeWidth = Math.round(Math.min(Math.max(width - 48, 272), 380));
  const dark = resolvedTheme === "dark";
  const palette = useMemo(
    () => ({
      color: colors.calorieGauge,
      deep: colors.calorieGaugeDeep,
      edge: dark ? mixColors(colors.calorieGauge, colors.gloss, 0.35) : colors.accent,
      canvas: colors.canvas,
      surface: colors.surface,
    }),
    [colors, dark],
  );

  const {
    isOver: isOverTarget,
    isReached: isTargetReached,
    progress,
  } = calorieStatus(eaten, target);

  const percent = percentOf(eaten, target);

  const mainLabel = isOverTarget
    ? t("calories.overTargetLabel")
    : isTargetReached
      ? t("calories.targetReachedLabel")
      : isToday
        ? t("calories.remainingLabel")
        : t("calories.remainingDayLabel");

  const mainNumber = isOverTarget
    ? eaten - target
    : Math.max(target - eaten, 0);

  const unit = t("calories.unitShort");

  return (
    <View style={styles.container}>
      <View
        style={styles.hero}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${mainLabel}: ${formatCalories(
          mainNumber,
        )} ${unit}. ${t("calories.progressA11y", {
          eaten: formatCalories(eaten),
          target: formatCalories(target),
        })}`}
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.min(percent, 100),
        }}
      >
        <CalorieRibbon
          width={gaugeWidth}
          progress={progress}
          palette={palette}
          dark={dark}
          badge={
            <>
              <Text style={styles.badgeValue} numberOfLines={1}>{`${percent}%`}</Text>
              <Text style={styles.badgeLabel} numberOfLines={1}>
                {t("calories.ofTargetShort")}
              </Text>
            </>
          }
        >
          <MaterialCommunityIcons name="fire" size={26} color={dark ? colors.calorieGauge : colors.accent} />

          <Text style={styles.mainLabel} numberOfLines={1}>
            {mainLabel}
          </Text>

          <Text style={styles.mainNumber} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {formatCalories(mainNumber)}
          </Text>

          <Text style={styles.mainTarget} numberOfLines={1}>
            {t("calories.ofTargetCalories", {
              target: formatCalories(target),
            })}
          </Text>
        </CalorieRibbon>
      </View>

      {macros.length > 0 ? (
        <View style={[styles.macros, dir.row]}>
          {macros.map((macro) => {
            const config = MACRO_CONFIG[macro.key];
            const label = t(`macros.${config.labelKey}`);
            const color = macroColor(macro.key, colors);
            const left = macro.target - macro.current;
            const isOver = macro.target > 0 && left < 0;

            const leftText = isOver
              ? t("macros.overValue", {
                  value: formatGrams(-left),
                })
              : formatGrams(Math.max(left, 0));

            return (
              <View
                key={macro.key}
                style={[
                  styles.macroCard,
                  {
                    backgroundColor: withAlpha(color, resolvedTheme === "dark" ? 0.13 : 0.1),
                    borderColor: withAlpha(color, resolvedTheme === "dark" ? 0.34 : 0.28),
                  },
                ]}
                accessible
                accessibilityLabel={t("macros.rowA11y", {
                  name: label,
                  eaten: formatGrams(macro.current),
                  target: formatGrams(macro.target),
                  left: leftText,
                })}
              >
                <MaterialCommunityIcons
                  name={config.icon}
                  size={22}
                  color={color}
                />

                <Text style={styles.macroLabel} numberOfLines={1}>
                  {label}
                </Text>

                <View style={styles.macroAmount}>
                  <Text
                    style={[styles.macroValue, { color }]}
                    numberOfLines={1}
                  >
                    {showPercentages
                      ? `${percentOf(macro.current, macro.target)}%`
                      : formatGrams(macro.current)}
                  </Text>

                  <Text style={styles.macroTarget} numberOfLines={1}>
                    {showPercentages
                      ? `${formatGrams(
                          macro.current,
                        )}/${formatGrams(macro.target)}`
                      : `/${formatGrams(macro.target)}`}
                  </Text>
                </View>

                <View style={[styles.macroTrack, { backgroundColor: withAlpha(color, 0.18) }, dir.row]}>
                  <View
                    style={[
                      styles.macroFill,
                      {
                        backgroundColor: color,
                        width: `${macro.target > 0 ? Math.min((macro.current / macro.target) * 100, 100) : 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
