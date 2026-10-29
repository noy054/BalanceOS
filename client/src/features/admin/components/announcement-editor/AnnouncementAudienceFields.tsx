import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { ANNOUNCEMENT_PLATFORMS, AnnouncementPlatform } from "../../../announcements/types";
import { AnnouncementFormErrors, AnnouncementFormState } from "../../helpers/announcementForm";
import { audienceSummary } from "../../helpers/announcementLabels";
import { UpdateAnnouncementField } from "../../hooks/useAnnouncementEditor";
import { ToggleChips } from "../ToggleChips";
import { useEditorStyles } from "./editorStyles";

type Props = {
  form: AnnouncementFormState;
  errors: AnnouncementFormErrors;
  readOnly: boolean;
  update: UpdateAnnouncementField;
  onTogglePlatform: (platform: AnnouncementPlatform) => void;
};

export function AnnouncementAudienceFields({ form, errors, readOnly, update, onTogglePlatform }: Props) {
  const { t } = useTranslation("settings");
  const styles = useEditorStyles();
  const dir = useDirection();

  return (
    <FormSection title={t("admin.announcements.audienceSection")} hint={t("admin.announcements.audienceHint")}>
      <View style={styles.fieldGroup}>
        <ToggleChips
          options={ANNOUNCEMENT_PLATFORMS.map((value) => ({
            value,
            label: t(`admin.announcements.platforms.${value}`),
          }))}
          selected={form.platforms}
          onToggle={onTogglePlatform}
        />
        <View style={[styles.pair, dir.row]}>
          <View style={styles.pairItem}>
            <FormInput
              label={t("admin.announcements.minVersion")}
              value={form.minAppVersion}
              onChangeText={(value) => update("minAppVersion", value)}
              error={errors.minAppVersion}
              placeholder="1.0.0"
              keyboardType="numbers-and-punctuation"
              editable={!readOnly}
            />
          </View>
          <View style={styles.pairItem}>
            <FormInput
              label={t("admin.announcements.maxVersion")}
              value={form.maxAppVersion}
              onChangeText={(value) => update("maxAppVersion", value)}
              error={errors.maxAppVersion}
              placeholder="2.0.0"
              keyboardType="numbers-and-punctuation"
              editable={!readOnly}
            />
          </View>
        </View>
        <Text style={[styles.hint, dir.text]}>
          {audienceSummary(
            {
              platforms: form.platforms,
              minAppVersion: form.minAppVersion.trim() || null,
              maxAppVersion: form.maxAppVersion.trim() || null,
            },
            t,
          )}
        </Text>
      </View>
    </FormSection>
  );
}
