import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { TabHeader } from "../../../shared/components/TabHeader";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsRow } from "../components/SettingsRow";
import { useNutritionSettings } from "../hooks/useSettings";
import { useAuthStore } from "../../auth/hooks/useAuthStore";
import { useStyles, getDirectionStyles } from "./styles/SettingsScreen.styles";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SettingsScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const user = useAuthStore((state) => state.user);
  const { data: settings } = useNutritionSettings();

  const isExpertMode = settings?.experienceMode === "EXPERT";

  const caloriesSubtitle = settings?.dailyCaloriesTarget
    ? t("nutritionTargets.rowHint", { calories: settings.dailyCaloriesTarget })
    : t("nutritionTargets.rowSubtitleNotSet");

  const experienceSubtitle = isExpertMode
    ? t("experience.expert")
    : t("experience.guided");

  const languageSubtitle =
    settings?.preferredLanguage === "en" ? t("language.en") : t("language.he");

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TabHeader title={t("title")} />

        <View style={styles.body}>
          <View style={[styles.userCard, dir.row]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>
                {user ? getInitials(user.fullName) : "?"}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, dir.text]} numberOfLines={1}>
                {user?.fullName ?? "—"}
              </Text>

              <Text style={[styles.userEmail, dir.text]} numberOfLines={1}>
                {user?.email ?? ""}
              </Text>
            </View>
          </View>

          <SettingsSection title={t("sections.profile")}>
            <SettingsRow
              icon="account-outline"
              label={t("profile.row")}
              hint={t("profile.rowSubtitle")}
              onPress={() => router.push("/(app)/settings/profile")}
              last
            />
          </SettingsSection>

          <SettingsSection title={t("sections.preferences")}>
            <SettingsRow
              icon="translate"
              label={t("languageDisplay.row")}
              hint={languageSubtitle}
              onPress={() => router.push("/(app)/settings/language-display")}
            />

            <SettingsRow
              icon="tune-variant"
              label={t("experience.row")}
              hint={experienceSubtitle}
              onPress={() => router.push("/(app)/settings/experience-mode")}
            />

            <SettingsRow
              icon="target"
              label={t("nutritionTargets.row")}
              hint={caloriesSubtitle}
              onPress={() => router.push("/(app)/settings/nutrition-targets")}
            />

            <SettingsRow
              icon="view-dashboard-outline"
              label={t("tracking.row")}
              hint={t("tracking.rowSubtitle")}
              onPress={() => router.push("/(app)/settings/tracking")}
              last
            />
          </SettingsSection>

          {!isExpertMode && (
            <SettingsSection title={t("sections.notifications")}>
              <SettingsRow
                icon="bell-outline"
                label={t("notifications.row")}
                hint={t("notifications.rowSubtitle")}
                onPress={() => router.push("/(app)/settings/notifications")}
                last
              />
            </SettingsSection>
          )}

          <SettingsSection title={t("sections.account")}>
            <SettingsRow
              icon="shield-account-outline"
              label={t("account.row")}
              hint={t("account.rowSubtitle")}
              onPress={() => router.push("/(app)/settings/account")}
              last
            />
          </SettingsSection>

          <SettingsSection title={t("sections.app")}>
            <SettingsRow
              icon="information-outline"
              label={t("about.row")}
              hint={`${t("about.rowSubtitlePrefix")} ${t("about.versionValue")}`}
              onPress={() => router.push("/(app)/settings/about")}
              last
            />
          </SettingsSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
