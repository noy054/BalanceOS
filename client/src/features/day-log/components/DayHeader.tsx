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

  const greetingSize = compact ? 22 : 24;
  const stacked = !fitsBeside(
    greeting,
    greetingSize,
    screenWidth - HORIZONTAL_PADDING * 2 - ACTIONS_WIDTH,
  );

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

  const greetingNode = (
    <>
      <Text
        accessibilityRole="header"
        style={[styles.greeting, compact && styles.greetingCompact, dir.text]}
        numberOfLines={3}
      >
        {greeting}
      </Text>
      <View style={styles.underline}>
        <GreetingUnderline color={accent} dark={dark} flip={!dir.isRTL} />
      </View>
    </>
  );

  const actionsNode = (
    <View style={[styles.actions, stacked && styles.actionsStacked, dir.row]}>
      {isToday ? (
        <View
          style={[styles.todayButton, dir.row]}
          accessible
          accessibilityLabel={t("date.today")}
        >
          <View
            style={[
              styles.todayDot,
              { backgroundColor: accent, boxShadow: `0 0 6px ${accent}` },
            ]}
          />
          <Text
            style={[styles.todayLabel, { color: accent }]}
            numberOfLines={1}
          >
            {t("date.today")}
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={onToday}
          hitSlop={TODAY_HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={t("date.backToTodayA11y")}
          style={({ pressed }) => [
            styles.todayButton,
            dir.row,
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.todayDot,
              styles.todayDotHollow,
              { borderColor: accent },
            ]}
          />
          <Text
            style={[styles.todayLabel, { color: accent }]}
            numberOfLines={1}
          >
            {t("date.backToToday")}
          </Text>
        </Pressable>
      )}

      <View style={[styles.controls, dir.row]}>
        <IconButton
          icon={dir.backIcon}
          variant="glass"
          size={CONTROL_HEIGHT}
          iconSize={20}
          color={colors.textPrimary}
          style={styles.control}
          accessibilityLabel={t("date.previousDay")}
          onPress={onPrevious}
        />
        <IconButton
          icon="calendar-month-outline"
          variant="glass"
          size={CONTROL_HEIGHT}
          iconSize={17}
          color={colors.textPrimary}
          style={styles.control}
          accessibilityLabel={t("date.openCalendar")}
          onPress={onOpenCalendar}
        />
        <IconButton
          icon={dir.forwardIcon}
          variant="glass"
          size={CONTROL_HEIGHT}
          iconSize={20}
          color={colors.textPrimary}
          style={styles.control}
          accessibilityLabel={t("date.nextDay")}
          onPress={onNext}
          disabled={!canGoNext}
        />
      </View>
    </View>
  );

  if (stacked) {
    return (
      <View style={styles.rootStacked}>
        <View style={[styles.stackedTop, dir.row]}>
          <View style={[styles.titleBlock, dir.alignStart]}>{dateNode}</View>
          {actionsNode}
        </View>
        <View style={dir.alignStart}>{greetingNode}</View>
      </View>
    );
  }

  return (
    <View style={[styles.root, dir.row]}>
      <View style={[styles.titleBlock, dir.alignStart]}>
        {dateNode}
        {greetingNode}
      </View>
      {actionsNode}
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

const CONTROL_HEIGHT = 27;
const HORIZONTAL_PADDING = 19;
const ACTIONS_WIDTH = 208;

function fitsBeside(text: string, fontSize: number, room: number) {
  const charWidth = fontSize * 0.62;
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/)) {
    const width = word.length * charWidth;
    if (width > room) return false;
    const next = used === 0 ? width : used + charWidth * 0.5 + width;
    if (next > room) {
      lines += 1;
      used = width;
    } else {
      used = next;
    }
  }
  return lines <= 2;
}
const UNDERLINE_WIDTH = 55;
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
        alignItems: "flex-start",
        paddingTop: 8,
        paddingBottom: 4,
        paddingHorizontal: HORIZONTAL_PADDING,
        gap: spacing.sm,
      },
      rootStacked: {
        paddingTop: 8,
        paddingBottom: 4,
        paddingHorizontal: HORIZONTAL_PADDING,
        gap: 4,
      },
      stackedTop: {
        alignItems: "center",
        gap: spacing.sm,
      },
      actionsStacked: {
        marginTop: 0,
        gap: 14,
      },
      titleBlock: {
        flex: 1,
        minWidth: 0,
      },
      dateButton: {
        minHeight: 20,
        justifyContent: "center",
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      dateLine: {
        ...typography.callout,
        lineHeight: 20,
        color: colors.textSecondary,
      },
      greeting: {
        marginTop: -3,
        fontFamily: fonts.headingBold,
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
      actions: {
        alignItems: "center",
        marginTop: 9.5,
        height: CONTROL_HEIGHT,
        gap: 27,
      },
      todayButton: {
        minHeight: 20,
        alignItems: "center",
        gap: 6,
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
        fontFamily: fonts.bold,
        fontSize: 12,
        lineHeight: 16,
        color: colors.accent,
      },
      controls: {
        alignItems: "center",
        gap: 7.5,
      },
      control: {
        width: 31,
        height: CONTROL_HEIGHT,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
    }),
  );
