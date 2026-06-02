import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { colors } from "../../../shared/theme";
import { styles } from "./styles/BarcodeScreen.styles";

export function BarcodeScreen() {
  const { t, i18n } = useTranslation("pantry");
  const isRTL = i18n.dir(i18n.language) === "rtl";

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.glowTop} />
        <View style={styles.glowSide} />
      </View>

      <ScreenHeader title={t("barcode.title")} />

      <View style={styles.body}>
        <View style={styles.scanCard}>
          <View style={styles.scanArea}>
            <View style={styles.scanCornerTL} />
            <View style={styles.scanCornerTR} />
            <View style={styles.scanCornerBL} />
            <View style={styles.scanCornerBR} />

            <View style={styles.scanLine} />

            <View style={styles.iconBubble}>
              <MaterialCommunityIcons
                name="barcode-scan"
                size={56}
                color={colors.primaryGreen}
              />
            </View>
          </View>

          <Text
            style={[
              styles.subtitle,
              {
                textAlign: isRTL ? "right" : "left",
                writingDirection: isRTL ? "rtl" : "ltr",
              },
            ]}
          >
            {t("barcode.subtitle")}
          </Text>

          <Text
            style={[
              styles.placeholder,
              {
                textAlign: isRTL ? "right" : "left",
                writingDirection: isRTL ? "rtl" : "ltr",
              },
            ]}
          >
            {t("barcode.placeholder")}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.manualBtn,
            { flexDirection: isRTL ? "row-reverse" : "row" },
            pressed && styles.manualBtnPressed,
          ]}
          onPress={() => router.replace("/(app)/pantry/add-product")}
        >
          <View style={styles.manualIconCircle}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={17}
              color={colors.primaryGreen}
            />
          </View>

          <Text style={styles.manualBtnText}>{t("barcode.manualButton")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
