import { useRef } from "react";
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import type { ScrollViewInstance } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../../shared/hooks/useDirection";
import { fonts, states, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { PANTRY_CHIP_FOCUSES, PantryChipFocus } from "../../helpers/pantryFilters";
import { ProductCategory } from "../../types";
import { PantrySort } from "../../helpers/pantrySort";

type Props = {
  focus: PantryChipFocus;
  onFocusChange: (focus: PantryChipFocus) => void;
  category: ProductCategory | null;
  onCategoryPress: () => void;
  sort: PantrySort;
  onSortPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PantryFilterBar({ focus, onFocusChange, category, onCategoryPress, sort, onSortPress, style }: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const scrollRef = useRef<ScrollViewInstance>(null);

  return (
    <View style={[styles.root, dir.row, style]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        onContentSizeChange={() => {
          if (dir.isRTL) scrollRef.current?.scrollToEnd({ animated: false });
        }}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[styles.chips, dir.row]}
      >
        {PANTRY_CHIP_FOCUSES.map((option) => (
          <Chip
            key={option}
            label={t(`filters.${option}`)}
            selected={focus === option}
            onPress={() => onFocusChange(option)}
          />
        ))}
        <Chip
          label={category ? t(`filters.categoryNames.${category}`) : t("filters.categories")}
          selected={category !== null}
          trailingIcon="chevron-down"
          onPress={onCategoryPress}
        />
      </ScrollView>
      <Pressable
        onPress={onSortPress}
        accessibilityRole="button"
        accessibilityLabel={t("filters.sortA11y", { sort: t(`sort.options.${sort}`) })}
        hitSlop={3}
        style={({ pressed }) => [styles.sortChip, sort !== "newest" && styles.sortChipActive, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="sort" size={20} color={sort !== "newest" ? colors.accent : colors.textPrimary} />
      </Pressable>
    </View>
  );
}

function Chip({
  label,
  selected,
  trailingIcon,
  onPress,
}: {
  label: string;
  selected: boolean;
  trailingIcon?: "chevron-down";
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const color = selected ? colors.onAccent : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={3}
      style={({ pressed }) => [styles.chip, dir.row, selected && styles.chipSelected, pressed && styles.pressed]}
    >
      <Text style={[styles.chipLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
      {trailingIcon ? <MaterialCommunityIcons name={trailingIcon} size={16} color={color} /> : null}
    </Pressable>
  );
}

const CHIP_HEIGHT = 38;

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        alignItems: "center",
        gap: 8,
      },
      scroll: {
        flexGrow: 1,
        flexShrink: 1,
      },
      chips: {
        gap: 6,
        paddingVertical: 2,
      },
      chip: {
        height: CHIP_HEIGHT,
        paddingHorizontal: 12,
        alignItems: "center",
        gap: 2,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      chipSelected: {
        backgroundColor: colors.accentFill,
        borderColor: colors.accentFill,
      },
      chipLabel: {
        fontFamily: fonts.semibold,
        fontSize: 13.5,
        lineHeight: 18,
      },
      sortChip: {
        width: CHIP_HEIGHT,
        height: CHIP_HEIGHT,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      sortChipActive: {
        borderColor: colors.accent,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
    }),
  );
