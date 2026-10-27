import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { TopFoodItem, MostUsedFood } from "../types";
import { useStyles as useSectionStyles } from "./styles/SectionCard.styles";
import { useStyles } from "./styles/FoodInsightsCard.styles";

type Props = {
  topCalorieSources: TopFoodItem[];
  mostUsedFoods: MostUsedFood[];
  isRTL: boolean;
};

type InsightRowProps = {
  index: number;
  name: string;
  mainValue: string;
  metaValue?: string;
  isRTL: boolean;
};

function InsightRow({
  index,
  name,
  mainValue,
  metaValue,
  isRTL,
}: InsightRowProps) {
  const styles = useStyles();
  const textAlign = isRTL ? "right" : "left";

  return (
    <View style={[styles.foodRow, isRTL && styles.foodRowRtl]}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>

      <View style={styles.foodTextBlock}>
        <Text style={[styles.foodName, { textAlign }]} numberOfLines={1}>
          {name}
        </Text>

        {metaValue && (
          <Text style={[styles.foodMeta, { textAlign }]} numberOfLines={1}>
            {metaValue}
          </Text>
        )}
      </View>

      <Text style={styles.foodStat}>{mainValue}</Text>
    </View>
  );
}

export function FoodInsightsCard({
  topCalorieSources,
  mostUsedFoods,
  isRTL,
}: Props) {
  const { t } = useTranslation("statistics");
  const sectionStyles = useSectionStyles();
  const styles = useStyles();

  const textAlign = isRTL ? "right" : "left";
  const isEmpty = topCalorieSources.length === 0 && mostUsedFoods.length === 0;

  return (
    <View style={sectionStyles.card}>
      <Text style={[sectionStyles.cardTitle, { textAlign }]}>
        {t("foodInsights.title")}
      </Text>

      {isEmpty ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { textAlign }]}>{t("noData")}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {topCalorieSources.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.subTitle, { textAlign }]}>
                {t("foodInsights.topCalories")}
              </Text>

              <View style={styles.list}>
                {topCalorieSources.map((food, index) => (
                  <InsightRow
                    key={`${food.name}-${index}-calories`}
                    index={index}
                    name={food.name}
                    mainValue={`${food.totalCalories} ${t("units.kcal")}`}
                    metaValue={t("foodInsights.usedTimes", {
                      count: food.count,
                    })}
                    isRTL={isRTL}
                  />
                ))}
              </View>
            </View>
          )}

          {topCalorieSources.length > 0 && mostUsedFoods.length > 0 && (
            <View style={styles.divider} />
          )}

          {mostUsedFoods.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.subTitle, { textAlign }]}>
                {t("foodInsights.mostUsed")}
              </Text>

              <View style={styles.list}>
                {mostUsedFoods.map((food, index) => (
                  <InsightRow
                    key={`${food.name}-${index}-used`}
                    index={index}
                    name={food.name}
                    mainValue={`×${food.count}`}
                    metaValue={t("foodInsights.avgCalories", {
                      value: food.avgCalories,
                    })}
                    isRTL={isRTL}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
