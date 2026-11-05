import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { CatalogBrowseItem } from "../../types";
import { BottomSheet } from "../../../../shared/components/ui/BottomSheet";
import { Button } from "../../../../shared/components/ui/Button";
import { ZoomableThumb } from "../food/ZoomableThumb";
import { NutritionTotals } from "../nutrition/NutritionTotals";
import { FOOD_ICONS, useFoodCardModels } from "../../hooks/useFoodCardModels";
import { spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";

type Props = {
  item: CatalogBrowseItem | null;
  isAdding: boolean;
  onAdd: (item: CatalogBrowseItem) => void;
  onRemove: (item: CatalogBrowseItem) => void;
  onClose: () => void;
};

export function SuperProductSheet({ item, isAdding, onAdd, onRemove, onClose }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const models = useFoodCardModels();

  if (!item) return null;

  const model = models.catalog(item);
  const pantryProductId = item.pantryProductId;

  return (
    <BottomSheet
      visible
      onClose={onClose}
      title={t("super.productTitle")}
      footer={
        pantryProductId ? (
          <View style={styles.actions}>
            <Button
              label={t("super.viewInPantry")}
              icon="check-circle"
              variant="secondary"
              fullWidth
              disabled={isAdding}
              onPress={() => {
                onClose();
                router.push(`/(app)/pantry/${pantryProductId}`);
              }}
            />
            <Button
              label={t("super.removeFromPantry")}
              icon="minus-circle-outline"
              variant="danger"
              fullWidth
              loading={isAdding}
              onPress={() => onRemove(item)}
            />
          </View>
        ) : (
          <View style={styles.actions}>
            <Button
              label={t("super.addToPantry")}
              icon="plus"
              fullWidth
              loading={isAdding}
              onPress={() => onAdd(item)}
            />
            <Button
              label={t("super.addWithServing")}
              icon="scale-balance"
              variant="secondary"
              fullWidth
              disabled={isAdding}
              onPress={() => {
                onClose();
                router.push({ pathname: "/(app)/pantry/add-product", params: { catalogId: item.id } });
              }}
            />
          </View>
        )
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.identity, dir.row]}>
          <ZoomableThumb imageUrl={item.imageUrl} fallbackIcon={FOOD_ICONS.product} name={item.name} />
          <View style={styles.text}>
            <Text style={[styles.name, dir.text]} numberOfLines={3}>
              {item.name}
            </Text>
            {item.brand ? (
              <Text style={[styles.brand, dir.text]} numberOfLines={1}>
                {item.brand}
              </Text>
            ) : null}
          </View>
        </View>

        <NutritionTotals
          label={model.basis ?? undefined}
          totals={{
            calories: model.calories,
            protein: model.macros.protein ?? 0,
            carbs: model.macros.carbs ?? 0,
            fat: model.macros.fat ?? 0,
            fiber: model.macros.fiber ?? 0,
          }}
        />
      </ScrollView>
    </BottomSheet>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      actions: {
        gap: spacing.sm,
      },
      content: {
        gap: spacing.md,
        paddingBottom: spacing.sm,
      },
      identity: {
        alignItems: "center",
        gap: spacing.md,
      },
      text: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xxs,
      },
      name: {
        ...typography.title,
        fontSize: 20,
        lineHeight: 26,
        color: colors.textPrimary,
      },
      brand: {
        ...typography.callout,
        color: colors.textSecondary,
      },
    }),
  );
