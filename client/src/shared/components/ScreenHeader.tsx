import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import type { ReactNode } from "react";
import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useAppTheme } from "../theme";
import {
  MIN_SIDE_WIDTH,
  SIDE_OFFSET,
  TITLE_GAP,
  useStyles,
} from "./styles/ScreenHeader.styles";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  title: string;
  onBack?: () => void;
  rightElement?: ReactNode;
  rightIconName?: IconName;
  onRightPress?: () => void;
  rightIconColor?: string;
  fallbackRoute?: Parameters<typeof router.replace>[0];
};

export function ScreenHeader({
  title,
  onBack,
  rightElement,
  rightIconName,
  onRightPress,
  rightIconColor,
  fallbackRoute = "/(app)/dashboard",
}: Props) {
  const { i18n } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useStyles();
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

  const shouldRenderRightButton = Boolean(rightIconName && onRightPress);

  const [startWidth, setStartWidth] = useState(0);
  const [endWidth, setEndWidth] = useState(0);
  const titleInset =
    SIDE_OFFSET + Math.max(startWidth, endWidth, MIN_SIDE_WIDTH) + TITLE_GAP;

  function handleStartLayout(event: LayoutChangeEvent) {
    setStartWidth(Math.ceil(event.nativeEvent.layout.width));
  }

  function handleEndLayout(event: LayoutChangeEvent) {
    setEndWidth(Math.ceil(event.nativeEvent.layout.width));
  }

  return (
    <View style={styles.container}>
      <View
        onLayout={handleStartLayout}
        style={[styles.sideSlot, isRTL ? styles.rightSlot : styles.leftSlot]}
      >
        <Pressable
          onPress={handleBack}
          hitSlop={14}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons
            name={isRTL ? "chevron-right" : "chevron-left"}
            size={28}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      <View
        pointerEvents="none"
        style={[styles.titleSlot, { paddingHorizontal: titleInset }]}
      >
        <Text
          style={[
            styles.title,
            {
              writingDirection: isRTL ? "rtl" : "ltr",
              textAlign: "center",
            },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {title}
        </Text>
      </View>

      <View
        onLayout={handleEndLayout}
        style={[styles.sideSlot, isRTL ? styles.leftSlot : styles.rightSlot]}
      >
        {shouldRenderRightButton ? (
          <Pressable
            onPress={onRightPress}
            hitSlop={14}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name={rightIconName}
              size={22}
              color={rightIconColor ?? colors.textPrimary}
            />
          </Pressable>
        ) : (
          (rightElement ?? null)
        )}
      </View>
    </View>
  );
}
