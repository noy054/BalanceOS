import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { FoodThumb } from "./FoodThumb";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  title: string;
  meta?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  fallbackIcon: IconName;
};

export function DetailHero({ title, meta, description, imageUrl, fallbackIcon }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.row, dir.row]}>
        {imageUrl ? <FoodThumb imageUrl={imageUrl} fallbackIcon={fallbackIcon} size={64} /> : null}

        <View style={styles.text}>
          <Text style={[styles.title, dir.text]} numberOfLines={3}>
            {title}
          </Text>

          {meta ? (
            <Text style={[styles.meta, dir.text]} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
        </View>
      </View>

      {description ? (
        <Text style={[styles.description, dir.text]}>{description}</Text>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      wrapper: {
        gap: spacing.ms,
      },
      row: {
        alignItems: "center",
        gap: spacing.ms,
      },
      text: {
        flex: 1,
        gap: spacing.xs,
      },
      title: {
        ...typography.title,
        fontSize: 20,
        lineHeight: 26,
        color: colors.textPrimary,
      },
      meta: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      description: {
        ...typography.body,
        color: colors.textSecondary,
      },
    }),
  );
