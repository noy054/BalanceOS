import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStyles } from "./styles/TabScreenLayout.styles";
import { AppBackdrop } from "./ui/AppBackdrop";

type Props = {
  activeTab?: string;
  backgroundColor?: string;
  children: ReactNode;
};

export function TabScreenLayout({ backgroundColor, children }: Props) {
  const styles = useStyles();
  const background = backgroundColor ? { backgroundColor } : null;

  return (
    <SafeAreaView style={[styles.root, background]} edges={["top"]}>
      <View style={[styles.content, background]}>
        <AppBackdrop />
        {children}
      </View>
    </SafeAreaView>
  );
}
