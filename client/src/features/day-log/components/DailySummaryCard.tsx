import { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { CalorieRibbon } from "../../../shared/components/ui/CalorieRibbon";
import { useDirection } from "../../../shared/hooks/useDirection";
import { useAppTheme } from "../../../shared/theme";
import { formatCalories, formatGrams } from "../../../shared/helpers/formatNumber";
import { macroColor } from "../../../shared/helpers/macroColors";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { MacroItem } from "../types";
import { MACRO_CONFIG } from "../constants/macros";
import { calorieStatus } from "../helpers/calorieStatus";
import { HERO_SCALE, macroCardStyle, useStyles } from "./styles/DailySummaryCard.styles";

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

function heroNumberSize(text: string, ribbonWidth: number) {
  const digits = text.replace(/[^0-9]/g, "").length;
  const separators = text.length - digits;
  const room = ribbonWidth * 0.5;
  return Math.round(Math.min(ribbonWidth * HERO_SCALE.value, room / (digits * 0.62 + separators * 0.28)));
}

export function DailySummaryCard({ eaten, target, macros, isToday = true, showPercentages = false }: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();
  const { colors, resolvedTheme } = useAppTheme();
  const { width } = useWindowDimensions();
  const dark = resolvedTheme === "dark";

  const ribbonWidth = Math.round(Math.min(width * HERO_SCALE.ribbon, 470));
  const cardStyles = useMemo(
    () => Object.fromEntries(macros.map((macro) => [macro.key, macroCardStyle(macroColor(macro.key, colors), dark, colors.gloss)])),
    [macros, colors, dark],
  );

  const { isOver: isOverTarget, isReached: isTargetReached } = calorieStatus(eaten, target);
  const percent = percentOf(eaten, target);

  const mainLabel = isOverTarget
    ? t("calories.overTargetLabel")
    : isTargetReached
      ? t("calories.targetReachedLabel")
      : isToday
        ? t("calories.remainingLabel")
        : t("calories.remainingDayLabel");

  const mainNumber = isOverTarget ? eaten - target : Math.max(target - eaten, 0);
  const unit = t("calories.unitShort");
  const numberText = formatCalories(mainNumber);
  const numberSize = heroNumberSize(numberText, ribbonWidth);
  const badgeSize = Math.round(ribbonWidth * HERO_SCALE.badgeValue);

  return (
    <View style={styles.container}>
      <View
        style={styles.hero}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${mainLabel}: ${numberText} ${unit}. ${t("calories.progressA11y", {
          eaten: formatCalories(eaten),
          target: formatCalories(target),
        })}`}
        accessibilityValue={{ min: 0, max: 100, now: Math.min(percent, 100) }}
      >
        <CalorieRibbon
          width={ribbonWidth}
          icon={
            <MaterialCommunityIcons
              name="fire"
              size={Math.round(ribbonWidth * HERO_SCALE.icon)}
              color={dark ? colors.calorieGauge : colors.accent}
            />
          }
          label={
            <Text style={styles.mainLabel} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {mainLabel}
            </Text>
          }
          value={
            <Text
              style={[styles.mainNumber, { fontSize: numberSize, lineHeight: Math.round(numberSize * 1.18) }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1}
            >
              {numberText}
            </Text>
          }
          caption={
            <Text style={styles.mainTarget} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {t("calories.ofTargetCalories", { target: formatCalories(target) })}
            </Text>
          }
          badgeValue={
            <Text
              style={[styles.badgeValue, { fontSize: badgeSize, lineHeight: Math.round(badgeSize * 1.2) }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1}
            >{`${percent}%`}</Text>
          }
          badgeLabel={
            <Text
              style={[styles.badgeLabel, { fontSize: Math.min(11, Math.round(ribbonWidth * 0.031)) }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1}
            >
              {t("calories.ofTargetShort")}
            </Text>
          }
        />
      </View>

      {macros.length > 0 ? (
        <View style={[styles.macros, dir.row]}>
          {macros.map((macro) => {
            const config = MACRO_CONFIG[macro.key];
            const label = t(`macros.${config.labelKey}`);
            const color = macroColor(macro.key, colors);
            const left = macro.target - macro.current;
            const isOver = macro.target > 0 && left < 0;
            const leftText = isOver ? t("macros.overValue", { value: formatGrams(-left) }) : formatGrams(Math.max(left, 0));
            const amounts = t("macros.progressGrams", {
              current: formatGrams(macro.current),
              target: formatGrams(macro.target),
            });

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
                <View style={styles.macroIconRow}>
                  <MaterialCommunityIcons name={config.icon} size={20} color={color} />
                </View>
                <View style={styles.macroLabelRow}>
                  <Text style={styles.macroLabel} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
                <View style={styles.macroValueRow}>
                  <Text style={[styles.macroValue, { color }]} numberOfLines={1}>
                    {showPercentages ? `${percentOf(macro.current, macro.target)}%` : formatGrams(macro.current)}
                  </Text>
                </View>
                <View style={styles.macroTargetRow}>
                  <Text style={styles.macroTarget} numberOfLines={1}>
                    {showPercentages ? amounts : t("macros.ofTargetShort", { target: formatGrams(macro.target) })}
                  </Text>
                </View>
                <View style={styles.macroTrackRow}>
                  <View style={[styles.macroTrack, { backgroundColor: withAlpha(color, dark ? 0.22 : 0.2) }, dir.row]}>
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
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
