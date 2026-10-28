import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { spacing, useThemedStyles } from "../../../shared/theme";
import { canOpenAction, openAnnouncementAction } from "../helpers/announcementContent";
import {
  useActiveAnnouncements,
  useDismissAnnouncement,
  useMarkAnnouncementSeen,
} from "../hooks/useAnnouncements";
import { ActiveAnnouncement } from "../types";
import { AnnouncementCard } from "./AnnouncementCard";

const MAX_BANNERS = 2;

export function HomeAnnouncements() {
  const { i18n } = useTranslation();
  const styles = useStyles();
  const { data: active } = useActiveAnnouncements();
  const data = useMemo(() => active ?? [], [active]);
  const markSeen = useMarkAnnouncementSeen();
  const dismiss = useDismissAnnouncement();
  const reported = useRef(new Set<string>());

  const [popupId, setPopupId] = useState<string | null>(null);
  const candidateId = useMemo(
    () => data.find((item) => item.display === "POPUP" && !item.seen)?.id ?? null,
    [data],
  );

  useEffect(() => {
    if (popupId && data.some((item) => item.id === popupId)) return;
    setPopupId(candidateId);
  }, [data, popupId, candidateId]);

  const popup = data.find((item) => item.id === popupId) ?? null;
  const banners = useMemo(
    () =>
      data
        .filter((item) => item.id !== popupId)
        .filter((item) => item.display === "BANNER" || item.seen)
        .slice(0, MAX_BANNERS),
    [data, popupId],
  );

  const { mutate: reportSeen } = markSeen;

  useEffect(() => {
    const visible = [...banners, ...(popup ? [popup] : [])];
    for (const item of visible) {
      if (item.seen || reported.current.has(item.id)) continue;
      reported.current.add(item.id);
      reportSeen(item.id);
    }
  }, [banners, popup, reportSeen]);

  function handleAction(item: ActiveAnnouncement) {
    dismiss.mutate(item.id);
    void openAnnouncementAction(item);
  }

  return (
    <>
      {banners.length > 0 ? (
        <View style={styles.banners}>
          {banners.map((item) => (
            <AnnouncementCard
              key={item.id}
              content={item}
              language={i18n.language}
              variant="banner"
              onAction={canOpenAction(item) ? () => handleAction(item) : undefined}
              onClose={() => dismiss.mutate(item.id)}
            />
          ))}
        </View>
      ) : null}

      <Modal
        visible={Boolean(popup)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (popup) dismiss.mutate(popup.id);
        }}
      >
        <View style={styles.overlay}>
          {popup ? (
            <View style={styles.popupWrap}>
              <AnnouncementCard
                content={popup}
                language={i18n.language}
                variant="popup"
                onAction={canOpenAction(popup) ? () => handleAction(popup) : undefined}
                onClose={() => dismiss.mutate(popup.id)}
              />
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      banners: {
        gap: spacing.sm,
      },
      overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
      },
      popupWrap: {
        width: "100%",
        maxWidth: 420,
      },
    }),
  );
