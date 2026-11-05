import { View, Text, ScrollView, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { TabHeader } from "../../../shared/components/TabHeader";
import { AmbientGlow } from "../../../shared/components/ui/AmbientGlow";
import { FormToneProvider } from "../../../shared/components/FormTone";
import { useAppTheme } from "../../../shared/theme";
import { useDirection } from "../../../shared/hooks/useDirection";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsRow } from "../components/SettingsRow";
import { useNutritionSettings } from "../hooks/useSettings";
import { useAuthStore } from "../../auth/hooks/useAuthStore";
import { useCatalogReviewSummary } from "../../admin-catalog/hooks/useAdminCatalog";
import { useStyles } from "./styles/SettingsScreen.styles";
import { useBillingStatus } from "../../billing/hooks/useBilling";

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
  const { t: tBilling } = useTranslation("billing");
  const billing = useBillingStatus();
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();

  const user = useAuthStore((state) => state.user);
  const { data: settings } = useNutritionSettings();
  const isAdmin = user?.role === "ADMIN";
  const { data: reviewSummary } = useCatalogReviewSummary(isAdmin);
  const pendingReviews =
    (reviewSummary?.pendingCorrections ?? 0) + (reviewSummary?.pendingNewProducts ?? 0);

  const isExpertMode = settings?.experienceMode === "EXPERT";

  const caloriesSubtitle = settings?.dailyCaloriesTarget
    ? t("nutritionTargets.rowHint", { calories: settings.dailyCaloriesTarget })
    : t("nutritionTargets.rowSubtitleNotSet");

  const experienceSubtitle = isExpertMode
    ? t("experience.expert")
    : t("experience.guided");

  const languageSubtitle = t(`language.${settings?.preferredLanguage ?? i18n.language}`, {
    defaultValue: settings?.preferredLanguage ?? i18n.language,
  });

  return (
    <TabScreenLayout activeTab="settings" backgroundColor={colors.canvas}>
      <AmbientGlow intensity={0.6} />
      <FormToneProvider tone="glass">
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TabHeader title={t("title")} />

          <View style={styles.body}>
            <Pressable
              onPress={() => router.push("/(app)/settings/profile")}
              accessibilityRole="button"
              accessibilityLabel={`${user?.fullName ?? ""}, ${t("profile.row")}`}
              accessibilityHint={t("profile.rowSubtitle")}
              style={({ pressed }) => [styles.userCard, dir.row, pressed && styles.userCardPressed]}
            >
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

                <Text style={[styles.userAction, dir.text]} numberOfLines={1}>
                  {t("profile.row")}
                </Text>
              </View>

              <MaterialCommunityIcons name={dir.forwardIcon} size={22} color={colors.textMuted} />
            </Pressable>

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

            <SettingsSection title={t("sections.data")}>
              <SettingsRow
                icon="file-pdf-box"
                label={t("export.row")}
                hint={t("export.rowSubtitle")}
                onPress={() => router.push("/(app)/settings/export")}
                last
              />
            </SettingsSection>

            <SettingsSection title={t("sections.account")}>
              <SettingsRow
                icon="star-four-points-outline"
                label={tBilling("row")}
                hint={billing.data?.hasProAccess ? tBilling("rowPro") : tBilling("rowFree")}
                onPress={() => router.push("/(app)/settings/billing")}
              />
              <SettingsRow
                icon="shield-account-outline"
                label={t("account.row")}
                hint={t("account.rowSubtitle")}
                onPress={() => router.push("/(app)/settings/account")}
                last
              />
            </SettingsSection>

            {isAdmin ? (
              <SettingsSection title={t("sections.admin")}>
                <SettingsRow
                  icon="shield-crown-outline"
                  label={t("admin.row")}
                  hint={
                    pendingReviews > 0
                      ? t("catalogReview.rowSubtitle", { count: pendingReviews })
                      : t("admin.rowSubtitle")
                  }
                  onPress={() => router.push("/(app)/settings/admin")}
                  last
                />
              </SettingsSection>
            ) : null}

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
      </FormToneProvider>
    </TabScreenLayout>
  );
}
