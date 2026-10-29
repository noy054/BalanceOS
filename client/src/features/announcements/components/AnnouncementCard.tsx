import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import {
  fonts,
  AppColors,
  radius,
  spacing,
  states,
  typography,
  useAppTheme,
  useThemedStyles,
} from "../../../shared/theme";
import { localizeAnnouncement } from "../helpers/announcementContent";
import { AnnouncementContent, AnnouncementKind } from "../types";

type Props = {
  content: AnnouncementContent;
  language: string;
  variant: "banner" | "popup";
  onAction?: () => void;
  onClose?: () => void;
};

function kindTone(colors: AppColors, kind: AnnouncementKind) {
  switch (kind) {
    case "UPDATE":
      return { fg: colors.accent, bg: colors.accentSoft };
    case "IMPORTANT":
      return { fg: colors.warning, bg: colors.warningSoft };
    case "NOTICE":
      return { fg: colors.textSecondary, bg: colors.surfaceMuted };
  }
}

export function AnnouncementCard({ content, language, variant, onAction, onClose }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const text = localizeAnnouncement(content, language);
  const tone = kindTone(colors, content.kind);
  const isPopup = variant === "popup";
  const lng = language.startsWith("he") ? "he" : "en";
  const textDirection = language.startsWith("he")
    ? { writingDirection: "rtl" as const, textAlign: "right" as const }
    : { writingDirection: "ltr" as const, textAlign: "left" as const };

  return (
    <View
      style={[styles.card, isPopup && styles.popup]}
      accessibilityRole={isPopup ? undefined : "summary"}
    >
      <View style={[styles.header, dir.row]}>
        <View style={styles.headerText}>
          <Text style={[styles.kind, { color: tone.fg }, textDirection]}>
            {t(`announcements.kind.${content.kind}`, { lng })}
          </Text>
          <Text
            style={[isPopup ? styles.titlePopup : styles.title, textDirection]}
            accessibilityRole="header"
          >
            {text.title || t("announcements.untitled", { lng })}
          </Text>
        </View>
        {onClose && !isPopup ? (
          <IconButton
            icon="close"
            size={32}
            iconSize={18}
            accessibilityLabel={t("announcements.dismiss", { lng })}
            onPress={onClose}
          />
        ) : null}
      </View>

      {text.body ? <Text style={[styles.body, textDirection]}>{text.body}</Text> : null}

      {text.actionLabel || isPopup ? (
        <View style={[styles.actions, dir.row, isPopup && styles.actionsPopup]}>
          {text.actionLabel ? (
            <Pressable
              onPress={onAction}
              accessibilityRole="button"
              style={({ pressed }) => [
                isPopup ? styles.primaryAction : styles.linkAction,
                dir.row,
                pressed && styles.pressed,
              ]}
            >
              <Text style={isPopup ? styles.primaryActionLabel : styles.linkActionLabel}>
                {text.actionLabel}
              </Text>
              {!isPopup ? (
                <MaterialCommunityIcons name={dir.forwardIcon} size={18} color={colors.accent} />
              ) : null}
            </Pressable>
          ) : null}
          {isPopup && onClose ? (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryActionLabel}>{t("announcements.gotIt", { lng })}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
      },
      popup: {
        gap: spacing.ms,
        padding: spacing.lg,
        borderRadius: radius.xl,
      },
      header: {
        alignItems: "flex-start",
        gap: spacing.ms,
      },
      headerText: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      kind: {
        ...typography.caption,
        fontFamily: fonts.semibold,
      },
      title: {
        ...typography.bodyStrong,
        color: colors.textPrimary,
      },
      titlePopup: {
        ...typography.headline,
        color: colors.textPrimary,
      },
      body: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      actions: {
        alignItems: "center",
        gap: spacing.sm,
      },
      actionsPopup: {
        flexDirection: "column",
        alignItems: "stretch",
        marginTop: spacing.xs,
      },
      linkAction: {
        alignItems: "center",
        gap: 2,
        minHeight: 32,
      },
      linkActionLabel: {
        ...typography.label,
        color: colors.accent,
      },
      primaryAction: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        borderRadius: radius.md,
        backgroundColor: colors.accentFill,
      },
      primaryActionLabel: {
        ...typography.bodyStrong,
        color: colors.onAccent,
      },
      secondaryAction: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
        borderRadius: radius.md,
      },
      secondaryActionLabel: {
        ...typography.bodyStrong,
        color: colors.textSecondary,
      },
      pressed: {
        opacity: states.pressedOpacity,
      },
    }),
  );
