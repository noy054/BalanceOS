import { useId } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";
import Svg, { Defs, FeGaussianBlur, Filter, LinearGradient, Path, Stop } from "react-native-svg";

import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { DateKey } from "../../../shared/helpers/dateKey";
import {
  fonts,
  spacing,
  states,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../shared/theme";
import { useDayLabels } from "../hooks/useDayLabels";

type Props = {
  date: DateKey;
  today: DateKey;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext?: boolean;
  onToday: () => void;
  onOpenCalendar: () => void;
  greeting: string;
};

export function DayHeader({
  date,
  today,
  onPrevious,
  onNext,
  canGoNext = true,
  onToday,
  onOpenCalendar,
  greeting,
}: Props) {
  const { t } = useTranslation("dashboard");
  const { colors, resolvedTheme } = useAppTheme();
  const dark = resolvedTheme === "dark";
  const compact = useWindowDimensions().width < 380;
  const controlSize = compact ? 40 : 44;
  const styles = useStyles();
  const dir = useDirection();
  const labels = useDayLabels(today);

  const isToday = date === today;
  const fullDate = labels.full(date);
  const relative = isToday ? null : labels.relative(date);
  const dateLine = relative ? `${relative} · ${labels.dateLine(date)}` : labels.dateLine(date);

  const accent = dark ? colors.calorieGauge : colors.accent;

  return (
    <View style={styles.root}>
      <View style={[styles.dateRow, dir.row]}>
        <Pressable
          onPress={onOpenCalendar}
          accessibilityRole="button"
          accessibilityLabel={t("date.openCalendarFor", { date: fullDate })}
          hitSlop={DATE_HIT_SLOP}
          style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}
        >
          <Text style={[styles.dateLine, dir.text]} numberOfLines={1}>
            {dateLine}
          </Text>
        </Pressable>

        {isToday ? (
          <View style={[styles.todayButton, dir.row]} accessible accessibilityLabel={t("date.today")}>
            <View style={[styles.todayDot, { backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }]} />
            <Text style={[styles.todayLabel, { color: accent }]} numberOfLines={1}>
              {t("date.today")}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onToday}
            hitSlop={TODAY_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={t("date.backToTodayA11y")}
            style={({ pressed }) => [styles.todayButton, dir.row, pressed && styles.pressed]}
          >
            <View style={[styles.todayDot, styles.todayDotHollow, { borderColor: accent }]} />
            <Text style={[styles.todayLabel, { color: accent }]} numberOfLines={1}>
              {t("date.backToToday")}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.container, dir.row]}>
        <View style={[styles.titleBlock, dir.alignStart]}>
          <Text
            accessibilityRole="header"
            style={[styles.greeting, compact && styles.greetingCompact, dir.text]}
            numberOfLines={3}
          >
            {greeting}
          </Text>
          <GreetingUnderline color={accent} dark={dark} flip={dir.isRTL} />
        </View>

        <View style={[styles.controls, dir.row]}>
          <IconButton
            icon={dir.backIcon}
            variant="glass"
            size={controlSize}
            iconSize={24}
            color={colors.textPrimary}
            accessibilityLabel={t("date.previousDay")}
            onPress={onPrevious}
          />
          <IconButton
            icon="calendar-month-outline"
            variant="glass"
            size={controlSize}
            iconSize={20}
            accessibilityLabel={t("date.openCalendar")}
            onPress={onOpenCalendar}
          />
          <IconButton
            icon={dir.forwardIcon}
            variant="glass"
            size={controlSize}
            iconSize={24}
            color={colors.textPrimary}
            accessibilityLabel={t("date.nextDay")}
            onPress={onNext}
            disabled={!canGoNext}
          />
        </View>
      </View>
    </View>
  );
}

function GreetingUnderline({ color, dark, flip }: { color: string; dark: boolean; flip: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fade = `underline-fade-${uid}`;
  const blur = `underline-blur-${uid}`;
  const width = 116;
  const height = 18;
  const d = "M 6 11 C 34 6.5, 74 5, 110 7.2 C 76 8.4, 38 10.4, 6 13 Z";

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={flip ? staticStyles.flipped : undefined}>
      <Defs>
        <LinearGradient id={fade} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity={0.15} />
          <Stop offset="0.35" stopColor={color} stopOpacity={1} />
          <Stop offset="1" stopColor={color} stopOpacity={0.2} />
        </LinearGradient>
        <Filter id={blur} x={0} y={0} width={width} height={height} filterUnits="userSpaceOnUse">
          <FeGaussianBlur stdDeviation={2.4} />
        </Filter>
      </Defs>
      {dark ? <Path d={d} fill={color} opacity={0.75} filter={`url(#${blur})`} /> : null}
      <Path d={d} fill={`url(#${fade})`} />
    </Svg>
  );
}

const DATE_HIT_SLOP = { top: 8, bottom: 8 };
const TODAY_HIT_SLOP = { top: 8, bottom: 8, left: 4, right: 4 };

const staticStyles = StyleSheet.create({
  flipped: {
    transform: [{ scaleX: -1 }],
  },
});

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
        paddingHorizontal: spacing.md,
      },
      dateRow: {
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 28,
      },
      dateButton: {
        flexShrink: 1,
        minWidth: 0,
        minHeight: 28,
        justifyContent: "center",
      },
      container: {
        alignItems: "center",
        gap: spacing.sm,
      },
      titleBlock: {
        flex: 1,
        minWidth: 0,
        minHeight: 48,
        justifyContent: "center",
      },
      greetingCompact: {
        fontSize: 26,
        lineHeight: 32,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      dateLine: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      greeting: {
        ...typography.title,
        fontFamily: fonts.headingBold,
        fontSize: 30,
        lineHeight: 36,
        color: colors.textPrimary,
      },
      todayButton: {
        minHeight: 28,
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
      },
      todayDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
      },
      todayDotHollow: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
      },
      todayLabel: {
        ...typography.label,
        fontSize: 14,
        fontFamily: fonts.semibold,
        color: colors.accent,
      },
      controls: {
        alignItems: "center",
        gap: spacing.xs + 2,
      },
    }),
  );
