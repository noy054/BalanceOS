import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../shared/components/ui/IconButton";
import { DateKey, fromDateKey } from "../../../shared/helpers/dateKey";
import { useDirection } from "../../../shared/hooks/useDirection";
import { spacing, typography, useThemedStyles } from "../../../shared/theme";

type Props = {
  start: DateKey;
  end: DateKey;
  today: DateKey;
  weekOffset: number | null;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function StatsPeriodNavigator({ start, end, today, weekOffset, onPrevious, onNext }: Props) {
  const { t, i18n } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();

  const label = useMemo(() => {
    const from = fromDateKey(start);
    const to = fromDateKey(end);
    const showYear = from.getFullYear() !== to.getFullYear() || to.getFullYear() !== fromDateKey(today).getFullYear();
    const format = new Intl.DateTimeFormat(i18n.language, {
      day: "numeric",
      month: "short",
      ...(showYear ? { year: "numeric" as const } : {}),
    });
    return `${format.format(from)} – ${format.format(to)}`;
  }, [start, end, today, i18n.language]);

  const caption =
    weekOffset === 0 ? t("period.thisWeek") : weekOffset === -1 ? t("period.lastWeek") : null;
  const navigable = weekOffset !== null;

  return (
    <View style={[styles.row, dir.row]}>
      {navigable ? (
        <IconButton
          icon={dir.backIcon}
          variant="glass"
          size={40}
          accessibilityLabel={t("period.previousWeek")}
          onPress={() => onPrevious?.()}
        />
      ) : null}
      <View style={styles.center} accessible accessibilityRole="text" accessibilityLiveRegion="polite">
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {navigable ? (
        <IconButton
          icon={dir.forwardIcon}
          variant="glass"
          size={40}
          accessibilityLabel={t("period.nextWeek")}
          disabled={(weekOffset ?? 0) >= 0}
          onPress={() => onNext?.()}
        />
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
        minHeight: 44,
      },
      center: {
        flex: 1,
        alignItems: "center",
      },
      label: {
        ...typography.bodyStrong,
        ...typography.number,
        color: colors.textPrimary,
      },
      caption: {
        ...typography.caption,
        color: colors.textSecondary,
      },
    }),
  );
