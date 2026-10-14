import { Pressable, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAppTheme } from "../../../../shared/theme";
import { useStyles } from "./styles/ProductHeaderActions.styles";

type Props = {
  isRTL: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProductHeaderActions({ isRTL, onEdit, onDelete }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();

  return (
    <View
      style={[
        styles.container,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <Pressable
        onPress={onEdit}
        hitSlop={10}
        style={({ pressed }) => [
          styles.actionButton,
          styles.editButton,
          pressed && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name="pencil-outline"
          size={18}
          color={colors.primaryGreen}
        />
      </Pressable>

      <Pressable
        onPress={onDelete}
        hitSlop={10}
        style={({ pressed }) => [
          styles.actionButton,
          styles.deleteButton,
          pressed && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={18}
          color={colors.danger}
        />
      </Pressable>
    </View>
  );
}
