import { KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';
import { styles } from './styles/ScreenShell.styles';

type Props = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function ScreenShell({ children, contentStyle }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
