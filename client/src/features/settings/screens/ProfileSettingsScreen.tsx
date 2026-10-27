import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { FormInput } from "../../../shared/components/FormInput";
import { Button } from "../../../shared/components/ui/Button";
import { StickyFooter } from "../../../shared/components/ui/StickyFooter";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsSelectRow } from "../components/SettingsSelectRow";
import { BirthDatePickerModal } from "../components/BirthDatePickerModal";
import { useProfileSettingsForm } from "../hooks/useProfileSettingsForm";
import { Gender, GoalType } from "../types";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/ProfileSettingsScreen.styles";

export function ProfileSettingsScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const form = useProfileSettingsForm();

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("profile.screenTitle")} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <SettingsSection title={t("sections.profile")}>
            <View style={styles.formCard}>
              <FormInput
                label={t("profile.fullNameLabel")}
                value={form.fullName}
                onChangeText={(value) => {
                  form.setFullName(value);
                  form.setNameError("");
                }}
                error={form.nameError}
              />

              <View style={styles.readonlyGroup}>
                <Text style={[styles.readonlyLabel, dir.text]}>
                  {t("profile.emailLabel")}
                </Text>

                <Text style={[styles.emailValue, dir.text]}>
                  {form.user?.email ?? ""}
                </Text>

                <Text style={[styles.emailNote, dir.text]}>
                  {t("profile.emailNote")}
                </Text>
              </View>
            </View>
          </SettingsSection>

          <SettingsSection title={t("sections.preferences")}>
            <SettingsSelectRow
              label={t("profile.genderLabel")}
              value={form.gender as Gender}
              options={[
                {
                  value: "MALE" as Gender,
                  label: t("profile.genderMale"),
                },
                {
                  value: "FEMALE" as Gender,
                  label: t("profile.genderFemale"),
                },
                {
                  value: "OTHER" as Gender,
                  label: t("profile.genderOther"),
                },
              ]}
              onChange={form.setGender}
            />

            <SettingsSelectRow
              label={t("profile.goalLabel")}
              value={form.goalType as GoalType}
              options={[
                {
                  value: "CUTTING" as GoalType,
                  label: t("profile.goalCutting"),
                },
                {
                  value: "MAINTENANCE" as GoalType,
                  label: t("profile.goalMaintenance"),
                },
                {
                  value: "BULKING" as GoalType,
                  label: t("profile.goalBulking"),
                },
              ]}
              onChange={form.setGoalType}
              last
            />
          </SettingsSection>

          <SettingsSection title={t("profile.bodyDetailsTitle")}>
            <View style={styles.formCard}>
              <Pressable
                onPress={form.openBirthDatePicker}
                accessibilityRole="button"
                accessibilityLabel={t("profile.birthDateLabel")}
                style={({ pressed }) => pressed && styles.dateInputPressed}
              >
                <View pointerEvents="none">
                  <FormInput
                    label={t("profile.birthDateLabel")}
                    value={form.birthDate}
                    onChangeText={form.setBirthDate}
                    placeholder={t("profile.birthDatePlaceholder")}
                    editable={false}
                    readOnlyAppearance="field"
                  />
                </View>
              </Pressable>

              {Platform.OS === "android" && form.isBirthDatePickerOpen && (
                <DateTimePicker
                  value={form.birthDatePickerValue}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={form.handleBirthDateChange}
                />
              )}

              <BirthDatePickerModal
                visible={form.isBirthDatePickerOpen}
                value={form.tempBirthDate}
                onChange={form.handleBirthDateChange}
                onClose={form.closeBirthDatePicker}
                onConfirm={form.confirmBirthDatePicker}
              />

              <View style={[styles.grid, dir.row]}>
                <View style={styles.gridCell}>
                  <FormInput
                    label={t("profile.heightLabel")}
                    value={form.heightCm}
                    onChangeText={form.setHeightCm}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.gridCell}>
                  <FormInput
                    label={t("profile.weightLabel")}
                    value={form.weightKg}
                    onChangeText={form.setWeightKg}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <FormInput
                label={t("profile.trainingDaysLabel")}
                value={form.trainingDays}
                onChangeText={form.setTrainingDays}
                keyboardType="number-pad"
              />
            </View>
          </SettingsSection>
        </ScrollView>

        <StickyFooter>
          <Button
            label={form.isSaving ? t("profile.saving") : t("profile.saveButton")}
            onPress={form.handleSave}
            loading={form.isSaving}
            disabled={form.isSaveDisabled && !form.isSaving}
            fullWidth
          />
        </StickyFooter>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
