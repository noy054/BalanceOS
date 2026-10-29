import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { formatGrams } from "../../../shared/helpers/formatNumber";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { useServingFormat } from "../../pantry/hooks/useServingFormat";
import { CatalogProductData } from "../types";

type Column = {
  key: string;
  label: string;
  data: CatalogProductData | null;
};

type Props = {
  columns: Column[];
  highlightKey?: string;
};

type RowKey = "name" | "brand" | "serving" | "calories" | "protein" | "carbs" | "fat" | "fiber";

function macroValue(data: CatalogProductData, macro: "calories" | "protein" | "carbs" | "fat" | "fiber") {
  const perServing = data.nutritionBasis === "PER_SERVING";
  const map = {
    calories: perServing ? data.caloriesPerServing : data.caloriesPer100g,
    protein: perServing ? data.proteinPerServing : data.proteinPer100g,
    carbs: perServing ? data.carbsPerServing : data.carbsPer100g,
    fat: perServing ? data.fatPerServing : data.fatPer100g,
    fiber: perServing ? data.fiberPerServing : data.fiberPer100g,
  };
  const value = map[macro];
  return value == null ? "—" : formatGrams(value);
}

export function CatalogComparisonTable({ columns, highlightKey }: Props) {
  const { t } = useTranslation("settings");
  const { t: tPantry } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const format = useServingFormat();

  const rows: Array<{ key: RowKey; label: string; value: (data: CatalogProductData) => string }> = [
    { key: "name", label: t("catalogReview.fields.name"), value: (d) => d.name },
    { key: "brand", label: t("catalogReview.fields.brand"), value: (d) => d.brand ?? "—" },
    {
      key: "serving",
      label: t("catalogReview.fields.basis"),
      value: (d) => (d.nutritionBasis === "PER_SERVING" ? format.perServing(d) : tPantry("product.per100g")),
    },
    { key: "calories", label: tPantry("macros.calories"), value: (d) => macroValue(d, "calories") },
    { key: "protein", label: tPantry("macros.protein"), value: (d) => macroValue(d, "protein") },
    { key: "carbs", label: tPantry("macros.carbs"), value: (d) => macroValue(d, "carbs") },
    { key: "fat", label: tPantry("macros.fat"), value: (d) => macroValue(d, "fat") },
    { key: "fiber", label: tPantry("macros.fiber"), value: (d) => macroValue(d, "fiber") },
  ];

  const servingRow = {
    label: t("catalogReview.fields.serving"),
    value: (d: CatalogProductData) =>
      d.nutritionBasis === "PER_SERVING" || !d.servingSizeG ? "—" : format.perServing(d),
  };

  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow, dir.row]}>
        <Text style={[styles.labelCell, styles.headerText, dir.text]} />
        {columns.map((column) => (
          <Text
            key={column.key}
            style={[styles.cell, styles.headerText, column.key === highlightKey && styles.highlightText]}
            numberOfLines={2}
          >
            {column.label}
          </Text>
        ))}
      </View>

      {[...rows, { key: "servingSize" as const, ...servingRow }].map((row, index) => {
        const values = columns.map((column) => (column.data ? row.value(column.data) : "—"));
        const differs = new Set(values).size > 1;
        return (
          <View
            key={row.key}
            style={[styles.row, dir.row, index % 2 === 1 && styles.rowAlt]}
          >
            <Text style={[styles.labelCell, dir.text]} numberOfLines={2}>
              {row.label}
            </Text>
            {columns.map((column, columnIndex) => (
              <Text
                key={column.key}
                style={[
                  styles.cell,
                  differs && column.key === highlightKey && styles.changedCell,
                ]}
                numberOfLines={3}
              >
                {values[columnIndex]}
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      table: {
        borderRadius: radius.md,
        overflow: "hidden",
      },
      row: {
        alignItems: "center",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
      },
      rowAlt: { backgroundColor: colors.surfaceMuted },
      headerRow: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      headerText: {
        ...typography.caption,
        fontFamily: fonts.semibold,
        color: colors.textSecondary,
      },
      highlightText: { color: colors.accent },
      labelCell: {
        width: 76,
        ...typography.footnote,
        color: colors.textSecondary,
      },
      cell: {
        flex: 1,
        minWidth: 0,
        ...typography.footnote,
        ...typography.number,
        color: colors.textPrimary,
        textAlign: "center",
      },
      changedCell: {
        color: colors.accent,
        fontFamily: fonts.bold,
      },
    }),
  );
