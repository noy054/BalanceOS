import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { radius, spacing, useThemedStyles } from "../../../shared/theme";
import { AnnouncementCard } from "../../announcements/components/AnnouncementCard";
import { AnnouncementContent } from "../../announcements/types";

type Props = {
  content: AnnouncementContent;
};

export function AnnouncementPreview({ content }: Props) {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const [language, setLanguage] = useState<"he" | "en">(i18n.language.startsWith("he") ? "he" : "en");
  const popup = content.display === "POPUP";

  return (
    <View style={styles.wrapper}>
      <SegmentedControl
        size="sm"
        options={[
          { value: "he" as const, label: t("admin.announcements.hebrew") },
          { value: "en" as const, label: t("admin.announcements.english") },
        ]}
        value={language}
        onChange={setLanguage}
      />
      <View style={[styles.stage, popup && styles.stagePopup]} accessible={false}>
        <AnnouncementCard
          content={content}
          language={language}
          variant={popup ? "popup" : "banner"}
          onAction={() => undefined}
          onClose={() => undefined}
        />
      </View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      wrapper: { gap: spacing.sm },
      stage: {
        padding: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.background,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      },
      stagePopup: {
        backgroundColor: colors.overlay,
        paddingVertical: spacing.xl,
      },
    }),
  );
