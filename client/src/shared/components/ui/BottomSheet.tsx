import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { radius, shadows, spacing, typography, useThemedStyles } from "../../theme";
import { useDirection } from "../../hooks/useDirection";
import { IconButton } from "./IconButton";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onDismiss?: () => void;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  onDismiss,
}: Props) {
  const { t } = useTranslation("common");
  const styles = useStyles();
  const dir = useDirection();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      onDismiss={onDismiss}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.overlay}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("actions.close")}
        />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.handle} />

          {title ? (
            <View style={[styles.header, dir.row]}>
              <View style={styles.headerText}>
                <Text style={[styles.title, dir.text]} numberOfLines={2} accessibilityRole="header">
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={[styles.subtitle, dir.text]} numberOfLines={2}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <IconButton
                icon="close"
                accessibilityLabel={t("actions.close")}
                onPress={onClose}
                size={36}
                iconSize={20}
                variant="tonal"
              />
            </View>
          ) : null}

          {children}

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      flex: {
        flex: 1,
        justifyContent: "flex-end",
      },
      overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.overlay,
      },
      sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        maxHeight: "88%",
        ...shadows.lg,
      },
      handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.borderStrong,
        alignSelf: "center",
        marginBottom: spacing.ms,
      },
      header: {
        alignItems: "flex-start",
        gap: spacing.ms,
        marginBottom: spacing.md,
      },
      headerText: {
        flex: 1,
        gap: spacing.xxs,
      },
      title: {
        ...typography.headline,
        color: colors.textPrimary,
      },
      subtitle: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      footer: {
        paddingTop: spacing.md,
      },
    }),
  );
