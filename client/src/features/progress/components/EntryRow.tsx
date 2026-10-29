import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { BODY_METRICS } from "../constants";
import { formatMetricNumber, metricUnitKey } from "../helpers/format";
import { BodyEntry } from "../types";

type Props = {
  entry: BodyEntry;
  dateLabel: string;
  onPress: () => void;
};

export function EntryRow({ entry, dateLabel, onPress }: Props) {
  const { t, i18n } = useTranslation("progress");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();

  const parts = BODY_METRICS.flatMap((metric) => {
    const value = entry[metric];
    if (value === null) return [];
    const formatted = `${formatMetricNumber(value, i18n.language)} ${t(metricUnitKey(metric))}`;
    return [metric === "weightKg" ? formatted : `${t(`metrics.${metric}`)} ${formatted}`];
  });
  const summary = parts.length > 0 ? parts.join(" · ") : t("history.noMeasurements");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[
        dateLabel,
        summary,
        entry.photos.length > 0 ? t("history.photoCount", { count: entry.photos.length }) : null,
        entry.note ? t("history.hasNote") : null,
      ]
        .filter(Boolean)
        .join(", ")}
      style={({ pressed }) => [styles.row, dir.row, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={[styles.date, dir.text]}>{dateLabel}</Text>
        <Text style={[styles.summary, dir.text]} numberOfLines={2}>
          {summary}
        </Text>
        {entry.note ? (
          <Text style={[styles.note, dir.text]} numberOfLines={1}>
            {entry.note}
          </Text>
        ) : null}
      </View>
      {entry.photos.length > 0 ? (
        <View style={[styles.photos, dir.row]}>
          <MaterialCommunityIcons name="image-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.photoCount}>{entry.photos.length}</Text>
        </View>
      ) : null}
      <MaterialCommunityIcons name={dir.forwardIcon} size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.md,
        minHeight: 56,
      },
      pressed: { backgroundColor: colors.surfaceMuted },
      text: { flex: 1, gap: spacing.xxs },
      date: { ...typography.bodyStrong, color: colors.textPrimary },
      summary: { ...typography.footnote, ...typography.number, color: colors.textSecondary },
      note: { ...typography.caption, color: colors.textMuted },
      photos: { alignItems: "center", gap: spacing.xxs },
      photoCount: { ...typography.caption, ...typography.number, color: colors.textSecondary },
    }),
  );
