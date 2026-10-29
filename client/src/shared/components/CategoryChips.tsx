import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import { ProductCategory } from "../../features/pantry/types";
import { radius, spacing, typography, useThemedStyles } from "../theme";

type Props = {
  categories: ProductCategory[];
  isRTL: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CategoryChips({ categories, isRTL, style }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();

  if (categories.length === 0) return null;

  return (
    <View
      style={[
        styles.row,
        { flexDirection: isRTL ? "row-reverse" : "row" },
        style,
      ]}
    >
      {categories.map((cat) => (
        <View key={cat} style={styles.chip}>
          <Text style={styles.chipText}>
            {t(`categories.${cat}` as Parameters<typeof t>[0])}
          </Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        flexWrap: "wrap",
        gap: spacing.xs + 2,
      },
      chip: {
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
        borderRadius: radius.round,
        backgroundColor: colors.accentSoft,
      },
      chipText: {
        ...typography.caption,
        color: colors.accent,
      },
    }),
  );
