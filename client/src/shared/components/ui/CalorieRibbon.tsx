import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

const RIBBON = require("../../../../assets/home/calorie-ribbon.webp");

export const RIBBON_ASPECT = 804 / 1268;

const SLOTS = {
  icon: { x: 0.5, y: 0.2836, width: 0.2, height: 0.12 },
  label: { x: 0.5, y: 0.4055, width: 0.56, height: 0.1 },
  value: { x: 0.5, y: 0.5261, width: 0.62, height: 0.24 },
  caption: { x: 0.5, y: 0.7226, width: 0.56, height: 0.1 },
  badgeValue: { x: 0.7397, y: 0.2164, width: 0.17, height: 0.1 },
  badgeLabel: { x: 0.7397, y: 0.3035, width: 0.17, height: 0.08 },
} as const;

type SlotName = keyof typeof SLOTS;

type Props = { width: number } & Record<SlotName, ReactNode>;

export function CalorieRibbon({ width, ...content }: Props) {
  const height = Math.round(width * RIBBON_ASPECT);

  return (
    <View style={{ width, height }}>
      <Image source={RIBBON} style={StyleSheet.absoluteFill} contentFit="contain" cachePolicy="memory" transition={0} />
      {(Object.keys(SLOTS) as SlotName[]).map((name) => {
        const slot = SLOTS[name];
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
