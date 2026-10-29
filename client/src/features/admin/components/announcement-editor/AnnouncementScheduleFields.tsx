import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormSection } from "../../../../shared/components/ui/FormSection";
import { AnnouncementFormErrors, AnnouncementFormState } from "../../helpers/announcementForm";
import { UpdateAnnouncementField } from "../../hooks/useAnnouncementEditor";
import { DateTimeField } from "../DateTimeField";
import { useEditorStyles } from "./editorStyles";

type Props = {
  form: AnnouncementFormState;
  errors: AnnouncementFormErrors;
  readOnly: boolean;
  update: UpdateAnnouncementField;
};

export function AnnouncementScheduleFields({ form, errors, readOnly, update }: Props) {
  const { t } = useTranslation("settings");
  const styles = useEditorStyles();

  return (
    <FormSection title={t("admin.announcements.scheduleSection")}>
      <View style={styles.fieldGroup}>
        <DateTimeField
          label={t("admin.announcements.startLabel")}
          emptyLabel={t("admin.announcements.startEmpty")}
          date={form.startDate}
          time={form.startTime}
          error={errors.startTime}
          disabled={readOnly}
          onChangeDate={(value) => update("startDate", value)}
          onChangeTime={(value) => update("startTime", value)}
        />
        <DateTimeField
          label={t("admin.announcements.endLabel")}
          emptyLabel={t("admin.announcements.endEmpty")}
          date={form.endDate}
          time={form.endTime}
          error={errors.endTime}
          disabled={readOnly}
          onChangeDate={(value) => update("endDate", value)}
          onChangeTime={(value) => update("endTime", value)}
        />
      </View>
    </FormSection>
  );
}
