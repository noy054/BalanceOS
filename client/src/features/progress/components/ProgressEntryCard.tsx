import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { PROGRESS_ROUTES } from "../constants";

export function ProgressEntryCard() {
  const { t } = useTranslation("progress");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();

  return (
    <Pressable
      onPress={() => router.push(PROGRESS_ROUTES.overview)}
      accessibilityRole="button"
      accessibilityLabel={`${t("entryCard.title")}. ${t("entryCard.subtitle")}`}
      style={({ pressed }) => [styles.card, dir.row, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={[styles.title, dir.text]}>{t("entryCard.title")}</Text>
        <Text style={[styles.subtitle, dir.text]} numberOfLines={1}>
          {t("entryCard.subtitle")}
        </Text>
      </View>
      <MaterialCommunityIcons name={dir.forwardIcon} size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        borderRadius: radius.lg,
        alignItems: "center",
        gap: spacing.ms,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
      },
      pressed: { opacity: 0.75 },
      text: { flex: 1, gap: 2 },
      title: { ...typography.bodyStrong, color: colors.textPrimary },
      subtitle: { ...typography.footnote, color: colors.textSecondary },
    }),
  );
