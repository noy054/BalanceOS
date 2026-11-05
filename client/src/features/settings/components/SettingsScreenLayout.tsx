import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { FormToneProvider } from "../../../shared/components/FormTone";
import { AmbientGlow } from "../../../shared/components/ui/AmbientGlow";
import { spacing, useThemedStyles } from "../../../shared/theme";

type Props = {
  title: string;
  rightElement?: ReactNode;
  children: ReactNode;
};

export function SettingsScreenLayout({ title, rightElement, children }: Props) {
  const styles = useStyles();

  return (
    <FormToneProvider tone="glass">
      <SafeAreaView style={styles.root} edges={["top"]}>
        <AmbientGlow intensity={0.45} />
        <ScreenHeader title={title} rightElement={rightElement} />
        <View style={styles.body}>{children}</View>
      </SafeAreaView>
    </FormToneProvider>
  );
}

export function useSettingsBottomPadding() {
  const insets = useSafeAreaInsets();
  return { paddingBottom: insets.bottom + spacing.xl };
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: colors.canvas,
      },
      body: {
        flex: 1,
      },
    }),
  );
