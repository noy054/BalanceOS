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
import { macroCardStyle, useStyles } from "./styles/DailySummaryCard.styles";

type Props = {
  eaten: number;
  target: number;
  macros: MacroItem[];
  isToday?: boolean;
  showPercentages?: boolean;
};

function heroNumberSize(text: string, gaugeWidth: number) {
  const digits = text.replace(/[^0-9]/g, "").length;
  const separators = text.length - digits;
  const room = gaugeWidth * 0.52;
  return Math.round(Math.min(gaugeWidth * (gaugeWidth < 290 ? 0.185 : 0.205), room / (digits * 0.6 + separators * 0.3)));
}

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

  const gaugeWidth = Math.round(Math.min(Math.max(width * 0.84, 260), 368));
  const dark = resolvedTheme === "dark";
  const palette = useMemo(
    () => ({
      color: colors.calorieGauge,
      deep: colors.calorieGaugeDeep,
      edge: dark ? mixColors(colors.calorieGauge, colors.gloss, 0.35) : colors.accent,
      canvas: colors.canvas,
      surface: colors.surface,
      gloss: colors.gloss,
    }),
    [colors, dark],
  );
  const cardStyles = useMemo(
    () =>
      Object.fromEntries(
        macros.map((macro) => [macro.key, macroCardStyle(macroColor(macro.key, colors), dark, colors.gloss)]),
      ),
    [macros, colors, dark],
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
  const numberText = formatCalories(mainNumber);
  const numberSize = heroNumberSize(numberText, gaugeWidth);

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
          <MaterialCommunityIcons name="fire" size={gaugeWidth < 290 ? 20 : 24} color={dark ? colors.calorieGauge : colors.accent} />

          <Text style={styles.mainLabel} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            {mainLabel}
          </Text>

          <Text
            style={[styles.mainNumber, { fontSize: numberSize, lineHeight: Math.round(numberSize * 1.1) }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            maxFontSizeMultiplier={1}
          >
            {numberText}
          </Text>

          <Text style={styles.mainTarget} numberOfLines={1} maxFontSizeMultiplier={1.2}>
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
                style={[styles.macroCard, cardStyles[macro.key]]}
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

                <Text style={[styles.macroLabel, width < 360 && styles.macroLabelCompact]} numberOfLines={1}>
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

                <View style={[styles.macroTrack, { backgroundColor: withAlpha(color, dark ? 0.16 : 0.18) }, dir.row]}>
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
