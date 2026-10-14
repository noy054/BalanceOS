import { useEffect, useRef } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { MEAL_TYPES } from "../../constants";
import { MealType } from "../../types";
import { useStyles } from "./styles/SavedMealTypeSelector.styles";

type Props = {
  selectedMealType: MealType | null;
  isRTL: boolean;
  onSelect: (mealType: MealType | null) => void;
};

export function SavedMealTypeSelector({
  selectedMealType,
  isRTL,
  onSelect,
}: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isRTL) {
      return;
    }

    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 0);

    return () => clearTimeout(timeout);
  }, [isRTL]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.mealTypeScroll}
      contentContainerStyle={[
        styles.mealTypeRow,
        {
          flexDirection: isRTL ? "row-reverse" : "row",
        },
      ]}
      onContentSizeChange={() => {
        if (isRTL) {
          scrollRef.current?.scrollToEnd({ animated: false });
        }
      }}
    >
      {MEAL_TYPES.map((type) => {
        const isActive = selectedMealType === type;

        return (
          <Pressable
            key={type}
            style={({ pressed }) => [
              styles.mealTypeChip,
              isActive && styles.mealTypeChipActive,
              pressed && styles.chipPressed,
            ]}
            onPress={() => onSelect(isActive ? null : type)}
          >
            <Text
              style={[
                styles.mealTypeText,
                isActive && styles.mealTypeTextActive,
                {
                  textAlign: "center",
                  writingDirection: isRTL ? "rtl" : "ltr",
                },
              ]}
              numberOfLines={1}
            >
              {t(`mealTypes.${type}` as Parameters<typeof t>[0])}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
