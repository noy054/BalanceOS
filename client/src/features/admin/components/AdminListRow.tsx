import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";

type Props = {
  title: string;
  lines: Array<string | null | undefined>;
  leading?: ReactNode;
  badges?: ReactNode;
  onPress: () => void;
};

export function AdminListRow({ title, lines, leading, badges, onPress }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const visibleLines = lines.filter((line): line is string => Boolean(line));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, ...visibleLines].join(", ")}
      style={({ pressed }) => [styles.card, dir.row, pressed && styles.pressed]}
    >
      {leading}
      <View style={styles.body}>
        <Text style={[styles.title, dir.text]} numberOfLines={2}>
          {title}
        </Text>
        {visibleLines.map((line, index) => (
          <Text key={index} style={[styles.meta, dir.text]} numberOfLines={1}>
            {line}
          </Text>
        ))}
        {badges ? <View style={[styles.badges, dir.row]}>{badges}</View> : null}
      </View>
      <MaterialCommunityIcons name={dir.forwardIcon} size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        alignItems: "center",
        gap: spacing.ms,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.md,
      },
      pressed: { backgroundColor: colors.surfaceMuted },
      body: { flex: 1, minWidth: 0, gap: 2 },
      title: { ...typography.bodyStrong, color: colors.textPrimary },
      meta: { ...typography.footnote, color: colors.textSecondary },
      badges: { flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
    }),
  );
