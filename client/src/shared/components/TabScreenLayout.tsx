import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "./BottomTabBar";
import { styles } from "./styles/TabScreenLayout.styles";

type TabId = "home" | "pantry" | "add" | "statistics" | "settings";

type Props = {
  activeTab: TabId;
  children: ReactNode;
};

export function TabScreenLayout({ activeTab, children }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.content}>{children}</View>

      <View style={styles.bottomNavWrapper}>
        <BottomTabBar activeTab={activeTab} />
      </View>
    </SafeAreaView>
  );
}
