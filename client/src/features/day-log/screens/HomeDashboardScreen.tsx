import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '../components/HomeHeader';
import { CalorieSummaryCard } from '../components/CalorieSummaryCard';
import { MacroSummaryCard } from '../components/MacroSummaryCard';
import { AddMealButton } from '../../meals/components/AddMealButton';
import { MealShortcutList } from '../../meals/components/MealShortcutList';
import { BottomTabBar } from '../../../shared/components/BottomTabBar';
import { mockDayLogSummary } from '../constants/mockDashboard';
import { colors, spacing } from '../../../shared/theme';

// TODO: Replace mockDayLogSummary with a useDayLog() hook that calls the API
const data = mockDayLogSummary;

const SECTION_GAP = spacing.md;

export function HomeDashboardScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <HomeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CalorieSummaryCard
          eaten={data.caloriesEaten}
          target={data.caloriesTarget}
        />
        <View style={styles.sectionGap} />
        <MacroSummaryCard macros={data.macros} />
        <View style={styles.sectionGap} />
        <AddMealButton
          onPress={() => {
            // TODO: navigate to add-meal screen
          }}
        />
        <View style={styles.shortcutGap} />
        <MealShortcutList
          onSelect={(_type) => {
            // TODO: navigate to add-meal screen with pre-selected meal type
          }}
        />
      </ScrollView>
      <BottomTabBar activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  sectionGap: {
    height: SECTION_GAP,
  },
  shortcutGap: {
    height: spacing.sm,
  },
});
