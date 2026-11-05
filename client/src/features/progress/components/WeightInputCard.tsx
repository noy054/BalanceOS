import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { METRIC_RANGES } from "../constants";
import { formatChange, formatMetricNumber } from "../helpers/format";
import { parseMeasurement } from "../helpers/entryForm";
import { MetricPoint } from "../types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  previous: MetricPoint | null;
  formatDate: (date: string) => string;
  error?: string;
  disabled?: boolean;
};

const STEP = 0.1;

export function WeightInputCard({ value, onChange, previous, formatDate, error, disabled = false }: Props) {
  const { t, i18n } = useTranslation("progress");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const unit = t("units.kg");
  const parsed = parseMeasurement(value);
  const current = typeof parsed === "number" ? parsed : null;
  const range = METRIC_RANGES.weightKg;

  function step(direction: 1 | -1) {
    const base = current ?? previous?.value ?? null;
    if (base == null) return;
    const next = Math.round((base + direction * STEP) * 10) / 10;
    onChange(String(Math.min(range.max, Math.max(range.min, next))));
  }

  const change = current != null && previous ? Math.round((current - previous.value) * 10) / 10 : null;
  const canStep = !disabled && (current != null || previous != null);

  return (
    <View style={styles.card}>
      <View style={[styles.row, dir.row]}>
        <StepButton icon="minus" label={t("entry.decreaseWeight")} disabled={!canStep} onPress={() => step(-1)} />
        <View style={[styles.field, dir.row]}>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={previous ? formatMetricNumber(previous.value, i18n.language) : "0.0"}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            editable={!disabled}
            maxLength={5}
            selectTextOnFocus
            style={[styles.input, { textAlign: dir.isRTL ? "left" : "right" }]}
            accessibilityLabel={t("metrics.withUnit", { metric: t("metrics.weightKg"), unit })}
          />
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <StepButton icon="plus" label={t("entry.increaseWeight")} disabled={!canStep} onPress={() => step(1)} />
      </View>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : previous ? (
        <Text style={styles.hint}>
          {change != null && change !== 0
            ? t("entry.changeFromPrevious", {
                change: formatChange(change, i18n.language),
                unit,
                date: formatDate(previous.date),
              })
            : t("entry.previousValue", {
                value: formatMetricNumber(previous.value, i18n.language),
                unit,
                date: formatDate(previous.date),
              })}
        </Text>
      ) : (
        <Text style={styles.hint}>{t("entry.weightOptional")}</Text>
      )}
    </View>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: "minus" | "plus";
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={disabled ? colors.textMuted : colors.textPrimary} />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      },
      row: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      field: {
        flex: 1,
        alignItems: "baseline",
        justifyContent: "center",
        gap: spacing.xs,
      },
      input: {
        width: 128,
        ...typography.display,
        ...typography.number,
        fontFamily: fonts.bold,
        fontSize: 44,
        lineHeight: 52,
        color: colors.textPrimary,
        paddingVertical: 0,
      },
      unit: {
        ...typography.headline,
        color: colors.textSecondary,
      },
      step: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.round,
        backgroundColor: colors.surfaceMuted,
      },
      stepPressed: {
        backgroundColor: colors.border,
      },
      hint: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
        textAlign: "center",
      },
      error: {
        ...typography.footnote,
        color: colors.danger,
        textAlign: "center",
      },
    }),
  );
