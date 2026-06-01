import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { MacroItem } from "../types";
import { MACRO_CONFIG } from "../constants/macros";
import { homeDashboardColors } from "../constants/homeDashboardTheme";
import { styles } from "./styles/MacroProgressItem.styles";

type Props = {
  macro: MacroItem;
};

const macroColors: Record<MacroItem["key"], string> = {
  protein: homeDashboardColors.lime,
  carbs: homeDashboardColors.green,
  fat: homeDashboardColors.warning,
  fiber: homeDashboardColors.cyan,
};

export function MacroProgressItem({ macro }: Props) {
  const { t } = useTranslation("dashboard");
  const config = MACRO_CONFIG[macro.key];
  const progress =
    macro.target > 0 ? Math.min(macro.current / macro.target, 1) : 0;
  const accentColor = macroColors[macro.key] ?? homeDashboardColors.lime;

  return (
    <View style={styles.container}>
      <View style={[styles.iconBubble, { borderColor: `${accentColor}33` }]}>
        <MaterialCommunityIcons
          name={
            config.icon as React.ComponentProps<
              typeof MaterialCommunityIcons
            >["name"]
          }
          size={20}
          color={accentColor}
        />
      </View>

      <Text style={styles.label}>{t(`macros.${config.labelKey}`)}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.current}>{macro.current}</Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.targetValue}>{macro.target}</Text>
      </View>

      <Text style={styles.unit}>{t("macros.gramsUnit")}</Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>
    </View>
  );
}
