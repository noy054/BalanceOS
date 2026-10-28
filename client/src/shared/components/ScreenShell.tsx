import { KeyboardAvoidingView, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, useThemedStyles } from "../theme";
import { keyboardBehavior } from "./ui/KeyboardAvoider";

type Props = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function ScreenShell({ children, contentStyle }: Props) {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={keyboardBehavior}
      >
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      flex: {
        flex: 1,
        backgroundColor: colors.background,
      },
      content: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        width: "100%",
        maxWidth: 480,
        alignSelf: "center",
      },
    }),
  );
