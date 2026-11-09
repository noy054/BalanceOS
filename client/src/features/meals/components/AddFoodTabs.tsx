import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useDirection } from "../../../shared/hooks/useDirection";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { fonts, useAppTheme, useThemedStyles } from "../../../shared/theme";

type Option<T extends string> = {
  value: T;
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function AddFoodTabs<T extends string>({ options, value, onChange }: Props<T>) {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();

  return (
    <View style={[styles.root, dir.row]} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        const color = active ? colors.accent : colors.textSecondary;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.tab}
          >
            <MaterialCommunityIcons name={option.icon} size={22} color={color} />
            <Text style={[styles.label, { color }, active && styles.labelActive]} numberOfLines={1}>
              {option.label}
            </Text>
            <View style={[styles.underline, active && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        gap: 10,
      },
      tab: {
        flex: 1,
        alignItems: "center",
        gap: 4,
        paddingTop: 4,
        minHeight: 56,
      },
      label: {
        fontFamily: fonts.medium,
        fontSize: 13.5,
        lineHeight: 18,
      },
      labelActive: {
        fontFamily: fonts.bold,
      },
      underline: {
        alignSelf: "stretch",
        height: StyleSheet.hairlineWidth,
        marginTop: 6,
        backgroundColor: withAlpha(colors.gloss, 0.1),
      },
      underlineActive: {
        height: 2.5,
        borderRadius: 2,
        backgroundColor: colors.accent,
        boxShadow: `0 0 10px ${withAlpha(colors.accent, 0.7)}`,
      },
    }),
  );
