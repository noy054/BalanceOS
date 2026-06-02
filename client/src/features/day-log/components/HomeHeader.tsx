import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { colors } from "../../../shared/theme";
import { styles } from "./styles/HomeHeader.styles";

export function HomeHeader() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === "rtl";

  return (
    <View
      style={[
        styles.container,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <View style={styles.logoBlock}>
        <View style={styles.logoRow}>
          <Text style={styles.logoBalance}>Balance</Text>

          <Text style={styles.logoOS}>OS</Text>

          <MaterialCommunityIcons
            name="leaf"
            size={18}
            color={colors.primaryGreen}
            style={styles.logoLeaf}
          />
        </View>

        <Text style={styles.subtitle}>Nutrition control</Text>
      </View>
    </View>
  );
}
