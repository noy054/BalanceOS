import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { Button } from "../../../shared/components/ui/Button";
import { showToast } from "../../../shared/helpers/toast";
import { useDirection } from "../../../shared/hooks/useDirection";
import { spacing, typography, useThemedStyles } from "../../../shared/theme";
import { useApplyTargets, useNutritionSettings } from "../hooks/useSettings";
import { TargetSuggestion } from "../types";
import { TargetComparisonTable } from "./TargetComparisonTable";

type Props = {
  suggestion: TargetSuggestion | null;
  onClose: () => void;
};

export function TargetSuggestionSheet({ suggestion, onClose }: Props) {
  const { t } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();
  const { data: settings } = useNutritionSettings();
  const apply = useApplyTargets();
  const [failed, setFailed] = useState(false);

  function close() {
    if (apply.isPending) return;
    setFailed(false);
    onClose();
  }

  async function handleApply() {
    if (!suggestion?.suggested || apply.isPending) return;
    setFailed(false);
    try {
      await apply.mutateAsync(suggestion.suggested);
      showToast({ message: t("targetSuggestion.applied") });
      onClose();
    } catch {
      setFailed(true);
    }
  }

  if (!suggestion?.suggested) return null;

  return (
    <BottomSheet
      visible
      onClose={close}
      title={t("targetSuggestion.title")}
      footer={
        <View style={styles.footer}>
          {failed ? (
            <Text style={[styles.error, dir.text]} accessibilityLiveRegion="polite">
              {t("targetSuggestion.applyFailed")}
            </Text>
          ) : null}
          <Button
            label={t("targetSuggestion.apply")}
            icon="check"
            onPress={handleApply}
            loading={apply.isPending}
            fullWidth
          />
          <Button
            label={t("targetSuggestion.keep")}
            variant="secondary"
            onPress={close}
            disabled={apply.isPending}
            fullWidth
          />
        </View>
      }
    >
      <TargetComparisonTable suggestion={suggestion} goalIsCutting={settings?.goalType === "CUTTING"} />
    </BottomSheet>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      footer: {
        gap: spacing.sm,
      },
      error: {
        ...typography.footnote,
        color: colors.danger,
      },
    }),
  );
