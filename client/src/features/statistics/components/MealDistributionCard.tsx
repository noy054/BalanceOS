import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { MealDistributionItem } from "../types";
import { useStyles as useSectionStyles } from "./styles/SectionCard.styles";
import { useStyles } from "./styles/MealDistributionCard.styles";

type Props = {
  distribution: MealDistributionItem[];
  isRTL: boolean;
};

const MEAL_LABEL_KEYS: Record<string, string> = {
  BREAKFAST: "mealTypes.breakfast",
  LUNCH: "mealTypes.lunch",
  DINNER: "mealTypes.dinner",
  SNACK_1: "mealTypes.snack1",
  SNACK_2: "mealTypes.snack2",
};

const MEAL_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "SNACK_1", "SNACK_2"];

export function MealDistributionCard({ distribution, isRTL }: Props) {
  const { t } = useTranslation("statistics");
  const sectionStyles = useSectionStyles();
  const styles = useStyles();

  const textAlign = isRTL ? "right" : "left";

  const active = distribution
    .filter((item) => item.avgCalories > 0)
    .sort(
      (a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType),
    );

  return (
    <View style={sectionStyles.card}>
      <Text style={[sectionStyles.cardTitle, { textAlign }]}>
        {t("distribution.title")}
      </Text>

      {active.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { textAlign }]}>{t("noData")}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {active.map((item) => {
            const labelKey = MEAL_LABEL_KEYS[item.mealType];
            const fillWidth = Math.min(Math.max(item.pct, 0), 100);

            return (
              <View key={item.mealType} style={styles.row}>
                <View style={[styles.topLine, isRTL && styles.topLineRtl]}>
                  <View style={styles.percentBadge}>
                    <Text style={styles.percentText}>{item.pct}%</Text>
                  </View>

                  <View style={styles.textBlock}>
                    <Text
                      style={[styles.mealName, { textAlign }]}
                      numberOfLines={1}
                    >
                      {t(labelKey as Parameters<typeof t>[0])}
                    </Text>

                    <Text style={[styles.mealSubText, { textAlign }]}>
                      {item.avgCalories} {t("units.kcal")}
                    </Text>
                  </View>
                </View>

                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${fillWidth}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
