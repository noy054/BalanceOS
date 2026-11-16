import { useId } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Svg, {
  Defs,
  FeGaussianBlur,
  Filter,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

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
  const screenWidth = useWindowDimensions().width;
  const compact = screenWidth < 380;
  const styles = useStyles();
  const dir = useDirection();
  const labels = useDayLabels(today);

  const isToday = date === today;
  const fullDate = labels.full(date);
  const relative = isToday ? null : labels.relative(date);
  const dateLine = relative
    ? `${relative} · ${labels.dateLine(date)}`
    : labels.dateLine(date);

  const accent = dark ? colors.calorieGauge : colors.accent;

  const dateNode = (
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
  );

  const todayNode = isToday ? null : (
    <Pressable
      onPress={onToday}
      hitSlop={TODAY_HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={t("date.backToTodayA11y")}
      style={({ pressed }) => [
        styles.todayButton,
        dir.row,
        { borderColor: accent },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.todayDot, { backgroundColor: accent }]} />
      <Text style={[styles.todayLabel, { color: accent }]} numberOfLines={1}>
        {t("date.backToToday")}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.topRow, dir.row]}>
        <View style={[styles.titleBlock, dir.alignStart]}>{dateNode}</View>
        <View style={[styles.controls, dir.row]}>
          <IconButton
            icon={dir.backIcon}
            variant="glass"
            size={CONTROL_HEIGHT}
            iconSize={25}
            extraHitSlop={4}
            color={colors.textPrimary}
            style={styles.control}
            accessibilityLabel={t("date.previousDay")}
            onPress={onPrevious}
          />
          <IconButton
            icon="calendar-month-outline"
            variant="glass"
            size={CONTROL_HEIGHT}
            iconSize={24}
            extraHitSlop={4}
            color={colors.textPrimary}
            style={styles.control}
            accessibilityLabel={t("date.openCalendar")}
            onPress={onOpenCalendar}
          />
          <IconButton
            icon={dir.forwardIcon}
            variant="glass"
            size={CONTROL_HEIGHT}
            iconSize={25}
            extraHitSlop={4}
            color={colors.textPrimary}
            style={styles.control}
            accessibilityLabel={t("date.nextDay")}
            onPress={onNext}
            disabled={!canGoNext}
          />
        </View>
      </View>

      <View style={[styles.greetingRow, dir.row]}>
        <View style={[styles.titleBlock, dir.alignStart]}>
          <Text
            accessibilityRole="header"
            style={[
              styles.greeting,
              compact && styles.greetingCompact,
              dir.text,
            ]}
            numberOfLines={2}
          >
            {greeting}
          </Text>
          <View style={styles.underline}>
            <GreetingUnderline color={accent} dark={dark} flip={!dir.isRTL} />
          </View>
        </View>
        {todayNode}
      </View>
    </View>
  );
}

function GreetingUnderline({
  color,
  dark,
  flip,
}: {
  color: string;
  dark: boolean;
  flip: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fade = `underline-fade-${uid}`;
  const blur = `underline-blur-${uid}`;
  const width = UNDERLINE_WIDTH + 8;
  const height = 14;
  const d =
    "M 4 9.6 C 20 9.2, 38 8.2, 50 5.6 C 54 4.6, 57 3.8, 59 3.4 C 57.5 5.2, 54 7, 49 8.4 C 37 10.8, 20 11, 4 9.6 Z";

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={flip ? staticStyles.flipped : undefined}
    >
      <Defs>
        <LinearGradient id={fade} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity={0.1} />
          <Stop offset="0.55" stopColor={color} stopOpacity={0.9} />
          <Stop offset="0.85" stopColor={color} stopOpacity={1} />
          <Stop offset="1" stopColor={color} stopOpacity={0.5} />
        </LinearGradient>
        <Filter
          id={blur}
          x={0}
          y={0}
          width={width}
          height={height}
          filterUnits="userSpaceOnUse"
        >
          <FeGaussianBlur stdDeviation={1.8} />
        </Filter>
      </Defs>
      {dark ? (
        <Path d={d} fill={color} opacity={0.7} filter={`url(#${blur})`} />
      ) : null}
      <Path d={d} fill={`url(#${fade})`} />
    </Svg>
  );
}

const CONTROL_HEIGHT = 44;
const CONTROL_GAP = 8;
const HORIZONTAL_PADDING = 19;

const UNDERLINE_WIDTH = 55;
const DATE_HIT_SLOP = { top: 8, bottom: 8 };
const TODAY_HIT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 };

const staticStyles = StyleSheet.create({
  flipped: {
    transform: [{ scaleX: -1 }],
  },
});

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        paddingTop: 8,
        paddingBottom: 4,
        paddingHorizontal: HORIZONTAL_PADDING,
        gap: 6,
      },
      topRow: {
        alignItems: "center",
        gap: spacing.sm,
        minHeight: CONTROL_HEIGHT,
      },
      greetingRow: {
        alignItems: "center",
        gap: spacing.sm,
      },
      titleBlock: {
        flex: 1,
        minWidth: 0,
      },
      dateButton: {
        minHeight: 24,
        maxWidth: "100%",
        justifyContent: "center",
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      dateLine: {
        ...typography.body,
        fontSize: 15,
        lineHeight: 21,
        color: colors.textSecondary,
      },
      greeting: {
        marginTop: -3,
        fontFamily: fonts.headingMedium,
        fontSize: 24,
        lineHeight: 27,
        color: colors.textPrimary,
      },
      greetingCompact: {
        fontSize: 22,
        lineHeight: 28,
      },
      underline: {
        marginTop: -5,
        marginHorizontal: 5,
      },
      todayButton: {
        height: 36,
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        borderRadius: 18,
        borderWidth: 1,
        backgroundColor: colors.glassCard,
      },
      todayDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
      },
      todayLabel: {
        fontFamily: fonts.medium,
        fontSize: 14,
        lineHeight: 18,
        color: colors.accent,
      },
      controls: {
        alignItems: "center",
        gap: CONTROL_GAP,
      },
      control: {
        width: CONTROL_HEIGHT,
        height: CONTROL_HEIGHT,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
    }),
  );
