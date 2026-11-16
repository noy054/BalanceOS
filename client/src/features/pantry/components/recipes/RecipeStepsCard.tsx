import { useEffect, useRef } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputInstance } from "react-native";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useDirection } from "../../../../shared/hooks/useDirection";
import {
  fonts,
  radius,
  spacing,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../../shared/theme";
import { RecipeStepDraft } from "../../hooks/useAddRecipeForm";
import { DraggableList } from "../form/DraggableList";
import { IngredientSection } from "../form/IngredientSection";

type Props = {
  steps: RecipeStepDraft[];
  onAddStep: () => void;
  onChangeStep: (key: string, text: string) => void;
  onRemoveStep: (key: string) => void;
  onMoveStep: (from: number, to: number) => void;
  onDragActiveChange?: (active: boolean) => void;
};

export function RecipeStepsCard({
  steps,
  onAddStep,
  onChangeStep,
  onRemoveStep,
  onMoveStep,
  onDragActiveChange,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const inputs = useRef(new Map<string, TextInputInstance>());
  const focusNewStep = useRef(false);
  const lastKey = steps[steps.length - 1]?.key;

  useEffect(() => {
    if (!focusNewStep.current || !lastKey) return;
    focusNewStep.current = false;
    inputs.current.get(lastKey)?.focus();
  }, [lastKey]);

  function handleAddStep() {
    focusNewStep.current = true;
    onAddStep();
  }

  return (
    <IngredientSection
      title={t("recipe.stepsSection")}
      emptyText={t("recipe.stepsEmpty")}
      isEmpty={steps.length === 0}
      actions={[
        { key: "add", label: t("recipe.addStep"), onPress: handleAddStep },
      ]}
    >
      <DraggableList
        items={steps}
        keyOf={(step) => step.key}
        labelOf={(step) =>
          t("recipe.stepLabel", { number: steps.indexOf(step) + 1 })
        }
        onMove={onMoveStep}
        onDragActiveChange={onDragActiveChange}
        renderItem={(step, handle) => {
          const index = steps.indexOf(step);
          const number = index + 1;
          const label = t("recipe.stepLabel", { number });

          return (
            <View
              style={[
                styles.row,
                dir.row,
                index < steps.length - 1 && styles.divider,
              ]}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{number}</Text>
              </View>
              <TextInput
                ref={(input) => {
                  if (input) inputs.current.set(step.key, input);
                  else inputs.current.delete(step.key);
                }}
                style={[styles.input, dir.text]}
                value={step.text}
                onChangeText={(text) => onChangeStep(step.key, text)}
                placeholder={t("recipe.stepPlaceholder")}
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={1000}
                accessibilityLabel={label}
              />
              <View style={[styles.actions, dir.row]}>
                <IconButton
                  icon="close"
                  size={36}
                  iconSize={18}
                  color={colors.textMuted}
                  accessibilityLabel={t("recipe.removeStep", { number })}
                  onPress={() => onRemoveStep(step.key)}
                />
                {handle}
              </View>
            </View>
          );
        }}
      />
    </IngredientSection>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "flex-start",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.ms,
      },
      divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.glassBorder,
      },
      badge: {
        width: 28,
        height: 28,
        marginTop: 6,
        borderRadius: radius.round,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.accentSoft,
        borderWidth: 1,
        borderColor: colors.accentBorder,
      },
      badgeText: {
        ...typography.footnote,
        ...typography.number,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      input: {
        flex: 1,
        minWidth: 0,
        minHeight: 40,
        paddingVertical: spacing.sm,
        ...typography.body,
        color: colors.textPrimary,
      },
      actions: {
        alignItems: "center",
      },
    }),
  );
