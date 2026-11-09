import { StyleSheet } from "react-native";

import { fonts, typography, useThemedStyles } from "../../../../shared/theme";
import { withAlpha } from "../../../../shared/helpers/progressColor";

export const HERO_SCALE = {
  ribbon: (634 / 698) * 1.12,
  value: 0.1593,
  badgeValue: 0.0585,
  icon: 0.085,
};

export function macroCardStyle(color: string, dark: boolean, gloss: string) {
  return {
    backgroundColor: dark ? withAlpha(color, 0.05) : withAlpha(color, 0.07),
    backgroundImage: `linear-gradient(160deg, ${withAlpha(color, dark ? 0.24 : 0.14)} 0%, ${withAlpha(color, 0.04)} 45%, ${withAlpha(
      color,
      0.04,
    )} 60%, ${withAlpha(color, dark ? 0.26 : 0.16)} 100%)`,
    borderColor: withAlpha(color, dark ? 0.5 : 0.3),
    borderTopColor: withAlpha(color, dark ? 0.6 : 0.35),
    borderBottomColor: withAlpha(color, dark ? 0.95 : 0.6),
    boxShadow: `0 6px 14px -6px ${withAlpha(color, dark ? 0.75 : 0.35)}`,
  };
}

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        gap: 2,
      },

      hero: {
        alignItems: "center",
        marginTop: -33,
      },

      mainLabel: {
        ...typography.callout,
        fontSize: 14,
        lineHeight: 19,
        textAlign: "center",
        color: colors.textSecondary,
      },

      mainNumber: {
        fontFamily: fonts.displayHeavy,
        maxWidth: "100%",
        textAlign: "center",
        color: colors.textPrimary,
      },

      mainTarget: {
        ...typography.callout,
        ...typography.number,
        fontSize: 14,
        lineHeight: 19,
        textAlign: "center",
        color: colors.textSecondary,
      },

      badgeValue: {
        ...typography.number,
        fontFamily: fonts.displayHeavy,
        color: colors.textPrimary,
      },

      badgeLabel: {
        ...typography.caption,
        fontSize: 11,
        lineHeight: 14,
        color: colors.textSecondary,
      },

      macros: {
        gap: 8,
        marginHorizontal: 3,
      },

      macroCard: {
        flex: 1,
        minWidth: 0,
        height: 106,
        paddingTop: 8,
        paddingHorizontal: 4,
        borderRadius: 12,
        borderWidth: 1,
      },

      macroIconRow: {
        height: 17.4,
        alignItems: "center",
        justifyContent: "center",
      },

      macroLabelRow: {
        height: 18.2,
        alignItems: "center",
        justifyContent: "center",
      },

      macroValueRow: {
        height: 18.5,
        alignItems: "center",
        justifyContent: "center",
      },

      macroTargetRow: {
        height: 17.4,
        alignItems: "center",
        justifyContent: "center",
      },

      macroTrackRow: {
        height: 16.5,
        justifyContent: "center",
        paddingHorizontal: 6,
      },

      macroLabel: {
        fontFamily: fonts.bold,
        fontSize: 12,
        lineHeight: 16,
        textAlign: "center",
        color: colors.textPrimary,
      },

      macroValue: {
        ...typography.number,
        fontFamily: fonts.displayHeavy,
        fontSize: 17,
        lineHeight: 21,
      },

      macroTarget: {
        ...typography.number,
        fontFamily: fonts.regular,
        fontSize: 11.5,
        lineHeight: 15,
        textAlign: "center",
        color: colors.textSecondary,
      },

      macroTrack: {
        height: 7,
        borderRadius: 999,
        overflow: "hidden",
      },

      macroFill: {
        height: "100%",
        borderRadius: 999,
      },
    }),
  );
