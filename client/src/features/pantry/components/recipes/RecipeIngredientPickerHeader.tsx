import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { useStyles } from "./styles/RecipeIngredientPickerHeader.styles";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  dir: DirectionStyles;
  onClose: () => void;
};

export function RecipeIngredientPickerHeader({ dir, onClose }: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  return (
    <View style={[styles.header, dir.row]}>
      <Text style={[styles.title, dir.text]}>{t("picker.productsTitle")}</Text>

      <Pressable onPress={onClose} hitSlop={12}>
        <MaterialCommunityIcons
          name="close"
          size={24}
          color={colors.textPrimary}
        />
      </Pressable>
    </View>
  );
}
