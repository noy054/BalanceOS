import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { DateKey } from "../../../shared/helpers/dateKey";
import {
  radius,
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
  onToday: () => void;
  onOpenCalendar: () => void;
};

export function DayHeader({ date, today, onPrevious, onNext, onToday, onOpenCalendar }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const labels = useDayLabels(today);

  const isToday = date === today;
  const title = labels.title(date);
  const fullDate = labels.full(date);
  const showFullDateAsTitle = labels.relative(date) === null;

  return (
    <View style={styles.container}>
      <View style={[styles.metaRow, dir.row]}>
        <Text style={[styles.overline, dir.text]} numberOfLines={1}>
          {showFullDateAsTitle ? labels.short(date) : fullDate}
        </Text>

        {!isToday ? (
          <Pressable
            onPress={onToday}
            accessibilityRole="button"
            accessibilityLabel={t("date.backToTodayA11y")}
            hitSlop={8}
            style={({ pressed }) => [styles.todayChip, dir.row, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="calendar-today" size={14} color={colors.accent} />
            <Text style={styles.todayLabel}>{t("date.backToToday")}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.row, dir.row]}>
        <Pressable
          onPress={onOpenCalendar}
          accessibilityRole="button"
          accessibilityLabel={t("date.openCalendarFor", { date: fullDate })}
          style={({ pressed }) => [styles.titleBlock, dir.row, pressed && styles.pressed]}
        >
          <Text
            style={[styles.title, dir.text]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            accessibilityRole="header"
          >
            {title}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textMuted} />
        </Pressable>

        <View style={[styles.controls, dir.row]}>
          <IconButton
            icon={dir.backIcon}
            size={40}
            iconSize={24}
            color={colors.textPrimary}
            accessibilityLabel={t("date.previousDay")}
            onPress={onPrevious}
          />
          <IconButton
            icon="calendar-month-outline"
            size={40}
            iconSize={21}
            color={colors.textPrimary}
            accessibilityLabel={t("date.openCalendar")}
            onPress={onOpenCalendar}
          />
          <IconButton
            icon={dir.forwardIcon}
            size={40}
            iconSize={24}
            color={colors.textPrimary}
            accessibilityLabel={t("date.nextDay")}
            onPress={onNext}
          />
        </View>
      </View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.ms,
      },
      metaRow: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.ms,
        minHeight: 28,
      },
      row: {
        alignItems: "center",
        gap: spacing.ms,
      },
      titleBlock: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: spacing.xs,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      overline: {
        flexShrink: 1,
        ...typography.caption,
        color: colors.textSecondary,
      },
      title: {
        flexShrink: 1,
        ...typography.title,
        color: colors.textPrimary,
      },
      controls: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.full,
        padding: 2,
      },
      todayChip: {
        alignItems: "center",
        gap: spacing.xs,
        minHeight: 28,
        paddingHorizontal: spacing.sm2,
        borderRadius: radius.full,
        backgroundColor: colors.accentSoft,
      },
      todayLabel: {
        ...typography.label,
        color: colors.accent,
      },
    }),
  );
