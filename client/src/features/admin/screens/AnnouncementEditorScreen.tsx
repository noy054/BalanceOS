import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";

import { ActionSheet } from "../../../shared/components/ui/ActionSheet";
import { FormSection } from "../../../shared/components/ui/FormSection";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { KeyboardAvoider } from "../../../shared/components/ui/KeyboardAvoider";
import { StateView } from "../../../shared/components/ui/StateView";
import { useDirection } from "../../../shared/hooks/useDirection";
import { spacing, typography, useThemedStyles } from "../../../shared/theme";
import { AdminHistoryList } from "../components/AdminHistoryList";
import { AdminScaffold } from "../components/AdminScaffold";
import { AnnouncementPreview } from "../components/AnnouncementPreview";
import { AnnouncementActionFields } from "../components/announcement-editor/AnnouncementActionFields";
import { AnnouncementAudienceFields } from "../components/announcement-editor/AnnouncementAudienceFields";
import { AnnouncementContentFields } from "../components/announcement-editor/AnnouncementContentFields";
import { AnnouncementEditorFooter } from "../components/announcement-editor/AnnouncementEditorFooter";
import { AnnouncementScheduleFields } from "../components/announcement-editor/AnnouncementScheduleFields";
import { AnnouncementStatusCard } from "../components/announcement-editor/AnnouncementStatusCard";
import { useAnnouncementEditor } from "../hooks/useAnnouncementEditor";

export function AnnouncementEditorScreen() {
  const { t } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();
  const params = useLocalSearchParams<{ id?: string }>();
  const editor = useAnnouncementEditor(typeof params.id === "string" ? params.id : "new");
  const [menuOpen, setMenuOpen] = useState(false);

  const { isNew, existing, query, form, errors, readOnly, update } = editor;
  const title = isNew ? t("admin.announcements.newTitle") : t("admin.announcements.editTitle");

  if (!isNew && !existing) {
    return (
      <AdminScaffold title={title}>
        {query.isError ? (
          <StateView
            variant="error"
            message={t("admin.loadFailed")}
            actionLabel={t("admin.common.retry")}
            onAction={() => query.refetch()}
          />
        ) : (
          <StateView variant="loading" />
        )}
      </AdminScaffold>
    );
  }

  const fieldProps = { form, errors, readOnly, update };

  return (
    <AdminScaffold
      title={title}
      rightElement={
        existing ? (
          <IconButton
            icon="dots-vertical"
            accessibilityLabel={t("admin.announcements.moreActions")}
            onPress={() => setMenuOpen(true)}
          />
        ) : undefined
      }
    >
      <KeyboardAvoider>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {existing ? (
            <AnnouncementStatusCard announcement={existing} readOnly={readOnly} />
          ) : (
            <Text style={[styles.intro, dir.text]}>{t("admin.announcements.inAppOnly")}</Text>
          )}

          <AnnouncementContentFields {...fieldProps} />
          <AnnouncementActionFields {...fieldProps} />
          <AnnouncementAudienceFields {...fieldProps} onTogglePlatform={editor.togglePlatform} />
          <AnnouncementScheduleFields {...fieldProps} />

          <FormSection title={t("admin.announcements.previewSection")}>
            <AnnouncementPreview content={editor.previewContent} />
          </FormSection>

          {existing ? (
            <FormSection title={t("admin.history.title")}>
              <AdminHistoryList entries={existing.history} />
            </FormSection>
          ) : null}
        </ScrollView>

        <AnnouncementEditorFooter editor={editor} />
      </KeyboardAvoider>

      <ActionSheet
        visible={menuOpen}
        title={t("admin.announcements.moreActions")}
        actions={editor.menuActions}
        onClose={() => setMenuOpen(false)}
      />
    </AdminScaffold>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      content: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      },
      intro: {
        ...typography.footnote,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xs,
      },
    }),
  );
