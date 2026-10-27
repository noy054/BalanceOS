import { ComponentProps, ReactNode, useMemo } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StatusBar } from "expo-status-bar";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";

import { useAppTheme } from "./ThemeProvider";

type IconProps = {
  name: string;
  color?: string;
  size: number;
};

function PaperIcon({ name, color, size }: IconProps) {
  return (
    <MaterialCommunityIcons
      name={name as ComponentProps<typeof MaterialCommunityIcons>["name"]}
      color={color}
      size={size}
    />
  );
}

export function PaperThemeBridge({ children }: { children: ReactNode }) {
  const { colors, resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === "dark";

  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;

    return {
      ...base,
      roundness: 10,
      colors: {
        ...base.colors,
        primary: colors.accent,
        onPrimary: colors.onAccent,
        background: colors.background,
        surface: colors.inputBackground,
        surfaceDisabled: colors.disabledBackground,
        onSurfaceDisabled: colors.disabledText,
        outline: colors.borderStrong,
        outlineVariant: colors.border,
        onSurface: colors.textPrimary,
        onSurfaceVariant: colors.textMuted,
        error: colors.danger,
        onError: colors.onAccent,
      },
    };
  }, [colors, isDark]);

  return (
    <PaperProvider theme={paperTheme} settings={{ icon: PaperIcon }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </PaperProvider>
  );
}
