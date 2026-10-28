import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleProp, ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  offset?: number;
};

export const keyboardBehavior = Platform.OS === "web" ? undefined : "padding";

export function KeyboardAvoider({ children, style, offset = 0 }: Props) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={offset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
