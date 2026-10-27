import { useState } from "react";
import { View, Text } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import type { ReactNode } from "react";
import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useDirection } from "../hooks/useDirection";
import { IconButton } from "./ui/IconButton";
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
  rightAccessibilityLabel?: string;
  fallbackRoute?: Parameters<typeof router.replace>[0];
};

export function ScreenHeader({
  title,
  onBack,
  rightElement,
  rightIconName,
  onRightPress,
  rightIconColor,
  rightAccessibilityLabel,
  fallbackRoute = "/(app)/dashboard",
}: Props) {
  const { t } = useTranslation("common");
  const styles = useStyles();
  const dir = useDirection();

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
        style={[styles.sideSlot, dir.isRTL ? styles.rightSlot : styles.leftSlot]}
      >
        <IconButton
          icon={dir.backIcon}
          iconSize={26}
          accessibilityLabel={t("actions.back")}
          onPress={handleBack}
          color={styles.title.color}
        />
      </View>

      <View
        pointerEvents="none"
        style={[styles.titleSlot, { paddingHorizontal: titleInset }]}
      >
        <Text
          style={[
            styles.title,
            { writingDirection: dir.isRTL ? "rtl" : "ltr", textAlign: "center" },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          accessibilityRole="header"
        >
          {title}
        </Text>
      </View>

      <View
        onLayout={handleEndLayout}
        style={[styles.sideSlot, dir.isRTL ? styles.leftSlot : styles.rightSlot]}
      >
        {rightIconName && onRightPress ? (
          <IconButton
            icon={rightIconName}
            accessibilityLabel={rightAccessibilityLabel ?? title}
            onPress={onRightPress}
            color={rightIconColor}
          />
        ) : (
          (rightElement ?? null)
        )}
      </View>
    </View>
  );
}
