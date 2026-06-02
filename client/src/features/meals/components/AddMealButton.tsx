import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { colors } from "../../../shared/theme";
import { styles } from "./styles/AddMealButton.styles";

type Props = {
  onPress?: () => void;
};

export function AddMealButton({ onPress }: Props) {
  const { t, i18n } = useTranslation("dashboard");
  const isRTL = i18n.dir(i18n.language) === "rtl";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { flexDirection: isRTL ? "row-reverse" : "row" },
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[styles.iconCircle, isRTL ? styles.iconRTL : styles.iconLTR]}
      >
        <MaterialCommunityIcons
          name="plus"
          size={22}
          color={colors.primaryGreen}
        />
      </View>

      <Text style={styles.label}>{t("actions.addMeal")}</Text>
    </Pressable>
  );
}
