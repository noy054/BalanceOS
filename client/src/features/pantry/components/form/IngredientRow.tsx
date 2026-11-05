import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { spacing, states, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { FoodThumb } from "../food/FoodThumb";
import { FoodCardValues } from "../food/FoodCardValues";
import { MacroValues } from "../food/NutritionLine";

type Props = {
  name: string;
  meta?: string | null;
  quantity: string;
  quantityHint?: string | null;
  quantityMissing?: boolean;
  calories: number;
  macros: MacroValues;
  imageUrl?: string | null;
  fallbackIcon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  handle: ReactNode;
  quantityEditor: ReactNode;
  quantityLabel: string;
  openLabel?: string;
  removeLabel: string;
  last?: boolean;
  onOpen?: () => void;
  onRemove: () => void;
};

export function IngredientRow({
  name,
  meta,
  quantity,
  quantityHint,
  quantityMissing = false,
  calories,
  macros,
  imageUrl,
  fallbackIcon,
  handle,
  quantityEditor,
  quantityLabel,
  openLabel,
  removeLabel,
  last = false,
  onOpen,
  onRemove,
}: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();

  const header = (
    <>
      <FoodThumb imageUrl={imageUrl} fallbackIcon={fallbackIcon} size={44} />
      <View style={styles.titleBlock}>
        <Text style={[styles.name, dir.text]} numberOfLines={2}>
          {name}
        </Text>
        {meta ? (
          <Text style={[styles.meta, dir.text]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
        {quantityMissing ? null : <FoodCardValues calories={calories} macros={macros} />}
      </View>
    </>
  );

  return (
    <View style={[styles.container, !last && styles.divider]}>
      <View style={[styles.top, dir.row]}>
        {onOpen ? (
          <Pressable
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={name}
            accessibilityHint={openLabel}
            style={({ pressed }) => [styles.main, dir.row, pressed && styles.pressed]}
          >
            {header}
          </Pressable>
        ) : (
          <View style={[styles.main, dir.row]}>{header}</View>
        )}

        <View style={[styles.actions, dir.row]}>
          <IconButton
            icon="close"
            size={36}
            iconSize={18}
            color={colors.textMuted}
            accessibilityLabel={removeLabel}
            onPress={onRemove}
          />
          {handle}
        </View>
      </View>

      <View
        style={[styles.editorRow, dir.row, dir.isRTL ? styles.indentRTL : styles.indentLTR]}
        accessibilityLabel={`${quantityLabel}: ${quantity}`}
      >
        {quantityEditor}
        {quantityHint ? (
          <Text style={[styles.hint, dir.text]} numberOfLines={1}>
            {quantityHint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const THUMB = 44;

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        gap: spacing.sm,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.ms,
      },
      divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.glassBorder,
      },
      top: {
        alignItems: "flex-start",
        gap: spacing.xs,
      },
      main: {
        flex: 1,
        minWidth: 0,
        alignItems: "flex-start",
        gap: spacing.ms,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
      titleBlock: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      name: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      meta: {
        ...typography.caption,
        color: colors.textMuted,
      },
      actions: {
        alignItems: "center",
        marginTop: -4,
      },
      editorRow: {
        alignItems: "center",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      indentLTR: {
        paddingLeft: THUMB + spacing.ms,
      },
      indentRTL: {
        paddingRight: THUMB + spacing.ms,
      },
      hint: {
        flexShrink: 1,
        ...typography.caption,
        ...typography.number,
        color: colors.textSecondary,
      },
    }),
  );
