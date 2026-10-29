import { Alert, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "../../../shared/components/ui/Button";
import { confirmAction } from "../../../shared/helpers/confirm";
import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { formatMetricNumber } from "../helpers/format";
import { useApplyProfileWeight } from "../hooks/useProgress";
import { MetricPoint } from "../types";

type Props = {
  profileWeightKg: number | null;
  latestWeight: MetricPoint | null;
  formatDate: (date: string) => string;
};

export function ProfileWeightCard({ profileWeightKg, latestWeight, formatDate }: Props) {
  const { t, i18n } = useTranslation("progress");
  const styles = useStyles();
  const dir = useDirection();
  const apply = useApplyProfileWeight();

  const kg = (value: number) => `${formatMetricNumber(value, i18n.language)} ${t("units.kg")}`;
  const differs = latestWeight !== null && latestWeight.value !== profileWeightKg;

  async function handleApply() {
    if (!latestWeight || apply.isPending) return;
    const confirmed = await confirmAction({
      title: t("profileWeight.confirmTitle"),
      message: t("profileWeight.confirmMessage", { value: kg(latestWeight.value) }),
      confirmLabel: t("profileWeight.confirm"),
      cancelLabel: t("entry.cancel"),
    });
    if (!confirmed) return;
    try {
      await apply.mutateAsync(latestWeight.value);
    } catch {
      Alert.alert("", t("profileWeight.failed"));
    }
  }

  return (
    <View style={styles.card}>
      <Text style={[styles.title, dir.text]}>{t("profileWeight.title")}</Text>
      <Text style={[styles.value, dir.text]}>
        {profileWeightKg !== null ? kg(profileWeightKg) : t("profileWeight.notSet")}
      </Text>
      <Text style={[styles.hint, dir.text]}>{t("profileWeight.explanation")}</Text>
      {differs && latestWeight ? (
        <Button
          label={t("profileWeight.useLatest", { value: kg(latestWeight.value), date: formatDate(latestWeight.date) })}
          variant="secondary"
          size="sm"
          onPress={handleApply}
          loading={apply.isPending}
          disabled={apply.isPending}
        />
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        gap: spacing.xs,
      },
      title: { ...typography.label, color: colors.textSecondary },
      value: { ...typography.value, color: colors.textPrimary },
      hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
    }),
  );
