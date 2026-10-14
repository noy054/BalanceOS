import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../shared/theme";
import { homeDashboardColors } from "../constants/homeDashboardTheme";
import { useStyles } from "./styles/CalorieSummaryCard.styles";

type Props = {
  eaten: number;
  target: number;
};

export function CalorieSummaryCard({ eaten, target }: Props) {
  const { t, i18n } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const pulse = useRef(new Animated.Value(0)).current;

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const remaining = Math.max(target - eaten, 0);
  const exceeded = Math.max(eaten - target, 0);
  const progress = target > 0 ? Math.min(eaten / target, 1) : 0;

  const rawProgressPercent =
    target > 0 ? Math.round((eaten / target) * 100) : 0;

  const progressPercent = Math.min(rawProgressPercent, 999);

  const isOverTarget = target > 0 && eaten > target;
  const isTargetReached = target > 0 && eaten === target;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.22],
  });

  const mainLabel = isOverTarget
    ? t("calories.overTargetLabel", { defaultValue: "חריגה מהיעד" })
    : isTargetReached
      ? t("calories.targetReachedLabel", { defaultValue: "הגעת ליעד" })
      : t("calories.remainingLabel", { defaultValue: "קלוריות נשארו" });

  const mainNumber = isOverTarget ? exceeded : remaining;

  const statusIcon = isOverTarget
    ? "alert-circle-outline"
    : isTargetReached
      ? "check-circle-outline"
      : "fire";

  const statusText = isOverTarget
    ? t("calories.overTargetShort", { defaultValue: "מעל היעד" })
    : isTargetReached
      ? t("calories.targetReachedShort", { defaultValue: "בול ביעד" })
      : t("calories.onTrack", { defaultValue: "במעקב" });

  return (
    <View style={styles.card}>
      <View style={styles.glow} />

      <View style={[styles.headerRow, isRTL && styles.rowRtl]}>
        <View
          style={[styles.statusPill, isOverTarget && styles.statusPillOver]}
        >
          <MaterialCommunityIcons
            name={statusIcon}
            size={16}
            color={isOverTarget ? colors.danger : homeDashboardColors.lime}
          />

          <Text
            style={[styles.statusText, isOverTarget && styles.statusTextOver]}
          >
            {statusText}
          </Text>
        </View>

        <View style={[styles.ringBadge, isOverTarget && styles.ringBadgeOver]}>
          <Text
            style={[styles.ringPercent, isOverTarget && styles.ringPercentOver]}
          >
            {progressPercent}%
          </Text>

          <Text style={styles.ringLabel}>
            {t("calories.used", { defaultValue: "נוצל" })}
          </Text>
        </View>
      </View>

      <View style={styles.heroArea}>
        <Text style={[styles.mainLabel, isRTL && styles.textRtl]}>
          {mainLabel}
        </Text>

        <View
          style={[styles.numberVisualWrap, isRTL && styles.numberVisualWrapRtl]}
        >
          <Animated.View
            style={[
              styles.numberPulse,
              isRTL && styles.numberPulseRtl,
              isOverTarget && styles.numberPulseOver,
              {
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />

          <View
            style={[
              styles.numberBlob,
              isRTL && styles.numberBlobRtl,
              isOverTarget && styles.numberBlobOver,
            ]}
          />

          <View
            style={[
              styles.numberAccentLine,
              isRTL && styles.numberAccentLineRtl,
              isOverTarget && styles.numberAccentLineOver,
            ]}
          />

          <View style={[styles.numberRow, isRTL && styles.rowRtl]}>
            <Text
              style={[styles.mainNumber, isOverTarget && styles.mainNumberOver]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.45}
            >
              {mainNumber}
            </Text>

            <Text style={styles.unit}>{t("calories.unit")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressArea}>
        <View style={[styles.progressTitleRow, isRTL && styles.rowRtl]}>
          <Text style={styles.progressTitle}>
            {t("calories.dailyProgress", { defaultValue: "צריכה יומית" })}
          </Text>

          <Text style={styles.progressValue}>
            {t("calories.progressValue", {
              eaten,
              target,
              defaultValue: `${eaten} / ${target}`,
            })}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              isOverTarget && styles.progressFillOver,
              {
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={[styles.statsRow, isRTL && styles.rowRtl]}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{eaten}</Text>
          <Text style={styles.statLabel}>
            {t("calories.eaten", { defaultValue: "נאכל" })}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statValue}>{target}</Text>
          <Text style={styles.statLabel}>
            {t("calories.target", { defaultValue: "יעד" })}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text
            style={[styles.statValue, isOverTarget && styles.statValueOver]}
          >
            {isOverTarget ? exceeded : remaining}
          </Text>

          <Text style={styles.statLabel}>
            {isOverTarget
              ? t("calories.exceeded", { defaultValue: "חריגה" })
              : t("calories.left", { defaultValue: "נותר" })}
          </Text>
        </View>
      </View>
    </View>
  );
}
