import { View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { colors } from "../theme";
import { styles } from "./styles/ScreenHeader.styles";

type Props = {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  fallbackRoute?: Parameters<typeof router.replace>[0];
};

export function ScreenHeader({
  title,
  onBack,
  rightElement,
  fallbackRoute = "/(app)/dashboard",
}: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === "rtl";

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackRoute);
  }

  return (
    <View
      style={[
        styles.container,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <View style={styles.sideSlot}>
        <Pressable
          onPress={handleBack}
          hitSlop={14}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons
            name={isRTL ? "chevron-right" : "chevron-left"}
            size={28}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.titleSlot}>
        <Text
          style={[
            styles.title,
            {
              writingDirection: isRTL ? "rtl" : "ltr",
              textAlign: "center",
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <View style={styles.sideSlot}>{rightElement ?? null}</View>
    </View>
  );
}
