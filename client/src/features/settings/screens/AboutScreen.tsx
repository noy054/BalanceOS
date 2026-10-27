import { Alert, Linking, Platform, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsRow } from "../components/SettingsRow";
import { useStyles, getDirectionStyles } from "./styles/AboutScreen.styles";

const APP_NAME = "BalanceOS";

const LINKS = {
  terms: "https://balanceos.app/terms",
  privacy: "https://balanceos.app/privacy",
  contact: "mailto:support@balanceos.app",
  website: "https://balanceos.app",

  // TODO: להחליף אחרי שיש App Store ID אמיתי
  iosStore: "https://apps.apple.com/app/id0000000000",

  // TODO: להחליף אחרי שיש package name אמיתי בחנות
  androidStore: "market://details?id=com.balanceos.app",
  androidStoreWeb:
    "https://play.google.com/store/apps/details?id=com.balanceos.app",
};

async function openUrl(url: string, failureMessage: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      await Linking.openURL(url);
      return;
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert("", failureMessage);
  }
}

export function AboutScreen() {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const openFailed = t("about.openLinkFailed");

  async function handleRateApp() {
    if (Platform.OS === "ios") {
      await openUrl(LINKS.iosStore, openFailed);
      return;
    }

    try {
      await Linking.openURL(LINKS.androidStore);
    } catch {
      await openUrl(LINKS.androidStoreWeb, openFailed);
    }
  }

  async function handleShareApp() {
    const storeUrl =
      Platform.OS === "ios" ? LINKS.iosStore : LINKS.androidStoreWeb;

    await Share.share({
      message: `${APP_NAME}\n${storeUrl}`,
      url: storeUrl,
      title: APP_NAME,
    });
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader title={t("about.screenTitle")} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.appCard}>
          <View style={[styles.logoMark, dir.logoRow]}>
            <Text style={styles.logoBalance}>Balance</Text>
            <Text style={styles.logoOS}>OS</Text>
          </View>

          <Text style={styles.tagline}>{t("about.tagline")}</Text>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>
              {t("about.versionLabel")} {t("about.versionValue")}
            </Text>
          </View>
        </View>

        <SettingsSection title={t("sections.app")}>
          <SettingsRow
            icon="web"
            label={t("about.website")}
            hint={t("about.websiteHint")}
            onPress={() => openUrl(LINKS.website, openFailed)}
          />

          <SettingsRow
            icon="star-outline"
            label={t("about.rateApp")}
            hint={t("about.rateAppHint")}
            onPress={handleRateApp}
          />

          <SettingsRow
            icon="share-variant-outline"
            label={t("about.shareApp")}
            hint={t("about.shareAppHint")}
            onPress={handleShareApp}
            last
          />
        </SettingsSection>

        <SettingsSection title={t("about.legalSection")}>
          <SettingsRow
            icon="file-document-outline"
            label={t("about.terms")}
            hint={t("about.termsHint")}
            onPress={() => openUrl(LINKS.terms, openFailed)}
          />

          <SettingsRow
            icon="shield-lock-outline"
            label={t("about.privacy")}
            hint={t("about.privacyHint")}
            onPress={() => openUrl(LINKS.privacy, openFailed)}
          />

          <SettingsRow
            icon="email-outline"
            label={t("about.contact")}
            hint={t("about.contactHint")}
            onPress={() => openUrl(LINKS.contact, openFailed)}
            last
          />
        </SettingsSection>

        <Text style={[styles.footerText, dir.text]}>
          {t("about.storeNote")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
