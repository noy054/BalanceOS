import { Pressable, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { useStyles } from "./styles/RecipeIngredientPickerSearchActions.styles";

type DirectionStyles = ReturnType<
  typeof import("./styles/RecipeIngredientPickerModal.styles").getDirectionStyles
>;

type Props = {
  search: string;
  dir: DirectionStyles;
  onChangeSearch: (value: string) => void;
  onAddProduct: () => void;
  onScanBarcode: () => void;
};

export function RecipeIngredientPickerSearchActions({
  search,
  dir,
  onChangeSearch,
  onAddProduct,
  onScanBarcode,
}: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  return (
    <>
      <View style={[styles.searchRow, dir.row]}>
        <MaterialCommunityIcons
          name="magnify"
          size={18}
          color={colors.textMuted}
        />

        <TextInput
          style={[styles.searchInput, dir.input]}
          value={search}
          onChangeText={onChangeSearch}
          placeholder={t("picker.searchPlaceholder")}
          placeholderTextColor={colors.textMuted}
          autoFocus={false}
          returnKeyType="search"
        />
      </View>

      <View style={[styles.quickActionsRow, dir.row]}>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.secondaryBtnPressed,
          ]}
          onPress={onAddProduct}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={15}
            color={colors.textSecondary}
          />

          <Text style={[styles.secondaryBtnText, dir.text]} numberOfLines={1}>
            {t("recipe.createManualBtn")}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.secondaryBtnPressed,
          ]}
          onPress={onScanBarcode}
        >
          <MaterialCommunityIcons
            name="barcode-scan"
            size={15}
            color={colors.textSecondary}
          />

          <Text style={[styles.secondaryBtnText, dir.text]} numberOfLines={1}>
            {t("recipe.scanBarcodeBtn")}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
