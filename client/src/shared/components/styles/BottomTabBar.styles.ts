import { StyleSheet } from "react-native";

import { darkColors, fonts, radius, spacing, states, typography, useThemedStyles } from "../../theme";
import { withAlpha } from "../../helpers/progressColor";

const BAR_HEIGHT = 64;
const ADD_SIZE = 56;
const PLUS_SIZE = 24;
const PLUS_STROKE = 3.5;

export const useStyles = () =>
  useThemedStyles((colors) => {
    const dark = colors.canvas === darkColors.canvas;
    const lime = colors.accentFill;
    return StyleSheet.create({
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
        fontFamily: fonts.medium,
      },

      addSlot: {
        flex: 1,
        height: BAR_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
      },

      addButton: {
        width: ADD_SIZE,
        height: ADD_SIZE,
        marginTop: -18,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: colors.accentFill,
        backgroundImage: dark
          ? `linear-gradient(165deg, #EEFFB8 0%, ${lime} 42%, #A7E23B 100%)`
          : `linear-gradient(165deg, #E3F6A8 0%, ${lime} 45%, #9CCB34 100%)`,
        borderWidth: 1,
        borderColor: withAlpha("#FFFFFF", dark ? 0.55 : 0.75),
        borderBottomColor: withAlpha("#5E9420", dark ? 0.55 : 0.35),
        alignItems: "center",
        justifyContent: "center",
        boxShadow: dark
          ? `0 0 14px ${withAlpha(lime, 0.32)}, 0 0 3px ${withAlpha(lime, 0.45)}, 0 6px 12px -4px rgba(0, 0, 0, 0.55)`
          : `0 0 10px ${withAlpha(lime, 0.35)}, 0 5px 10px -4px rgba(40, 60, 10, 0.35)`,
      },

      addButtonPressed: {
        backgroundImage: `linear-gradient(165deg, #E2FF94 0%, ${colors.accentFillPressed} 55%, #94CF2E 100%)`,
        transform: [{ scale: 0.96 }],
      },

      addSheen: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: ADD_SIZE / 2,
        backgroundImage: `linear-gradient(180deg, ${withAlpha("#FFFFFF", 0.38)} 0%, ${withAlpha("#FFFFFF", 0)} 100%)`,
      },

      plus: {
        width: PLUS_SIZE,
        height: PLUS_SIZE,
        alignItems: "center",
        justifyContent: "center",
      },

      plusBar: {
        position: "absolute",
        borderRadius: PLUS_STROKE / 2,
        backgroundColor: colors.onAccent,
      },

      plusHorizontal: {
        width: PLUS_SIZE,
        height: PLUS_STROKE,
      },

      plusVertical: {
        width: PLUS_STROKE,
        height: PLUS_SIZE,
      },
    });
  });
