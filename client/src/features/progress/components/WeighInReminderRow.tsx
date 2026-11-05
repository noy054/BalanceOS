import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { useNutritionSettings } from "../../settings/hooks/useSettings";

const REFERENCE_SUNDAY = new Date(2026, 10, 1);

export function WeighInReminderRow() {
  const { t, i18n } = useTranslation("progress");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const { data: settings } = useNutritionSettings();

  const summary = useMemo(() => {
    if (!settings?.weighInReminderEnabled || !settings.weighInReminderTime || settings.weighInReminderDays.length === 0) {
      return t("reminder.off");
    }
    const format = new Intl.DateTimeFormat(i18n.language, { weekday: "short" });
    const days = settings.weighInReminderDays.map((day) => {
      const date = new Date(REFERENCE_SUNDAY);
      date.setDate(REFERENCE_SUNDAY.getDate() + day);
      return format.format(date);
    });
    return t("reminder.summary", { days: days.join(", "), time: settings.weighInReminderTime });
  }, [settings, i18n.language, t]);

  return (
    <Pressable
      onPress={() => router.push("/(app)/settings/notifications")}
      accessibilityRole="button"
      accessibilityLabel={`${t("reminder.title")}: ${summary}`}
      style={({ pressed }) => [styles.row, dir.row, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
      <View style={styles.text}>
        <Text style={[styles.title, dir.text]}>{t("reminder.title")}</Text>
        <Text style={[styles.value, dir.text]} numberOfLines={1}>
          {summary}
        </Text>
      </View>
      <MaterialCommunityIcons name={dir.forwardIcon} size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 56,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      pressed: { opacity: 0.75 },
      text: { flex: 1, minWidth: 0, gap: 2 },
      title: { ...typography.bodyStrong, color: colors.textPrimary },
      value: { ...typography.footnote, ...typography.number, color: colors.textSecondary },
    }),
  );
