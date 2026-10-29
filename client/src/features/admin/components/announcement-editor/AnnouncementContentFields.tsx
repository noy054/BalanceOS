import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { AnnouncementDisplay, AnnouncementKind } from "../../../announcements/types";
import { AnnouncementFormErrors, AnnouncementFormState } from "../../helpers/announcementForm";
import { UpdateAnnouncementField } from "../../hooks/useAnnouncementEditor";
import { useEditorStyles } from "./editorStyles";

const KINDS: AnnouncementKind[] = ["UPDATE", "NOTICE", "IMPORTANT"];
const DISPLAYS: AnnouncementDisplay[] = ["BANNER", "POPUP"];

type Props = {
  form: AnnouncementFormState;
  errors: AnnouncementFormErrors;
  readOnly: boolean;
  update: UpdateAnnouncementField;
};

type LanguageProps = Props & {
  title: string;
  titleKey: "titleHe" | "titleEn";
  bodyKey: "bodyHe" | "bodyEn";
};

function LanguageSection({ form, errors, readOnly, update, title, titleKey, bodyKey }: LanguageProps) {
  const { t } = useTranslation("settings");
  const styles = useEditorStyles();

  return (
    <FormSection title={title}>
      <View style={styles.fieldGroup}>
        <FormInput
          label={t("admin.announcements.titleLabel")}
          value={form[titleKey]}
          onChangeText={(value) => update(titleKey, value)}
          error={errors[titleKey]}
          editable={!readOnly}
        />
        <FormInput
          label={t("admin.announcements.bodyLabel")}
          value={form[bodyKey]}
          onChangeText={(value) => update(bodyKey, value)}
          error={errors[bodyKey]}
          multiline
          editable={!readOnly}
        />
      </View>
    </FormSection>
  );
}

export function AnnouncementContentFields(props: Props) {
  const { t } = useTranslation("settings");
  const styles = useEditorStyles();
  const dir = useDirection();
  const { form, update } = props;

  return (
    <>
      <FormSection title={t("admin.announcements.typeSection")}>
        <View style={styles.fieldGroup}>
          <SegmentedControl
            options={KINDS.map((value) => ({ value, label: t(`admin.announcements.kinds.${value}`) }))}
            value={form.kind}
            onChange={(value) => update("kind", value)}
          />
          <SegmentedControl
            size="sm"
            options={DISPLAYS.map((value) => ({ value, label: t(`admin.announcements.displays.${value}`) }))}
            value={form.display}
            onChange={(value) => update("display", value)}
          />
          <Text style={[styles.hint, dir.text]}>{t(`admin.announcements.displayHints.${form.display}`)}</Text>
        </View>
      </FormSection>

      <LanguageSection {...props} title={t("admin.announcements.hebrew")} titleKey="titleHe" bodyKey="bodyHe" />
      <LanguageSection {...props} title={t("admin.announcements.english")} titleKey="titleEn" bodyKey="bodyEn" />
    </>
  );
}
