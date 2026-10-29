import { useState } from "react";
import type { ComponentProps } from "react";
import { Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { ImageViewer } from "../../../../shared/components/ui/ImageViewer";
import { FoodThumb } from "./FoodThumb";

type Props = {
  imageUrl?: string | null;
  fallbackIcon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  name: string;
  size?: number;
};

export function ZoomableThumb({ imageUrl, fallbackIcon, name, size = 88 }: Props) {
  const { t } = useTranslation("pantry");
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) {
    return <FoodThumb fallbackIcon={fallbackIcon} size={size} />;
  }

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel={t("common.viewImage", { name })}
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <FoodThumb imageUrl={imageUrl} fallbackIcon={fallbackIcon} size={size} />
      </Pressable>
      <ImageViewer
        imageUrl={isOpen ? imageUrl : null}
        accessibilityLabel={name}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
