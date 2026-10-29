import { StyleSheet } from "react-native";

import { fonts, radius, spacing, states, typography, useThemedStyles } from "../../theme";

const BAR_HEIGHT = 64;
const ADD_SIZE = 58;

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        backgroundColor: colors.background,
      },

      bar: {
        height: BAR_HEIGHT,
        alignItems: "center",
        paddingHorizontal: spacing.xs,
        borderRadius: BAR_HEIGHT / 2,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassSurface,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
      },

      barHighlight: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: BAR_HEIGHT / 2,
        borderTopWidth: 1.5,
        borderTopColor: colors.glassHighlight,
      },

      tabItem: {
        flex: 1,
        height: BAR_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      },

      tabPressed: {
        opacity: states.pressedOpacity,
      },

      iconWrap: {
        width: 44,
        height: 28,
        borderRadius: radius.round,
        alignItems: "center",
        justifyContent: "center",
      },

      iconWrapActive: {
        backgroundColor: colors.accentSoft,
      },

      tabLabel: {
        ...typography.caption,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: fonts.medium,
        color: colors.textMuted,
        textAlign: "center",
      },

      tabLabelActive: {
        color: colors.accent,
        fontFamily: fonts.semibold,
      },

      addSlot: {
        flex: 1,
        height: BAR_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
      },

      addHalo: {
        position: "absolute",
        width: ADD_SIZE + 16,
        height: ADD_SIZE + 16,
        borderRadius: (ADD_SIZE + 16) / 2,
        backgroundColor: colors.accentFill,
        opacity: 0.16,
        top: (BAR_HEIGHT - ADD_SIZE - 16) / 2 - 14,
      },

      addButton: {
        width: ADD_SIZE,
        height: ADD_SIZE,
        marginTop: -28,
        borderRadius: ADD_SIZE / 2,
        backgroundColor: colors.accentFill,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: colors.background,
        shadowColor: colors.accentFill,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
        elevation: 10,
      },

      addButtonPressed: {
        backgroundColor: colors.accentFillPressed,
      },
    }),
  );
