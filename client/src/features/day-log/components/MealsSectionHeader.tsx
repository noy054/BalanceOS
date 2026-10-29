import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { spacing, typography, useThemedStyles } from "../../../shared/theme";

type Props = {
  expanded: boolean;
  canToggle: boolean;
  onToggle: () => void;
};

export function MealsSectionHeader({ expanded, canToggle, onToggle }: Props) {
  const { t } = useTranslation("dashboard");
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.row, dir.row]}>
      <Text style={[styles.title, dir.text]} accessibilityRole="header">
        {t("meals.sectionTitle")}
      </Text>

      {canToggle ? (
        <IconButton
          icon={expanded ? "chevron-up" : "chevron-down"}
          size={40}
          iconSize={24}
          accessibilityLabel={expanded ? t("meals.collapseAll") : t("meals.expandAll")}
          onPress={onToggle}
          style={dir.isRTL ? styles.alignLeft : styles.alignRight}
        />
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        marginBottom: spacing.xxs,
      },
      title: {
        ...typography.title,
        fontSize: 20,
        lineHeight: 26,
        flexShrink: 1,
        color: colors.textPrimary,
      },
      alignRight: {
        marginRight: spacing.md - spacing.xs,
      },
      alignLeft: {
        marginLeft: spacing.md - spacing.xs,
      },
    }),
  );
