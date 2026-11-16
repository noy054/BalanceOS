import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

const RIBBON = require("../../../../assets/home/calorie-ribbon.webp");
const RIBBON_OVER = require("../../../../assets/home/calorie-ribbon-over.webp");

export const RIBBON_ASPECT = 804 / 1268;

export const RIBBON_SLOTS = {
  icon: { x: 0.5, y: 0.2836, width: 0.2, height: 0.12 },
  center: { x: 0.5, y: 0.57, width: 0.6, height: 0.44 },
  badge: { x: 0.747, y: 0.2537, width: 0.118, height: 0.19 },
} as const;


type SlotName = keyof typeof RIBBON_SLOTS;

type Props = { width: number; over?: boolean } & Record<SlotName, ReactNode>;

export function CalorieRibbon({ width, over = false, ...content }: Props) {
  const height = Math.round(width * RIBBON_ASPECT);

  return (
    <View style={{ width, height }}>
      <Image source={over ? RIBBON_OVER : RIBBON} style={StyleSheet.absoluteFill} contentFit="contain" cachePolicy="memory" transition={0} />
      {(Object.keys(RIBBON_SLOTS) as SlotName[]).map((name) => {
        const slot = RIBBON_SLOTS[name];
        const slotWidth = slot.width * width;
        const slotHeight = slot.height * height;
        return (
          <View
            key={name}
            pointerEvents="none"
            style={[
              styles.slot,
              {
                left: slot.x * width - slotWidth / 2,
                top: slot.y * height - slotHeight / 2,
                width: slotWidth,
                height: slotHeight,
              },
            ]}
          >
            {content[name]}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
