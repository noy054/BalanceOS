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
};

export function DayHeader({
  date,
  today,
  onPrevious,
  onNext,
  canGoNext = true,
  onToday,
  onOpenCalendar,
}: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const labels = useDayLabels(today);

  const isToday = date === today;
  const fullDate = labels.full(date);
  const showFullDateAsTitle = labels.relative(date) === null;

  return (
    <View style={[styles.container, dir.row]}>
      <Pressable
        onPress={onOpenCalendar}
        accessibilityRole="button"
        accessibilityLabel={t("date.openCalendarFor", { date: fullDate })}
        style={({ pressed }) => [styles.titleBlock, pressed && styles.pressed]}
      >
        <Text
          style={[styles.title, dir.text]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          accessibilityRole="header"
        >
          {labels.title(date)}
        </Text>
        <Text style={[styles.subtitle, dir.text]} numberOfLines={1}>
          {showFullDateAsTitle ? labels.short(date) : fullDate}
        </Text>
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
          variant="tonal"
          size={40}
          iconSize={24}
          color={colors.textPrimary}
          accessibilityLabel={t("date.previousDay")}
          onPress={onPrevious}
        />
        <IconButton
          icon="calendar-month-outline"
          variant="accent"
          size={40}
          iconSize={20}
          accessibilityLabel={t("date.openCalendar")}
          onPress={onOpenCalendar}
        />
        <IconButton
          icon={dir.forwardIcon}
          variant="tonal"
          size={40}
          iconSize={24}
          color={colors.textPrimary}
          accessibilityLabel={t("date.nextDay")}
          onPress={onNext}
          disabled={!canGoNext}
        />
      </View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        alignItems: "center",
        gap: spacing.xs,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
        paddingHorizontal: spacing.md,
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
      title: {
        ...typography.title,
        fontSize: 24,
        lineHeight: 30,
        color: colors.textPrimary,
      },
      subtitle: {
        ...typography.footnote,
        color: colors.textSecondary,
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
