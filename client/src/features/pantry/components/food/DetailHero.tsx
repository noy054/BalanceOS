import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { ZoomableThumb } from "./ZoomableThumb";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  title: string;
  meta?: string | null;
  tags?: string[];
  description?: string | null;
  imageUrl?: string | null;
  fallbackIcon: IconName;
};

export function DetailHero({ title, meta, tags = [], description, imageUrl, fallbackIcon }: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.row, dir.row]}>
        <ZoomableThumb imageUrl={imageUrl} fallbackIcon={fallbackIcon} name={title} />

        <View style={styles.text}>
          <Text style={[styles.title, dir.text]} numberOfLines={3}>
            {title}
          </Text>

          {meta ? (
            <Text style={[styles.meta, dir.text]} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}

          {tags.length > 0 ? (
            <View style={[styles.tags, dir.row]}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
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
        gap: spacing.md,
      },
      row: {
        alignItems: "center",
        gap: spacing.md,
      },
      text: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xs,
      },
      title: {
        ...typography.title,
        fontSize: 22,
        lineHeight: 28,
        color: colors.textPrimary,
      },
      meta: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      tags: {
        flexWrap: "wrap",
        gap: spacing.xs + 2,
      },
      tag: {
        borderRadius: radius.round,
        backgroundColor: colors.accentSoft,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
      },
      tagText: {
        ...typography.caption,
        color: colors.accent,
      },
      description: {
        ...typography.body,
        color: colors.textSecondary,
      },
    }),
  );
