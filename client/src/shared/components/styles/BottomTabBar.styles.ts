import { StyleSheet } from "react-native";

import { layout, radius, spacing, states, typography, useThemedStyles } from "../../theme";

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        minHeight: layout.tabBarHeight,
        alignItems: "flex-start",
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingTop: spacing.xs + 2,
        paddingHorizontal: spacing.xs,
      },

      tabItem: {
        flex: 1,
        minHeight: 48,
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 2,
      },

      tabPressed: {
        opacity: states.pressedOpacity,
      },

      iconWrap: {
        width: 52,
        height: 30,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
      },

      iconWrapActive: {
        backgroundColor: colors.accentSoft,
      },

      addButton: {
        width: 44,
        height: 30,
        borderRadius: radius.md,
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
      },

      addButtonPressed: {
        backgroundColor: colors.accentStrong,
      },

      tabLabel: {
        ...typography.caption,
        fontSize: 11,
        lineHeight: 14,
        fontWeight: "500",
        color: colors.textMuted,
        textAlign: "center",
      },

      tabLabelActive: {
        color: colors.accent,
        fontWeight: "600",
      },
    }),
  );
