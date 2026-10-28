import { Text, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppColors, useAppTheme } from "../../../shared/theme";
import { useDirection } from "../../../shared/hooks/useDirection";
import { formatGrams } from "../../../shared/helpers/formatNumber";
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

function macroColor(colors: AppColors, key: MacroItem["key"]) {
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

export function DailySummaryCard({
  eaten,
  target,
  macros,
  showPercentages,
  isToday = true,
}: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const endAlign = { textAlign: dir.isRTL ? ("left" as const) : ("right" as const) };

  const remaining = Math.max(target - eaten, 0);
  const exceeded = Math.max(eaten - target, 0);
  const progress = target > 0 ? Math.min(eaten / target, 1) : 0;
  const progressPercent = Math.min(
    target > 0 ? Math.round((eaten / target) * 100) : 0,
    999,
  );

  const isOverTarget = target > 0 && eaten > target;
  const isTargetReached = target > 0 && eaten === target;

  const mainLabel = isOverTarget
    ? t("calories.overTargetLabel")
    : isTargetReached
      ? t("calories.targetReachedLabel")
      : isToday
        ? t("calories.remainingLabel")
        : t("calories.remainingDayLabel");

  const mainNumber = isOverTarget ? exceeded : remaining;
  const unit = t("calories.unitShort");
  const gramsUnit = t("macros.gramsUnit");

  return (
    <View style={styles.card}>
      <View style={[styles.hero, dir.alignStart]}>
        <Text style={[styles.mainLabel, dir.text]}>{mainLabel}</Text>

        <View style={[styles.numberRow, dir.row]}>
          <Text
            style={[styles.mainNumber, isOverTarget && styles.mainNumberOver]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {mainNumber}
          </Text>
          <Text style={styles.mainUnit}>{unit}</Text>
        </View>
      </View>

      <View
        style={styles.progressBlock}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={t("calories.progressA11y", { eaten, target })}
        accessibilityValue={{ min: 0, max: 100, now: Math.min(progressPercent, 100) }}
      >
        <View style={[styles.progressTrack, dir.row]}>
          <View
            style={[
              styles.progressFill,
              isOverTarget && styles.progressFillOver,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>

        <View style={[styles.progressCaption, dir.row]}>
          <Text style={[styles.captionText, dir.text]} numberOfLines={1}>
            {t("calories.eaten")}{" "}
            <Text style={styles.captionValue}>{eaten}</Text>
            {showPercentages ? (
              <Text style={isOverTarget ? styles.captionPercentOver : styles.captionPercent}>
                {"  ·  "}
                {progressPercent}%
              </Text>
            ) : null}
          </Text>

          <Text style={styles.captionText} numberOfLines={1}>
            {t("calories.target")}{" "}
            <Text style={styles.captionValue}>{target}</Text>
          </Text>
        </View>
      </View>

      {macros.length > 0 ? (
        <View style={styles.macros}>
          {macros.map((macro) => {
            const color = macroColor(colors, macro.key);
            const label = t(`macros.${MACRO_CONFIG[macro.key].labelKey}`);
            const macroProgress =
              macro.target > 0 ? Math.min(macro.current / macro.target, 1) : 0;
            const macroPercent =
              macro.target > 0 ? Math.round((macro.current / macro.target) * 100) : 0;

            const track = (
              <View style={[styles.macroTrack, !isCompact && styles.macroTrackInline, dir.row]}>
                <View
                  style={[
                    styles.macroFill,
                    { width: `${macroProgress * 100}%`, backgroundColor: color },
                  ]}
                />
              </View>
            );

            return (
              <View
                key={macro.key}
                style={isCompact ? styles.macroBlockCompact : undefined}
                accessible
                accessibilityLabel={`${label}: ${formatGrams(macro.current)} / ${formatGrams(macro.target)} ${gramsUnit}`}
              >
                <View style={[styles.macroRow, dir.row]}>
                  <Text
                    style={[styles.macroLabel, isCompact && styles.macroLabelCompact, dir.text]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>

                  {isCompact ? null : track}

                  <Text style={[styles.macroValue, endAlign]} numberOfLines={1}>
                    {formatGrams(macro.current)}
                    <Text style={styles.macroTarget}>
                      {" / "}
                      {formatGrams(macro.target)} {gramsUnit}
                    </Text>
                  </Text>

                  {showPercentages ? (
                    <Text style={[styles.macroPercent, endAlign]} numberOfLines={1}>
                      {macroPercent}%
                    </Text>
                  ) : null}
                </View>

                {isCompact ? track : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
