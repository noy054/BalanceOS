import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { ChoiceChips } from "../../../../shared/components/ui/ChoiceChips";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { PortionChoice, useRecipeYieldForm, WeightMethod } from "../../hooks/useRecipeYieldForm";
import { LeftoverMode, NutritionTotals, PortionPlan, PortionTarget, PortionValues } from "../../types";

type Props = {
  form: ReturnType<typeof useRecipeYieldForm>;
  totals: NutritionTotals;
  showSaveHint: boolean;
  onIngredientWeight: (key: string, weightG: string) => void;
};

const LEFTOVER_MODES: LeftoverMode[] = ["SEPARATE", "REDISTRIBUTE", "UNALLOCATED"];

export function RecipePortionsCard({ form, totals, showSaveHint, onIngredientWeight }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const plan = form.plan;
  const weight = form.cookedWeightG;

  const targetLabel: Record<PortionTarget, string> = {
    GRAMS: t("portions.targetValueGrams"),
    CALORIES: t("portions.targetValueCalories"),
    PROTEIN: t("portions.targetValueProtein"),
  };
  const leftoverLabel: Record<LeftoverMode, string> = {
    SEPARATE: t("portions.leftoverSeparate"),
    REDISTRIBUTE: t("portions.leftoverRedistribute"),
    UNALLOCATED: t("portions.leftoverUnallocated"),
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.title, dir.text]} accessibilityRole="header">
        {t("portions.title")}
      </Text>
      <Text style={[styles.hint, dir.text]}>{t("portions.hint")}</Text>

      <View style={styles.panel}>
        <SegmentedControl<WeightMethod>
          options={[
            { value: "pot", label: t("portions.methodPot") },
            { value: "net", label: t("portions.methodNet") },
          ]}
          value={form.weightMethod}
          onChange={form.setWeightMethod}
          size="sm"
        />

        {form.weightMethod === "pot" ? (
          <View style={[styles.grid, dir.row]}>
            <View style={styles.cell}>
              <FormInput label={t("portions.emptyPot")} value={form.emptyPot} onChangeText={form.setEmptyPot} keyboardType="decimal-pad" />
            </View>
            <View style={styles.cell}>
              <FormInput
                label={t("portions.potWithFood")}
                value={form.potWithFood}
                onChangeText={form.setPotWithFood}
                keyboardType="decimal-pad"
                error={form.weightInvalid ? t("portions.weightInvalid") : undefined}
              />
            </View>
          </View>
        ) : (
          <FormInput label={t("portions.netWeight")} value={form.netWeight} onChangeText={form.setNetWeight} keyboardType="decimal-pad" />
        )}

        {weight ? (
          <View style={styles.result} accessibilityLiveRegion="polite">
            <Text style={[styles.resultStrong, dir.text]}>{t("portions.cookedResult", { grams: formatGrams(weight) })}</Text>
            <Text style={[styles.muted, dir.text]}>
              {t("portions.per100", {
                calories: formatCalories((totals.calories / weight) * 100),
                protein: formatGrams((totals.protein / weight) * 100),
              })}
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <Text style={[styles.label, dir.text]}>{t("portions.splitTitle")}</Text>
        <SegmentedControl<PortionChoice>
          options={[
            { value: "NONE", label: t("portions.choiceNone") },
            { value: "COUNT", label: t("portions.choiceCount") },
            { value: "TARGET", label: t("portions.choiceTarget") },
          ]}
          value={form.portionChoice}
          onChange={form.setPortionChoice}
          size="sm"
        />

        {form.portionChoice === "COUNT" ? (
          <FormInput label={t("portions.countLabel")} value={form.count} onChangeText={form.setCount} keyboardType="number-pad" />
        ) : null}

        {form.portionChoice === "TARGET" ? (
          <>
            <ChoiceChips<PortionTarget>
              options={[
                { value: "PROTEIN", label: t("portions.targetProtein") },
                { value: "CALORIES", label: t("portions.targetCalories") },
                { value: "GRAMS", label: t("portions.targetGrams") },
              ]}
              value={form.target}
              onChange={form.setTarget}
            />
            <FormInput
              label={targetLabel[form.target]}
              value={form.targetValue}
              onChangeText={form.setTargetValue}
              keyboardType="decimal-pad"
            />
          </>
        ) : null}

        {!weight && form.rawWeightG ? (
          <Text style={[styles.muted, dir.text]}>{t("portions.rawResult", { grams: formatGrams(form.rawWeightG) })}</Text>
        ) : null}

        {plan.status === "incomplete" ? (
          <View style={[styles.notice, dir.row]} accessibilityLiveRegion="polite">
            <MaterialCommunityIcons name="information-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.noticeText, dir.text]}>{t(`portions.issue.${plan.issue}`)}</Text>
          </View>
        ) : null}

        {form.weightlessIngredients.map((ingredient) => (
          <FormInput
            key={ingredient.key}
            label={t("portions.ingredientWeight", { name: ingredient.product.name })}
            value={ingredient.weightG ?? ""}
            onChangeText={(value) => onIngredientWeight(ingredient.key, value)}
            keyboardType="decimal-pad"
          />
        ))}

        {plan.status === "ok" ? (
          <View style={styles.planBox}>
            <Text style={[styles.resultStrong, dir.text]}>{t("portions.portionCount", { count: plan.fullPortions })}</Text>
            <PortionStats
              title={plan.leftover && plan.leftoverMode === "REDISTRIBUTE" ? t("portions.updatedPortion") : t("portions.perPortion")}
              values={plan.portion}
              highlight
              raw={plan.weightBasis === "raw"}
            />

            {plan.leftover ? (
              <>
                <PortionStats title={t("portions.leftoverTitle")} values={plan.leftover} raw={plan.weightBasis === "raw"} />
                <Text style={[styles.label, dir.text]}>{t("portions.leftoverAsk")}</Text>
                <View style={styles.options} accessibilityRole="radiogroup">
                  {LEFTOVER_MODES.map((mode) => {
                    const selected = form.leftoverMode === mode;
                    return (
                      <Pressable
                        key={mode}
                        onPress={() => form.setLeftoverMode(mode)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        style={({ pressed }) => [styles.option, dir.row, selected && styles.optionSelected, pressed && styles.pressed]}
                      >
                        <MaterialCommunityIcons
                          name={selected ? "radiobox-marked" : "radiobox-blank"}
                          size={20}
                          color={selected ? colors.accent : colors.textMuted}
                        />
                        <Text style={[styles.optionText, dir.text]}>{leftoverLabel[mode]}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {plan.leftoverMode === "REDISTRIBUTE" ? (
                  <Text style={[styles.muted, dir.text]}>
                    {`${t("portions.perPortion")}: ${portionHeadline(plan.basePortion, t)} → ${portionHeadline(plan.portion, t)}`}
                  </Text>
                ) : null}
                {showSaveHint && form.needsLeftoverChoice ? (
                  <Text style={[styles.error, dir.text]}>{t("portions.chooseLeftover")}</Text>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function RecipePortionSummary({ plan, cookedWeightG }: { plan: PortionPlan; cookedWeightG: number | null }) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  if (plan.status !== "ok" && !cookedWeightG) return null;
  return (
    <View style={styles.panel}>
      {cookedWeightG ? (
        <Text style={[styles.resultStrong, dir.text]}>{t("portions.cookedResult", { grams: formatGrams(cookedWeightG) })}</Text>
      ) : null}
      {plan.status === "ok" ? (
        <>
          <Text style={[styles.resultStrong, dir.text]}>{t("portions.portionCount", { count: plan.fullPortions })}</Text>
          <PortionStats title={t("portions.perPortion")} values={plan.portion} highlight raw={plan.weightBasis === "raw"} />
          {plan.leftover && plan.leftoverMode === "SEPARATE" ? (
            <PortionStats title={t("portions.smallPortion")} values={plan.leftover} raw={plan.weightBasis === "raw"} />
          ) : null}
          {plan.leftover && plan.leftoverMode === "UNALLOCATED" ? (
            <PortionStats title={t("portions.leftoverTitle")} values={plan.leftover} raw={plan.weightBasis === "raw"} />
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function portionHeadline(values: PortionValues, t: TFunction<"pantry">, raw = false) {
  const kcal = `${formatCalories(values.calories)} ${t("portions.kcal")}`;
  if (values.grams == null) return kcal;
  const grams = t(raw ? "portions.gramsRaw" : "portions.grams", { value: formatGrams(values.grams) });
  return `${grams} · ${kcal}`;
}

function PortionStats({
  title,
  values,
  highlight = false,
  raw = false,
}: {
  title: string;
  values: PortionValues;
  highlight?: boolean;
  raw?: boolean;
}) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { showCarbs, showFat, showFiber } = useMacroVisibility();
  const grams = (value: number) => t("portions.grams", { value: formatGrams(value) });
  const macros = [
    `${t("macros.protein")} ${grams(values.protein)}`,
    ...(showCarbs ? [`${t("macros.carbs")} ${grams(values.carbs)}`] : []),
    ...(showFat ? [`${t("macros.fat")} ${grams(values.fat)}`] : []),
    ...(showFiber ? [`${t("macros.fiber")} ${grams(values.fiber)}`] : []),
  ].join(" · ");

  return (
    <View style={[styles.stats, highlight && styles.statsHighlight]}>
      <View style={[styles.statsTop, dir.row]}>
        <Text style={[styles.statsTitle, dir.text]}>{title}</Text>
        <Text style={styles.statsValue}>{portionHeadline(values, t, raw)}</Text>
      </View>
      <Text style={[styles.muted, dir.text]}>{macros}</Text>
      {values.grams == null ? <Text style={[styles.muted, dir.text]}>{t("portions.weightUnknown")}</Text> : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { gap: spacing.sm },
      title: { ...typography.headline, color: colors.textPrimary },
      hint: { ...typography.caption, fontFamily: fonts.regular, color: colors.textMuted, marginTop: -spacing.xs },
      panel: {
        gap: spacing.ms,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      grid: { gap: spacing.ms },
      cell: { flex: 1, minWidth: 0 },
      result: { gap: 2, marginTop: -spacing.sm },
      resultStrong: { ...typography.bodyStrong, ...typography.number, color: colors.textPrimary },
      muted: { ...typography.footnote, ...typography.number, color: colors.textSecondary },
      divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.glassBorder },
      label: { ...typography.label, fontFamily: fonts.medium, color: colors.textSecondary },
      notice: { alignItems: "flex-start", gap: spacing.xs },
      noticeText: { flex: 1, ...typography.footnote, color: colors.textSecondary },
      planBox: { gap: spacing.sm },
      stats: {
        gap: 2,
        padding: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      statsHighlight: { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft },
      statsTop: { alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm, flexWrap: "wrap" },
      statsTitle: { ...typography.footnote, fontFamily: fonts.medium, color: colors.textSecondary },
      statsValue: { ...typography.callout, ...typography.number, fontFamily: fonts.medium, color: colors.textPrimary },
      options: { gap: spacing.xs },
      option: {
        alignItems: "center",
        gap: spacing.sm,
        minHeight: 44,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      optionSelected: { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft },
      optionText: { flex: 1, ...typography.callout, color: colors.textPrimary },
      pressed: { opacity: 0.75 },
      error: { ...typography.footnote, color: colors.danger },
    }),
  );
