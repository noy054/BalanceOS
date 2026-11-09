import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { withAlpha } from "../../../shared/helpers/progressColor";
import { useDirection } from "../../../shared/hooks/useDirection";
import {
  fonts,
  radius,
  spacing,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../shared/theme";
import {
  AmountSource,
  EditableAmount,
  editableAmount,
  formatAmountInput,
  parseAmountInput,
} from "../helpers/itemAmount";

const COMMIT_DELAY_MS = 500;
const SERVING_MULTIPLIERS = [0.5, 1, 2, 3] as const;
const CONTROL_HEIGHT = 32;

export type AmountChange = ReturnType<EditableAmount["toPayload"]>;

type Props = {
  name: string;
  source: AmountSource;
  onPreview: (change: AmountChange) => void;
  onCommit: (change: AmountChange) => void;
};

export function useAmountUnitLabel() {
  const { t } = useTranslation("dashboard");
  return (amount: EditableAmount | null) =>
    amount?.kind === "grams"
      ? t("itemSheet.unitGrams")
      : amount?.kind === "milliliters"
        ? t("itemSheet.unitMilliliters")
        : amount?.kind === "units"
          ? (amount.unit ?? t("itemSheet.unitServings"))
          : t("itemSheet.unitServings");
}

export function InlineQuantityEditor({
  name,
  source,
  onPreview,
  onCommit,
}: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();
  const unitLabelOf = useAmountUnitLabel();
  const amount = editableAmount(source);
  const initial = amount?.initial ?? null;
  const [text, setText] = useState(
    initial != null ? formatAmountInput(initial) : "",
  );
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const synced = useRef<number | null>(initial);
  const editing = useRef(false);

  useEffect(() => {
    if (editing.current || focused || timer.current || initial == null) return;
    synced.current = initial;
    setText(formatAmountInput(initial));
  }, [initial, focused]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!amount) return null;
  const unitLabel = unitLabelOf(amount);
  const current = parseAmountInput(text);

  function commit(value: string) {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    editing.current = false;
    if (!amount) return;
    const parsed = parseAmountInput(value);
    if (parsed == null) {
      const fallback = synced.current ?? amount.initial;
      setText(formatAmountInput(fallback));
      onPreview(amount.toPayload(fallback));
      return;
    }
    if (synced.current != null && Math.abs(parsed - synced.current) < 1e-9)
      return;
    synced.current = parsed;
    onCommit(amount.toPayload(parsed));
  }

  function change(value: string) {
    setText(value);
    if (!amount) return;
    const parsed = parseAmountInput(value);
    editing.current = true;
    if (parsed != null) onPreview(amount.toPayload(parsed));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      if (parsed != null) commit(value);
    }, COMMIT_DELAY_MS);
  }

  function step(direction: 1 | -1) {
    if (!amount) return;
    const base = parseAmountInput(text) ?? amount.initial;
    const stepped = Math.round((base + direction * amount.step) * 100) / 100;
    const next = Math.max(
      amount.min,
      direction < 0 && stepped <= 0 ? amount.min : stepped,
    );
    change(formatAmountInput(next));
  }

  const canDecrease = current == null || current > amount.min;
  const fromServings = amount.fromServings;
  const currentServings =
    current != null && amount.servingsOf ? amount.servingsOf(current) : null;

  return (
    <View style={styles.editor}>
      <View style={[styles.stepper, focused && styles.stepperFocused, styles.stepperRow]}>
        <StepButton
          icon="minus"
          label={t("ingredients.decrease", { name })}
          disabled={!canDecrease}
          onPress={() => step(-1)}
        />
        <View style={[styles.field, dir.row]}>
          <TextInput
            value={text}
            onChangeText={change}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              commit(text);
            }}
            onSubmitEditing={() => commit(text)}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            maxLength={7}
            style={[styles.input, { textAlign: dir.isRTL ? "left" : "right" }]}
            accessibilityLabel={t("ingredients.amountA11y", {
              name,
              unit: unitLabel,
            })}
          />
          <Text style={styles.unit} numberOfLines={1}>
            {unitLabel}
          </Text>
        </View>
        <StepButton
          icon="plus"
          label={t("ingredients.increase", { name })}
          onPress={() => step(1)}
        />
      </View>
      {fromServings ? (
        <View style={[styles.multipliers, dir.row]}>
          {SERVING_MULTIPLIERS.map((multiplier) => {
            const selected =
              currentServings != null &&
              Math.abs(currentServings - multiplier) < 1e-6;
            const label = `×${multiplier}`;
            return (
              <Pressable
                key={multiplier}
                onPress={() =>
                  change(formatAmountInput(fromServings(multiplier)))
                }
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={t("ingredients.servingsA11y", {
                  name,
                  count: multiplier,
                })}
                hitSlop={{ top: 6, bottom: 6 }}
                style={({ pressed }) => [
                  styles.multiplier,
                  selected && styles.multiplierSelected,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.multiplierText,
                    selected && styles.multiplierTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function StepButton({
  icon,
  label,
  disabled = false,
  onPress,
}: {
  icon: "minus" | "plus";
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        icon === "plus" && styles.buttonAccent,
        pressed && (icon === "plus" ? styles.buttonAccentPressed : styles.buttonPressed),
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={disabled ? colors.textMuted : icon === "plus" ? colors.accent : colors.textPrimary}
      />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      editor: {
        gap: spacing.xs,
      },
      multipliers: {
        justifyContent: "space-between",
        gap: 6,
      },
      multiplier: {
        flex: 1,
        height: 26,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: withAlpha(colors.gloss, 0.05),
      },
      multiplierSelected: {
        backgroundColor: withAlpha(colors.calorieGauge, 0.2),
      },
      multiplierText: {
        ...typography.caption,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textSecondary,
      },
      multiplierTextSelected: {
        color: colors.accent,
      },
      stepper: {
        alignItems: "center",
        height: CONTROL_HEIGHT,
        padding: 3,
        borderRadius: CONTROL_HEIGHT / 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: withAlpha(colors.gloss, 0.08),
        backgroundColor: withAlpha(colors.canvas, 0.55),
      },
      stepperRow: {
        flexDirection: "row",
      },
      stepperFocused: {
        borderColor: withAlpha(colors.calorieGauge, 0.6),
      },
      button: {
        width: 36,
        height: CONTROL_HEIGHT - 6,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: (CONTROL_HEIGHT - 6) / 2,
        backgroundColor: withAlpha(colors.gloss, 0.1),
      },
      buttonPressed: {
        backgroundColor: withAlpha(colors.gloss, 0.18),
      },
      buttonAccent: {
        backgroundColor: withAlpha(colors.calorieGauge, 0.28),
        backgroundImage: `linear-gradient(180deg, ${withAlpha(colors.calorieGauge, 0.42)} 0%, ${withAlpha(colors.calorieGaugeDeep, 0.5)} 100%)`,
      },
      buttonAccentPressed: {
        backgroundColor: withAlpha(colors.calorieGauge, 0.4),
      },
      field: {
        width: 64,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        paddingHorizontal: 4,
      },
      input: {
        flex: 1,
        minWidth: 0,
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
        paddingVertical: 0,
        paddingHorizontal: 0,
      },
      unit: {
        ...typography.caption,
        color: colors.textSecondary,
        maxWidth: 40,
      },
    }),
  );
