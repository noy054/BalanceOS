import { ComponentProps, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { ScrollViewInstance } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, states, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { FoodCategory } from "../../pantry/helpers/pantryFilters";

const ICONS: Record<FoodCategory, ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
  all: "view-grid-outline",
  protein: "food-drumstick-outline",
  carbs: "barley",
  fat: "water-outline",
  vegetables: "carrot",
  fruits: "food-apple-outline",
};

type Props = {
  categories: ReadonlyArray<FoodCategory>;
  value: FoodCategory;
  onChange: (value: FoodCategory) => void;
};

export function FoodCategoryTiles({ categories, value, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const scrollRef = useRef<ScrollViewInstance>(null);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => {
        if (dir.isRTL) scrollRef.current?.scrollToEnd({ animated: false });
      }}
      contentContainerStyle={[styles.row, dir.row]}
    >
      {categories.map((category) => {
        const selected = category === value;
        const color = selected ? colors.accent : colors.textSecondary;
        return (
          <Pressable
            key={category}
            onPress={() => onChange(category)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [styles.tile, selected && styles.tileSelected, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name={ICONS[category]} size={20} color={color} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {t(`addItem.categories.${category}`)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        gap: 6,
        flexGrow: 1,
        paddingVertical: 4,
      },
      tile: {
        flexGrow: 1,
        minWidth: 50,
        height: 54,
        paddingHorizontal: 2,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: withAlpha(colors.gloss, 0.07),
        backgroundColor: colors.glassCard,
      },
      tileSelected: {
        borderColor: withAlpha(colors.accent, 0.8),
        backgroundColor: withAlpha(colors.calorieGauge, 0.08),
      },
      label: {
        fontFamily: fonts.semibold,
        fontSize: 11,
        lineHeight: 14,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
    }),
  );
