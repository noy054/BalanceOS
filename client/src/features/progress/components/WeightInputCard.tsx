import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputInstance } from "react-native";
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
const DIGIT_WIDTH = 15.5;

export function WeightInputCard({ value, onChange, previous, formatDate, error, disabled = false }: Props) {
  const { t, i18n } = useTranslation("progress");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  const unit = t("units.kg");
  const label = t("metrics.withUnit", { metric: t("metrics.weightKg"), unit });
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
  const inputWidth = Math.max(3, (value || "0.0").length) * DIGIT_WIDTH + 6;

  const hint = previous
    ? change != null && change !== 0
      ? t("entry.changeFromPrevious", { change: formatChange(change, i18n.language), unit, date: formatDate(previous.date) })
      : t("entry.previousValue", {
          value: formatMetricNumber(previous.value, i18n.language),
          unit,
          date: formatDate(previous.date),
        })
    : t("entry.weightOptional");

  return (
    <View style={styles.group}>
      <Text style={[styles.label, dir.text]}>{label}</Text>
      <View style={[styles.row, styles.ltr]}>
        <StepButton icon="minus" label={t("entry.decreaseWeight")} disabled={!canStep} onPress={() => step(-1)} />
        <Pressable
          onPress={() => inputRef.current?.focus()}
          disabled={disabled}
          accessible={false}
          style={[styles.frame, dir.row, focused && styles.frameFocused, error ? styles.frameError : null]}
        >
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChange}
            placeholder="0.0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            editable={!disabled}
            maxLength={5}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[styles.input, { width: inputWidth }]}
            accessibilityLabel={label}
            accessibilityHint={error ?? hint}
          />
          <Text style={styles.unit}>{unit}</Text>
        </Pressable>
        <StepButton icon="plus" label={t("entry.increaseWeight")} disabled={!canStep} onPress={() => step(1)} />
      </View>

      {error ? (
        <View style={[styles.messageRow, dir.row]} accessibilityLiveRegion="polite">
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
          <Text style={[styles.error, dir.text]}>{error}</Text>
        </View>
      ) : (
        <Text style={[styles.hint, dir.text]}>{hint}</Text>
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
      hitSlop={4}
      style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={disabled ? colors.textMuted : colors.textPrimary} />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      group: {
        marginBottom: spacing.md,
      },
      label: {
        ...typography.label,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs + 2,
      },
      row: {
        alignItems: "center",
        gap: spacing.sm,
      },
      ltr: {
        flexDirection: "row",
      },
      frame: {
        flex: 1,
        minWidth: 0,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      frameFocused: {
        borderColor: colors.accent,
      },
      frameError: {
        borderColor: colors.danger,
      },
      input: {
        height: 40,
        ...typography.number,
        fontFamily: fonts.medium,
        fontSize: 26,
        textAlign: "center",
        textAlignVertical: "center",
        includeFontPadding: false,
        color: colors.textPrimary,
        paddingVertical: 0,
        paddingHorizontal: 0,
      },
      unit: {
        fontFamily: fonts.regular,
        fontSize: 15,
        lineHeight: 20,
        color: colors.textSecondary,
      },
      step: {
        flexShrink: 0,
        width: 56,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      stepPressed: {
        opacity: 0.7,
      },
      messageRow: {
        alignItems: "center",
        gap: 4,
        marginTop: spacing.xs + 2,
      },
      hint: {
        ...typography.caption,
        ...typography.number,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: spacing.xs + 2,
      },
      error: {
        ...typography.caption,
        color: colors.danger,
      },
    }),
  );
