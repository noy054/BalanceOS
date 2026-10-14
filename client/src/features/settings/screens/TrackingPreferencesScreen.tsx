import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsSelectRow } from "../components/SettingsSelectRow";
import { useAppTheme } from "../../../shared/theme";
import { useNutritionSettings, useUpdateSettings } from "../hooks/useSettings";
import { FoodUnit } from "../types";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/TrackingPreferencesScreen.styles";

type FormValues = {
  defaultFoodUnit: FoodUnit;
  showFiberOnHome: boolean;
  showCarbsOnHome: boolean;
  showFatOnHome: boolean;
  showProgressPercentages: boolean;
  showGuidedSuggestions: boolean;
  showMotivation: boolean;
};

type ToggleRowProps = {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
};

function ToggleRow({ label, hint, value, onChange, last }: ToggleRowProps) {
  const { i18n } = useTranslation("settings");
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  return (
    <Pressable
      style={[styles.toggleRow, dir.row, last && styles.toggleRowLast]}
      onPress={() => onChange(!value)}
    >
      <View style={styles.toggleTextGroup}>
        <Text style={[styles.toggleLabel, dir.text]}>{label}</Text>
        <Text style={[styles.toggleHint, dir.text]}>{hint}</Text>
      </View>

      <View style={[styles.switchTrack, value && styles.switchTrackActive]}>
        <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
      </View>
    </Pressable>
  );
}

function toFormValues(
  settings: ReturnType<typeof useNutritionSettings>["data"],
): FormValues {
  return {
    defaultFoodUnit: settings?.defaultFoodUnit ?? "GRAMS",
    showFiberOnHome: settings?.showFiberOnHome ?? true,
    showCarbsOnHome: settings?.showCarbsOnHome ?? true,
    showFatOnHome: settings?.showFatOnHome ?? true,
    showProgressPercentages: settings?.showProgressPercentages ?? true,
    showGuidedSuggestions: settings?.showGuidedSuggestions ?? true,
    showMotivation: settings?.showMotivation ?? true,
  };
}

export function TrackingPreferencesScreen() {
  const { t, i18n } = useTranslation("settings");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const { data: settings } = useNutritionSettings();
  const updateSettings = useUpdateSettings();

  const isExpertMode = settings?.experienceMode === "EXPERT";

  const [defaultFoodUnit, setDefaultFoodUnit] = useState<FoodUnit>("GRAMS");
  const [showFiberOnHome, setShowFiberOnHome] = useState(true);
  const [showCarbsOnHome, setShowCarbsOnHome] = useState(true);
  const [showFatOnHome, setShowFatOnHome] = useState(true);
  const [showProgressPercentages, setShowProgressPercentages] = useState(true);
  const [showGuidedSuggestions, setShowGuidedSuggestions] = useState(true);
  const [showMotivation, setShowMotivation] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initialValuesRef = useRef<FormValues | null>(null);
  const initializedRef = useRef(false);
  const saveSuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (!settings || initializedRef.current) {
      return;
    }

    const initialValues = toFormValues(settings);

    initializedRef.current = true;
    initialValuesRef.current = initialValues;

    setDefaultFoodUnit(initialValues.defaultFoodUnit);
    setShowFiberOnHome(initialValues.showFiberOnHome);
    setShowCarbsOnHome(initialValues.showCarbsOnHome);
    setShowFatOnHome(initialValues.showFatOnHome);
    setShowProgressPercentages(initialValues.showProgressPercentages);
    setShowGuidedSuggestions(initialValues.showGuidedSuggestions);
    setShowMotivation(initialValues.showMotivation);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (saveSuccessTimeoutRef.current) {
        clearTimeout(saveSuccessTimeoutRef.current);
      }
    };
  }, []);

  const currentValues = useMemo<FormValues>(
    () => ({
      defaultFoodUnit,
      showFiberOnHome,
      showCarbsOnHome,
      showFatOnHome,
      showProgressPercentages,
      showGuidedSuggestions,
      showMotivation,
    }),
    [
      defaultFoodUnit,
      showFiberOnHome,
      showCarbsOnHome,
      showFatOnHome,
      showProgressPercentages,
      showGuidedSuggestions,
      showMotivation,
    ],
  );

  const hasChanges = useMemo(() => {
    const initialValues = initialValuesRef.current;

    if (!initialValues) {
      return false;
    }

    return (
      currentValues.defaultFoodUnit !== initialValues.defaultFoodUnit ||
      currentValues.showFiberOnHome !== initialValues.showFiberOnHome ||
      currentValues.showCarbsOnHome !== initialValues.showCarbsOnHome ||
      currentValues.showFatOnHome !== initialValues.showFatOnHome ||
      currentValues.showProgressPercentages !==
        initialValues.showProgressPercentages ||
      currentValues.showGuidedSuggestions !==
        initialValues.showGuidedSuggestions ||
      currentValues.showMotivation !== initialValues.showMotivation
    );
  }, [currentValues]);

  useEffect(() => {
    if (hasChanges) {
      setSaveSuccess(false);
    }
  }, [hasChanges]);

  const isSaveDisabled = isSaving || !hasChanges;

  async function handleSave() {
    if (isSaveDisabled) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateSettings.mutateAsync(currentValues);

      initialValuesRef.current = currentValues;
      setSaveSuccess(true);

      if (saveSuccessTimeoutRef.current) {
        clearTimeout(saveSuccessTimeoutRef.current);
      }

      saveSuccessTimeoutRef.current = setTimeout(() => {
        setSaveSuccess(false);
      }, 1800);
    } catch {
      Alert.alert("", t("errors.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("tracking.screenTitle")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title={t("tracking.unitsSection")}>
          <View style={styles.sectionCard}>
            <SettingsSelectRow
              label={t("tracking.defaultFoodUnit")}
              value={defaultFoodUnit}
              options={[
                {
                  value: "GRAMS" as FoodUnit,
                  label: t("tracking.units.GRAMS"),
                },
                {
                  value: "SERVING" as FoodUnit,
                  label: t("tracking.units.SERVING"),
                },
                {
                  value: "PIECE" as FoodUnit,
                  label: t("tracking.units.PIECE"),
                },
              ]}
              onChange={setDefaultFoodUnit}
              last
            />
          </View>
        </SettingsSection>

        <SettingsSection title={t("tracking.homeDisplaySection")}>
          <View style={styles.sectionCard}>
            <ToggleRow
              label={t("tracking.showFiber")}
              hint={t("tracking.showFiberHint")}
              value={showFiberOnHome}
              onChange={setShowFiberOnHome}
            />

            <ToggleRow
              label={t("tracking.showCarbs")}
              hint={t("tracking.showCarbsHint")}
              value={showCarbsOnHome}
              onChange={setShowCarbsOnHome}
            />

            <ToggleRow
              label={t("tracking.showFat")}
              hint={t("tracking.showFatHint")}
              value={showFatOnHome}
              onChange={setShowFatOnHome}
            />

            <ToggleRow
              label={t("tracking.showProgress")}
              hint={t("tracking.showProgressHint")}
              value={showProgressPercentages}
              onChange={setShowProgressPercentages}
              last
            />
          </View>
        </SettingsSection>

        {!isExpertMode && (
          <SettingsSection title={t("tracking.guidedSection")}>
            <View style={styles.sectionCard}>
              <ToggleRow
                label={t("tracking.showGuidedSuggestions")}
                hint={t("tracking.showGuidedSuggestionsHint")}
                value={showGuidedSuggestions}
                onChange={setShowGuidedSuggestions}
              />

              <ToggleRow
                label={t("tracking.showMotivation")}
                hint={t("tracking.showMotivationHint")}
                value={showMotivation}
                onChange={setShowMotivation}
                last
              />
            </View>
          </SettingsSection>
        )}

        {saveSuccess && (
          <View style={styles.saveSuccessBanner}>
            <Text style={[styles.saveSuccessText, dir.text]}>
              {t("tracking.saved")}
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && !isSaveDisabled && styles.saveBtnPressed,
            isSaveDisabled && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          <View style={styles.saveBtnContent}>
            {isSaving && (
              <ActivityIndicator
                size="small"
                color={colors.buttonPrimaryText}
              />
            )}

            <Text
              style={[
                styles.saveBtnText,
                isSaveDisabled && styles.saveBtnTextDisabled,
              ]}
            >
              {isSaving
                ? t("tracking.saving")
                : hasChanges
                  ? t("tracking.saveButton")
                  : t("tracking.noChanges")}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
