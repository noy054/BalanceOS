import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../shared/theme";
import { MacroItem } from "../types";
import { MACRO_CONFIG } from "../constants/macros";
import { useStyles } from "./styles/MacroProgressItem.styles";

type Props = {
  macro: MacroItem;
  showProgressPercentage?: boolean;
};

export function MacroProgressItem({
  macro,
  showProgressPercentage = true,
}: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const config = MACRO_CONFIG[macro.key];

  const progress =
    macro.target > 0 ? Math.min(macro.current / macro.target, 1) : 0;

  const progressPercentage =
    macro.target > 0 ? Math.round((macro.current / macro.target) * 100) : 0;

  const macroColors: Record<MacroItem["key"], string> = {
    protein: colors.macroProtein,
    carbs: colors.macroCarbs,
    fat: colors.macroFat,
    fiber: colors.macroFiber,
  };

  const accentColor = macroColors[macro.key] ?? colors.primaryGreen;

  return (
    <View style={styles.container}>
      <View style={[styles.iconBubble, { borderColor: `${accentColor}55` }]}>
        <MaterialCommunityIcons
          name={
            config.icon as React.ComponentProps<
              typeof MaterialCommunityIcons
            >["name"]
          }
          size={18}
          color={accentColor}
        />
      </View>

      <Text style={styles.label} numberOfLines={1}>
        {t(`macros.${config.labelKey}`)}
      </Text>

      <View style={styles.valueRow}>
        <Text style={styles.current} numberOfLines={1} adjustsFontSizeToFit>
          {macro.current}
        </Text>

        <Text style={styles.separator}>/</Text>

        <Text style={styles.targetValue} numberOfLines={1}>
          {macro.target}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.unit}>{t("macros.gramsUnit")}</Text>

        {showProgressPercentage && (
          <Text style={[styles.percentage, { color: accentColor }]}>
            {progressPercentage}%
          </Text>
        )}
      </View>

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
