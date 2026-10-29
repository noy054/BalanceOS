import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { ANNOUNCEMENT_ROUTES, AnnouncementActionType } from "../../../announcements/types";
import { AnnouncementFormErrors, AnnouncementFormState } from "../../helpers/announcementForm";
import { UpdateAnnouncementField } from "../../hooks/useAnnouncementEditor";
import { ChoiceChips } from "../../../../shared/components/ui/ChoiceChips";
import { useEditorStyles } from "./editorStyles";

const ACTIONS: AnnouncementActionType[] = ["NONE", "ROUTE", "URL"];

type Props = {
  form: AnnouncementFormState;
  errors: AnnouncementFormErrors;
  readOnly: boolean;
  update: UpdateAnnouncementField;
};

export function AnnouncementActionFields({ form, errors, readOnly, update }: Props) {
  const { t } = useTranslation("settings");
  const styles = useEditorStyles();
  const dir = useDirection();

  return (
    <FormSection title={t("admin.announcements.actionSection")} hint={t("admin.announcements.actionHint")}>
      <View style={styles.fieldGroup}>
        <SegmentedControl
          size="sm"
          options={ACTIONS.map((value) => ({ value, label: t(`admin.announcements.actionTypes.${value}`) }))}
          value={form.actionType}
          onChange={(value) => update("actionType", value)}
        />
        {form.actionType === "ROUTE" ? (
          <View style={styles.fieldGroup}>
            <ChoiceChips
              options={ANNOUNCEMENT_ROUTES.map((value) => ({
                value,
                label: t(`admin.announcements.routes.${value}`),
              }))}
              value={form.route}
              onChange={(value) => update("route", value)}
            />
            {errors.route ? <Text style={[styles.error, dir.text]}>{errors.route}</Text> : null}
          </View>
        ) : null}
        {form.actionType === "URL" ? (
          <FormInput
            label={t("admin.announcements.urlLabel")}
            value={form.url}
            onChangeText={(value) => update("url", value)}
            error={errors.url}
            placeholder="https://"
            keyboardType="url"
            editable={!readOnly}
          />
        ) : null}
        {form.actionType !== "NONE" ? (
          <View style={[styles.pair, dir.row]}>
            <View style={styles.pairItem}>
              <FormInput
                label={t("admin.announcements.buttonHe")}
                value={form.actionLabelHe}
                onChangeText={(value) => update("actionLabelHe", value)}
                error={errors.actionLabelHe}
                editable={!readOnly}
              />
            </View>
            <View style={styles.pairItem}>
              <FormInput
                label={t("admin.announcements.buttonEn")}
                value={form.actionLabelEn}
                onChangeText={(value) => update("actionLabelEn", value)}
                error={errors.actionLabelEn}
                editable={!readOnly}
              />
            </View>
          </View>
        ) : null}
      </View>
    </FormSection>
  );
}
