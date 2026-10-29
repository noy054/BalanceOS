import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "../../../../shared/components/ui/Button";
import { StickyFooter } from "../../../../shared/components/ui/StickyFooter";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { spacing } from "../../../../shared/theme";
import { AnnouncementEditor } from "../../hooks/useAnnouncementEditor";

type Props = {
  editor: AnnouncementEditor;
};

export function AnnouncementEditorFooter({ editor }: Props) {
  const { t } = useTranslation("settings");
  const dir = useDirection();
  const { readOnly, status, busy, isSaving, isActing, willSchedule } = editor;

  return (
    <StickyFooter>
      <View style={[styles.row, dir.row]}>
        {readOnly ? (
          <Button
            label={t("admin.announcements.actions.restore")}
            icon="restore"
            onPress={editor.restore}
            loading={isActing}
            style={styles.button}
          />
        ) : status === "PUBLISHED" ? (
          <Button
            label={t("admin.announcements.saveChanges")}
            icon="check"
            onPress={editor.handleSave}
            loading={isSaving}
            disabled={busy}
            style={styles.button}
          />
        ) : (
          <>
            <Button
              label={t("admin.announcements.saveDraft")}
              variant="secondary"
              onPress={editor.handleSave}
              loading={isSaving && !isActing}
              disabled={busy}
              style={styles.button}
            />
            <Button
              label={willSchedule ? t("admin.announcements.schedule") : t("admin.announcements.publish")}
              icon={willSchedule ? "calendar-clock" : "send-outline"}
              onPress={editor.handlePublish}
              loading={isActing}
              disabled={busy}
              style={styles.button}
            />
          </>
        )}
      </View>
    </StickyFooter>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  button: { flex: 1 },
});
