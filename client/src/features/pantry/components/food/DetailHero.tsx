import type { ComponentProps, ReactNode } from "react";
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
  compact?: boolean;
  children?: ReactNode;
};

export function DetailHero({
  title,
  meta,
  tags = [],
  description,
  imageUrl,
  fallbackIcon,
  compact = false,
  children,
}: Props) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, dir.row]}>
        <ZoomableThumb
          imageUrl={imageUrl}
          fallbackIcon={fallbackIcon}
          name={title}
          size={compact ? 56 : 72}
        />

        <View style={styles.text}>
          <Text style={[styles.title, compact && styles.titleCompact, dir.text]} numberOfLines={3}>
            {title}
          </Text>

          {meta ? (
            <Text style={[styles.meta, dir.text]} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
        </View>
      </View>

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

      {children}

      {description ? <Text style={[styles.description, dir.text]}>{description}</Text> : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      wrapper: {
        gap: spacing.ms,
        paddingTop: spacing.xs,
      },
      header: {
        alignItems: "center",
        gap: spacing.ms,
      },
      text: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xxs,
      },
      title: {
        ...typography.title,
        fontSize: 20,
        lineHeight: 26,
        color: colors.textPrimary,
      },
      titleCompact: {
        ...typography.headline,
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
        alignSelf: "stretch",
        color: colors.textSecondary,
      },
    }),
  );
