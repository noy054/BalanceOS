import { View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../shared/theme";
import { useStyles, getDirectionStyles } from "./styles/PantryHeader.styles";

type Props = {
  onBackPress?: () => void;
};

export function PantryHeader({ onBackPress }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={[styles.container, dir.row]}>
      <View style={styles.textGroup}>
        <Text style={[styles.title, dir.text]} numberOfLines={1}>
          {t("title")}
        </Text>

        <Text style={[styles.subtitle, dir.text]} numberOfLines={2}>
          {t("subtitle")}
        </Text>
      </View>

      {onBackPress ? (
        <Pressable onPress={onBackPress} style={styles.backButton} hitSlop={12}>
          <MaterialCommunityIcons
            name={isRTL ? "chevron-right" : "chevron-left"}
            size={28}
            color={colors.textPrimary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
