import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../shared/theme";
import { MealShortcut } from "../types";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/MealShortcutCard.styles";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  shortcut: MealShortcut;
  onPress?: (type: MealShortcut["type"]) => void;
};

function getShortcutIcon(type: MealShortcut["type"]): IconName {
  switch (type) {
    case "BREAKFAST":
      return "coffee-outline";
    case "LUNCH":
      return "silverware-fork-knife";
    case "DINNER":
      return "food-outline";
    default:
      return "food-apple-outline";
  }
}

export function MealShortcutCard({ shortcut, onPress }: Props) {
  const { t, i18n } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const icon = getShortcutIcon(shortcut.type);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress?.(shortcut.type)}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={colors.primaryGreen}
        />
      </View>

      <Text
        style={[styles.label, dir.text]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        {t(`mealTypes.${shortcut.labelKey}`)}
      </Text>
    </Pressable>
  );
}
