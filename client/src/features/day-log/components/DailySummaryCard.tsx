import { Text, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ProgressRing } from "../../../shared/components/ui/ProgressRing";
import { useDirection } from "../../../shared/hooks/useDirection";
import { useAppTheme } from "../../../shared/theme";
import { formatCalories, formatGrams } from "../../../shared/helpers/formatNumber";
import { progressGradient } from "../../../shared/helpers/progressColor";
import { GradientBar } from "../../../shared/components/ui/GradientBar";
import { MacroItem } from "../types";
import { MACRO_CONFIG } from "../constants/macros";
import { useStyles } from "./styles/DailySummaryCard.styles";

type Props = {
  eaten: number;
  target: number;
  macros: MacroItem[];
  showPercentages: boolean;
  isToday?: boolean;
};

function percentOf(current: number, target: number) {
  return target > 0 ? Math.min(Math.round((current / target) * 100), 999) : 0;
}

export function DailySummaryCard({
  eaten,
  target,
  macros,
  showPercentages,
  isToday = true,
}: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();
  const { colors, resolvedTheme } = useAppTheme();
  const { width } = useWindowDimensions();
  const ringSize = Math.round(Math.min(Math.max(width * 0.56, 176), 228));

  const isOverTarget = target > 0 && Math.round(eaten) > Math.round(target);
  const isTargetReached = target > 0 && Math.round(eaten) === Math.round(target);
  const progress = target > 0 ? Math.min(eaten / target, 1) : 0;
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

  return (
    <View style={styles.container}>
      <View
        style={styles.hero}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${mainLabel}: ${formatCalories(mainNumber)} ${unit}. ${t(
          "calories.progressA11y",
          { eaten: formatCalories(eaten), target: formatCalories(target) },
        )}`}
        accessibilityValue={{ min: 0, max: 100, now: Math.min(percent, 100) }}
      >
        <ProgressRing
          size={ringSize}
          thickness={14}
          progress={progress}
          gradient={progressGradient(progress, colors, isOverTarget)}
          trackColor={colors.progressTrack}
          halo={resolvedTheme === "dark"}
          mirrored={dir.isRTL}
        >
          <Text
            style={styles.mainNumber}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {formatCalories(mainNumber)}
          </Text>
          <Text style={styles.mainLabel} numberOfLines={2}>
            {mainLabel}
          </Text>
          <Text style={styles.mainUnit} numberOfLines={1}>
            {unit}
          </Text>
        </ProgressRing>
      </View>

      {macros.length > 0 ? (
        <View style={styles.macros}>
          {macros.map((macro) => {
            const label = t(`macros.${MACRO_CONFIG[macro.key].labelKey}`);
            const left = macro.target - macro.current;
            const isOver = macro.target > 0 && left < 0;
            const leftText = isOver
              ? t("macros.overValue", { value: formatGrams(-left) })
              : formatGrams(Math.max(left, 0));
            const ratio = macro.target > 0 ? macro.current / macro.target : 0;
            const macroProgress = Math.min(ratio, 1);

            return (
              <View
                key={macro.key}
                accessible
                accessibilityLabel={t("macros.rowA11y", {
                  name: label,
                  eaten: formatGrams(macro.current),
                  target: formatGrams(macro.target),
                  left: leftText,
                })}
              >
                <View style={[styles.macroHead, dir.row]}>
                  <Text style={[styles.macroLabel, dir.text]} numberOfLines={1}>
                    {label}
                  </Text>
                  {showPercentages ? (
                    <Text style={styles.macroValue} numberOfLines={1}>
                      {percentOf(macro.current, macro.target)}%
                    </Text>
                  ) : (
                    <Text style={styles.macroValue} numberOfLines={1}>
                      {formatGrams(macro.current)}
                      <Text style={styles.macroTarget}>
                        {" / "}
                        {t("macros.ofTargetShort", { target: formatGrams(macro.target) })}
                      </Text>
                    </Text>
                  )}
                </View>
                <GradientBar
                  progress={macroProgress}
                  gradient={progressGradient(ratio, colors, isOver)}
                  mirrored={dir.isRTL}
                />
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
