import { memo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { CatalogBrowseItem } from "../../types";
import { FoodItemCard } from "../food/FoodItemCard";
import { FoodThumb } from "../food/FoodThumb";
import { FOOD_ICONS, useFoodCardModels } from "../../hooks/useFoodCardModels";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";

type Props = {
  item: CatalogBrowseItem;
  isAdding: boolean;
  onPress: (item: CatalogBrowseItem) => void;
  onAdd: (item: CatalogBrowseItem) => void;
  onRemove: (item: CatalogBrowseItem) => void;
  onPick?: (item: CatalogBrowseItem) => void;
};

export const SuperProductCard = memo(function SuperProductCard({
  item,
  isAdding,
  onPress,
  onAdd,
  onRemove,
  onPick,
}: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const models = useFoodCardModels();
  const inPantry = item.pantryProductId !== null;

  return (
    <FoodItemCard
      {...models.catalog(item)}
      onPress={() => onPress(item)}
      leading={<FoodThumb imageUrl={item.imageUrl} fallbackIcon={FOOD_ICONS.product} size={64} />}
      trailing={
        isAdding ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : onPick ? (
          <Pressable
            onPress={() => onPick(item)}
            accessibilityRole="button"
            accessibilityLabel={t("super.pickFor", { name: item.name })}
            hitSlop={4}
            style={({ pressed }) => [styles.pick, dir.row, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="plus" size={16} color={colors.onAccent} />
            <Text style={styles.pickText} numberOfLines={1}>
              {t("super.pick")}
            </Text>
          </Pressable>
        ) : inPantry ? (
          <Pressable
            onPress={() => onRemove(item)}
            accessibilityRole="button"
            accessibilityLabel={t("super.inPantryFor", { name: item.name })}
            accessibilityHint={t("super.removeHint")}
            hitSlop={4}
            style={({ pressed }) => [styles.inPantry, dir.row, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} />
            <Text style={styles.inPantryText}>{t("super.inPantry")}</Text>
            <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <IconButton
            icon="plus"
            variant="glass"
            size={40}
            iconSize={22}
            style={styles.add}
            accessibilityLabel={t("super.addFor", { name: item.name })}
            onPress={() => onAdd(item)}
          />
        )
      }
    />
  );
});

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      inPantry: {
        alignItems: "center",
        gap: spacing.xs,
        minHeight: 40,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.round,
        backgroundColor: colors.successSoft,
      },
      inPantryText: {
        ...typography.label,
        color: colors.success,
      },
      pick: {
        alignItems: "center",
        gap: spacing.xs,
        minHeight: 40,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.round,
        backgroundColor: colors.accentFill,
      },
      pickText: {
        ...typography.label,
        color: colors.onAccent,
      },
      add: {
        borderRadius: 20,
        borderColor: colors.textMuted,
      },
      pressed: {
        opacity: 0.7,
      },
      loading: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  );
