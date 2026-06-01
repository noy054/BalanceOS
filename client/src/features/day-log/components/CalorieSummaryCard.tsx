import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { homeDashboardColors } from "../constants/homeDashboardTheme";
import { styles } from "./styles/CalorieSummaryCard.styles";

type Props = {
  eaten: number;
  target: number;
};

export function CalorieSummaryCard({ eaten, target }: Props) {
  const { t } = useTranslation("dashboard");

  const remaining = Math.max(target - eaten, 0);
  const progress = target > 0 ? Math.min(eaten / target, 1) : 0;
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <MaterialCommunityIcons
            name="fire"
            size={16}
            color={homeDashboardColors.lime}
          />
          <Text style={styles.badgeText}>{progressPercent}%</Text>
        </View>

        <MaterialCommunityIcons
          name="chart-donut"
          size={30}
          color={homeDashboardColors.lime}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{t("calories.remaining")}</Text>

        <View style={styles.numberRow}>
          <Text style={styles.remainingNumber}>{remaining}</Text>
          <Text style={styles.unit}>{t("calories.unit")}</Text>
        </View>

        <Text style={styles.summary}>
          {t("calories.summary", { eaten, target })}
        </Text>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{eaten}</Text>
          <Text style={styles.progressLabel}>{target}</Text>
        </View>
      </View>
    </View>
  );
}
