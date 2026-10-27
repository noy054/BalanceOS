import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { IconButton } from "../../../../shared/components/ui/IconButton";

type Props = {
  title: string;
  onClose: () => void;
};

export function PickerHeader({ title, onClose }: Props) {
  const { t } = useTranslation("common");
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.header, dir.row]}>
      <Text style={[styles.title, dir.text]} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>

      <IconButton
        icon="close"
        variant="tonal"
        size={36}
        iconSize={20}
        accessibilityLabel={t("actions.close")}
        onPress={onClose}
      />
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      header: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.ms,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.ms,
      },
      title: {
        flex: 1,
        ...typography.headline,
        fontSize: 19,
        lineHeight: 24,
        color: colors.textPrimary,
      },
    }),
  );
