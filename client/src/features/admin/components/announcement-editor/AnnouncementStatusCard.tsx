import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { announcementStateTone } from "../../helpers/announcementLabels";
import { formatDateTime, personName } from "../../helpers/format";
import { AdminAnnouncementDetail } from "../../types";
import { StatusBadge } from "../StatusBadge";

type Props = {
  announcement: AdminAnnouncementDetail;
  readOnly: boolean;
};

export function AnnouncementStatusCard({ announcement, readOnly }: Props) {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.card, dir.alignStart]}>
      <StatusBadge
        label={t(`admin.announcementStates.${announcement.state}`)}
        tone={announcementStateTone(announcement.state)}
      />
      <Text style={[styles.text, dir.text]}>
        {t("admin.announcements.createdBy", {
          name: personName(announcement.createdBy),
          date: formatDateTime(announcement.createdAt, i18n.language),
        })}
      </Text>
      <Text style={[styles.text, dir.text]}>
        {t("admin.announcements.updatedBy", {
          name: personName(announcement.updatedBy),
          date: formatDateTime(announcement.updatedAt, i18n.language),
        })}
      </Text>
      <Text style={[styles.strong, dir.text]}>
        {t("admin.announcements.stats", {
          seen: announcement.stats.seen,
          dismissed: announcement.stats.dismissed,
        })}
      </Text>
      {readOnly ? <Text style={[styles.text, dir.text]}>{t("admin.announcements.archivedHint")}</Text> : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      card: {
        gap: spacing.xs,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
      },
      text: { ...typography.footnote, color: colors.textSecondary },
      strong: { ...typography.footnote, ...typography.number, fontFamily: fonts.semibold, color: colors.textPrimary },
    }),
  );
