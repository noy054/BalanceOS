import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { Button } from "../../../shared/components/ui/Button";
import { FormInput } from "../../../shared/components/FormInput";
import { useDirection } from "../../../shared/hooks/useDirection";
import { spacing } from "../../../shared/theme";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  label: string;
  confirmLabel: string;
  required?: boolean;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

export function ReasonSheet({
  visible,
  title,
  message,
  label,
  confirmLabel,
  required = true,
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation("settings");
  const dir = useDirection();
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = reason.trim();
  const missing = required && !trimmed;

  function close() {
    setReason("");
    setTouched(false);
    onClose();
  }

  function confirm() {
    setTouched(true);
    if (missing) return;
    onConfirm(trimmed);
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      onDismiss={() => {
        setReason("");
        setTouched(false);
      }}
      title={title}
      subtitle={message}
      footer={
        <View style={[styles.actions, dir.row]}>
          <Button label={t("admin.common.cancel")} variant="secondary" onPress={close} style={styles.cancel} />
          <Button
            label={confirmLabel}
            variant={destructive ? "danger" : "primary"}
            onPress={confirm}
            loading={loading}
            style={styles.confirm}
          />
        </View>
      }
    >
      <FormInput
        label={label}
        value={reason}
        onChangeText={setReason}
        multiline
        error={touched && missing ? t("admin.common.reasonRequired") : undefined}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  cancel: { flex: 1 },
  confirm: { flex: 2 },
});
