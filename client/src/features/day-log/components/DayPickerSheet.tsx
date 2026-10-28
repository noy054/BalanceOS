import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { Button } from "../../../shared/components/ui/Button";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import {
  addDays,
  addMonths,
  DateKey,
  endOfMonth,
  fromDateKey,
  startOfMonth,
} from "../../../shared/helpers/dateKey";
import { spacing, typography, useThemedStyles } from "../../../shared/theme";
import { useDayLabels } from "../hooks/useDayLabels";
import { useDayLogCalendar } from "../hooks/useDayLog";

type Props = {
  visible: boolean;
  date: DateKey;
  today: DateKey;
  onSelect: (date: DateKey) => void;
  onClose: () => void;
  title?: string;
  showMarkers?: boolean;
  minDate?: DateKey;
};

const DAY_SIZE = 40;

function buildMonthGrid(monthKey: DateKey): Array<DateKey | null> {
  const first = startOfMonth(monthKey);
  const leading = fromDateKey(first).getDay();
  const length = Number(endOfMonth(monthKey).slice(8, 10));
  const cells: Array<DateKey | null> = Array.from({ length: leading }, () => null);
  for (let day = 0; day < length; day += 1) {
    cells.push(addDays(first, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

export function DayPickerSheet({
  visible,
  date,
  today,
  onSelect,
  onClose,
  title,
  showMarkers = true,
  minDate,
}: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();
  const labels = useDayLabels(today);
  const [month, setMonth] = useState(() => startOfMonth(date));

  useEffect(() => {
    if (visible) setMonth(startOfMonth(date));
  }, [visible, date]);

  const { data: calendar } = useDayLogCalendar(month, endOfMonth(month), visible && showMarkers);

  const logged = useMemo(
    () => new Map((calendar?.days ?? []).map((day) => [day.date, day])),
    [calendar],
  );

  const weeks = useMemo(() => chunk(buildMonthGrid(month), 7), [month]);

  function select(key: DateKey) {
    onSelect(key);
    onClose();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title ?? t("date.calendarTitle")}
      footer={
        date !== today ? (
          <Button
            label={t("date.goToToday")}
            variant="secondary"
            icon="calendar-today"
            onPress={() => select(today)}
            fullWidth
          />
        ) : undefined
      }
    >
      <View style={styles.calendar}>
        <View style={[styles.monthRow, dir.row]}>
          <IconButton
            icon={dir.backIcon}
            size={40}
            iconSize={24}
            accessibilityLabel={t("date.previousMonth")}
            onPress={() => setMonth((current) => addMonths(current, -1))}
          />
          <Text style={styles.monthTitle} accessibilityRole="header">
            {labels.monthTitle(month)}
          </Text>
          <IconButton
            icon={dir.forwardIcon}
            size={40}
            iconSize={24}
            accessibilityLabel={t("date.nextMonth")}
            onPress={() => setMonth((current) => addMonths(current, 1))}
          />
        </View>

        <View style={[styles.week, dir.row]}>
          {labels.weekdayInitials.map((weekday) => (
            <Text key={weekday.long} style={styles.weekday} accessibilityLabel={weekday.long}>
              {weekday.short}
            </Text>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={[styles.week, dir.row]}>
            {week.map((key, dayIndex) => {
              if (!key) return <View key={`empty-${dayIndex}`} style={styles.cell} />;

              const isSelected = key === date;
              const disabled = Boolean(minDate && key < minDate);
              const isToday = key === today;
              const entry = logged.get(key);
              const a11yLabel = [
                labels.full(key),
                isToday ? t("date.today") : null,
                entry ? t("date.itemsLogged", { count: entry.itemCount }) : null,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <Pressable
                  key={key}
                  onPress={() => select(key)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled }}
                  accessibilityLabel={a11yLabel}
                  style={styles.cell}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.day,
                        isToday && styles.dayToday,
                        isSelected && styles.daySelected,
                        pressed && !isSelected && styles.dayPressed,
                        disabled && styles.dayDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          isToday && styles.dayNumberToday,
                          isSelected && styles.dayNumberSelected,
                        ]}
                      >
                        {Number(key.slice(8, 10))}
                      </Text>
                      <View
                        style={[
                          styles.marker,
                          entry && styles.markerVisible,
                          entry && isSelected && styles.markerSelected,
                        ]}
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      calendar: {
        gap: spacing.xs,
      },
      monthRow: {
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.xs,
      },
      monthTitle: {
        flex: 1,
        textAlign: "center",
        ...typography.headline,
        color: colors.textPrimary,
      },
      week: {
        justifyContent: "space-between",
      },
      weekday: {
        flex: 1,
        textAlign: "center",
        ...typography.caption,
        color: colors.textMuted,
        paddingVertical: spacing.xs,
      },
      cell: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: DAY_SIZE + 4,
      },
      day: {
        width: DAY_SIZE,
        height: DAY_SIZE,
        borderRadius: DAY_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
      },
      dayToday: {
        borderWidth: 1.5,
        borderColor: colors.accent,
      },
      daySelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
      },
      dayPressed: {
        backgroundColor: colors.surfaceMuted,
      },
      dayDisabled: {
        opacity: 0.3,
      },
      dayNumber: {
        ...typography.callout,
        ...typography.number,
        fontWeight: "500",
        color: colors.textPrimary,
        marginTop: 4,
      },
      dayNumberToday: {
        color: colors.accent,
        fontWeight: "700",
      },
      dayNumberSelected: {
        color: colors.onAccent,
        fontWeight: "700",
      },
      marker: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 2,
      },
      markerVisible: {
        backgroundColor: colors.textMuted,
      },
      markerSelected: {
        backgroundColor: colors.onAccent,
      },
    }),
  );
