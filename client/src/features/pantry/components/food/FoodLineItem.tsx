import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { MacroValues } from "./NutritionLine";
import { FoodCardValues } from "./FoodCardValues";

type Props = {
  title: string;
  meta?: string | null;
  calories?: number;
  macros?: MacroValues;
  last?: boolean;
  trailing?: ReactNode;
};

export function FoodLineItem({
  title,
  meta,
  calories,
  macros,
  last = false,
  trailing,
}: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={[styles.header, dir.row]}>
        <View style={styles.body}>
          <Text style={[styles.title, dir.text]} numberOfLines={2}>
            {title}
          </Text>
          {meta ? (
            <Text style={[styles.meta, dir.text]} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>

      {calories != null && macros ? (
        <FoodCardValues calories={calories} macros={macros} />
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        gap: spacing.sm2,
        paddingVertical: spacing.ms,
      },
      rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      header: {
        alignItems: "center",
        gap: spacing.sm,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      title: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      meta: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
    }),
  );
