import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { settleConfirm, useConfirmStore } from "../../helpers/confirm";
import { useDirection } from "../../hooks/useDirection";
import { radius, shadows, spacing, typography, useThemedStyles } from "../../theme";
import { Button } from "./Button";

export function ConfirmDialogHost() {
  const styles = useStyles();
  const dir = useDirection();
  const request = useConfirmStore((state) => state.request);

  if (!request) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => settleConfirm(false)}
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, styles.overlay]}
          onPress={() => settleConfirm(false)}
          accessibilityRole="button"
          accessibilityLabel={request.cancelLabel}
        />

        <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={[styles.title, dir.text]}>{request.title}</Text>
          {request.message ? (
            <Text style={[styles.message, dir.text]}>{request.message}</Text>
          ) : null}

          <View style={[styles.actions, dir.row]}>
            <Button
              label={request.cancelLabel}
              variant="secondary"
              onPress={() => settleConfirm(false)}
              style={styles.action}
            />
            <Button
              label={request.confirmLabel}
              variant={request.destructive ? "destructive" : "primary"}
              onPress={() => settleConfirm(true)}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
      },
      overlay: {
        backgroundColor: colors.overlay,
      },
      dialog: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.xxl,
        padding: spacing.lg,
        gap: spacing.sm,
        ...shadows.lg,
      },
      title: {
        ...typography.headline,
        color: colors.textPrimary,
      },
      message: {
        ...typography.body,
        color: colors.textSecondary,
      },
      actions: {
        gap: spacing.sm,
        marginTop: spacing.md,
      },
      action: {
        flex: 1,
      },
    }),
  );
