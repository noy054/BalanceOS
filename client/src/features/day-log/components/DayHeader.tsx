import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

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
  greeting: { salutation: string; name: string };
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
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const labels = useDayLabels(today);

  const isToday = date === today;
  const fullDate = labels.full(date);
  const relative = isToday ? null : labels.relative(date);
  const dateLine = relative ? `${relative} · ${labels.dateLine(date)}` : labels.dateLine(date);

  return (
    <View style={styles.root}>
      <View style={[styles.container, dir.row]}>
        <Pressable
          onPress={onOpenCalendar}
          accessibilityRole="button"
          accessibilityLabel={t("date.openCalendarFor", { date: fullDate })}
          style={({ pressed }) => [styles.titleBlock, pressed && styles.pressed]}
        >
          <Text style={[styles.dateLine, dir.text]} numberOfLines={1}>
            {dateLine}
          </Text>
          <View accessible accessibilityRole="header">
            <Text style={[styles.greeting, dir.text]} numberOfLines={2}>
              {greeting.salutation}
            </Text>
            {greeting.name ? (
              <Text style={[styles.greeting, dir.text]} numberOfLines={1}>
                {greeting.name}
              </Text>
            ) : null}
          </View>
        </Pressable>

        {!isToday ? (
          <Pressable
            onPress={onToday}
            accessibilityRole="button"
            accessibilityLabel={t("date.backToTodayA11y")}
            style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
          >
            <Text style={styles.todayLabel} numberOfLines={1}>
              {t("date.backToToday")}
            </Text>
          </Pressable>
        ) : null}

        <View style={[styles.controls, dir.row]}>
          <IconButton
            icon={dir.backIcon}
            variant="glass"
            size={40}
            iconSize={24}
            color={colors.textPrimary}
            accessibilityLabel={t("date.previousDay")}
            onPress={onPrevious}
          />
          <IconButton
            icon="calendar-month-outline"
            variant="glass"
            size={40}
            iconSize={20}
            accessibilityLabel={t("date.openCalendar")}
            onPress={onOpenCalendar}
          />
          <IconButton
            icon={dir.forwardIcon}
            variant="glass"
            size={40}
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

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
        paddingHorizontal: spacing.md,
      },
      container: {
        alignItems: "center",
        gap: spacing.xs,
      },
      titleBlock: {
        flex: 1,
        minWidth: 0,
        minHeight: 48,
        justifyContent: "center",
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      dateLine: {
        ...typography.callout,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
      },
      greeting: {
        ...typography.title,
        fontFamily: fonts.headingBold,
        fontSize: 26,
        lineHeight: 32,
        color: colors.textPrimary,
      },
      todayButton: {
        minHeight: 44,
        justifyContent: "center",
        paddingHorizontal: spacing.sm,
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
