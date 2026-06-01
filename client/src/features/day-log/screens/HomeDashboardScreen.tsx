import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { HomeHeader } from "../components/HomeHeader";
import { CalorieSummaryCard } from "../components/CalorieSummaryCard";
import { MacroSummaryCard } from "../components/MacroSummaryCard";
import { AddMealButton } from "../../meals/components/AddMealButton";
import { MealShortcutList } from "../../meals/components/MealShortcutList";
import { BottomTabBar } from "../../../shared/components/BottomTabBar";
import { mockDayLogSummary } from "../constants/mockDashboard";
import { styles } from "./styles/HomeDashboardScreen.styles";

// TODO: Replace mockDayLogSummary with a useDayLog() hook that calls the API
const data = mockDayLogSummary;

export function HomeDashboardScreen() {
  const { i18n } = useTranslation();

  return (
    <SafeAreaView key={i18n.language} style={styles.root} edges={["top"]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.glowTop} />
        <View style={styles.glowLeft} />
        <View style={styles.glowBottom} />
      </View>

      <View style={styles.headerWrapper}>
        <HomeHeader onSettingsPress={() => router.push("/(app)/settings")} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <CalorieSummaryCard
            eaten={data.caloriesEaten}
            target={data.caloriesTarget}
          />
        </View>

        <View style={styles.section}>
          <MacroSummaryCard macros={data.macros} />
        </View>

        <View style={styles.actionSection}>
          <AddMealButton
            onPress={() => {
              // TODO: navigate to add-meal screen
            }}
          />
        </View>

        <View style={styles.shortcutsSection}>
          <MealShortcutList
            onSelect={(_type) => {
              // TODO: navigate to add-meal screen with pre-selected meal type
            }}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomNavWrapper}>
        <BottomTabBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}
