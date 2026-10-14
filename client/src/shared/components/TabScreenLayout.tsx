import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStyles } from "./styles/TabScreenLayout.styles";

type Props = {
  activeTab?: string;
  children: ReactNode;
};

export function TabScreenLayout({ children }: Props) {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}
