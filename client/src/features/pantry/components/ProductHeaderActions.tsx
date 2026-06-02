import { Pressable, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { colors } from "../../../shared/theme";
import { styles } from "./styles/ProductHeaderActions.styles";

type Props = {
  isRTL: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProductHeaderActions({ isRTL, onEdit, onDelete }: Props) {
  return (
    <View
      style={[
        styles.headerActions,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <Pressable
        onPress={onEdit}
        hitSlop={12}
        style={({ pressed }) => [
          styles.headerActionBtn,
          pressed && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name="pencil-outline"
          size={20}
          color={colors.primaryGreen}
        />
      </Pressable>

      <Pressable
        onPress={onDelete}
        hitSlop={12}
        style={({ pressed }) => [
          styles.headerActionBtn,
          styles.deleteActionBtn,
          pressed && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={20}
          color={colors.danger}
        />
      </Pressable>
    </View>
  );
}
