import { Platform, Switch } from "react-native";

import { useAppTheme } from "../../theme";

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Toggle({ value, onValueChange, disabled, accessibilityLabel }: Props) {
  const { colors } = useAppTheme();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: colors.borderStrong, true: colors.accent }}
      thumbColor={Platform.OS === "ios" ? undefined : colors.surface}
      ios_backgroundColor={colors.borderStrong}
      {...(Platform.OS === "web" ? { activeThumbColor: colors.surface } : {})}
    />
  );
}
