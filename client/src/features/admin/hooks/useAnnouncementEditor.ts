import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { SheetAction } from "../../../shared/components/ui/ActionSheet";
import { confirmAction } from "../../../shared/helpers/confirm";
import { AnnouncementContent, AnnouncementPlatform } from "../../announcements/types";
import { useIsAdmin } from "../../admin-catalog/hooks/useAdminCatalog";
import { ADMIN_ROUTES, AnnouncementActionName } from "../constants";
import {
  AnnouncementFormErrors,
  AnnouncementFormState,
  buildAnnouncementPayload,
  combineDateTime,
  EMPTY_ANNOUNCEMENT_FORM,
  formFromAnnouncement,
} from "../helpers/announcementForm";
import { audienceSummary } from "../helpers/announcementLabels";
import { adminErrorMessage } from "../helpers/errors";
import { formatDateTime } from "../helpers/format";
import {
  useAdminAnnouncement,
  useAnnouncementAction,
  useDeleteAnnouncement,
  useSaveAnnouncement,
} from "./useAdmin";

const SCHEDULE_THRESHOLD_MS = 60 * 1000;

export type UpdateAnnouncementField = <K extends keyof AnnouncementFormState>(
  key: K,
  value: AnnouncementFormState[K],
) => void;

type ActionConfirm = {
  name: AnnouncementActionName;
  titleKey: string;
  messageKey: string;
  destructive: boolean;
};

const ACTION_CONFIRMS: Record<"unpublish" | "archive" | "restore", ActionConfirm> = {
  unpublish: {
    name: "unpublish",
    titleKey: "admin.announcements.unpublishTitle",
    messageKey: "admin.announcements.unpublishMessage",
    destructive: false,
  },
  archive: {
    name: "archive",
    titleKey: "admin.announcements.archiveTitle",
    messageKey: "admin.announcements.archiveMessage",
    destructive: true,
  },
  restore: {
    name: "restore",
    titleKey: "admin.announcements.restoreTitle",
    messageKey: "admin.announcements.restoreMessage",
    destructive: false,
  },
};

function isFutureStart(start: Date | null): boolean {
  return Boolean(start && start.getTime() > Date.now() + SCHEDULE_THRESHOLD_MS);
}

export function useAnnouncementEditor(routeId: string) {
  const { t, i18n } = useTranslation("settings");
  const isAdmin = useIsAdmin();
  const isNew = routeId === "new";

  const query = useAdminAnnouncement(isAdmin && !isNew ? routeId : null);
  const existing = query.data;
  const save = useSaveAnnouncement(isNew ? null : routeId);
  const action = useAnnouncementAction();
  const remove = useDeleteAnnouncement();

  const [form, setForm] = useState<AnnouncementFormState>(EMPTY_ANNOUNCEMENT_FORM);
  const [errors, setErrors] = useState<AnnouncementFormErrors>({});
  const hydrated = useRef<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    const key = `${existing.id}:${existing.updatedAt}`;
    if (hydrated.current === key) return;
    hydrated.current = key;
    setForm(formFromAnnouncement(existing));
    setErrors({});
  }, [existing]);

  const messages = useMemo(
    () => ({
      required: t("admin.validation.required"),
      tooLong: t("admin.validation.tooLong"),
      invalidUrl: t("admin.validation.invalidUrl"),
      invalidRoute: t("admin.validation.invalidRoute"),
      invalidVersion: t("admin.validation.invalidVersion"),
      versionOrder: t("admin.validation.versionOrder"),
      invalidTime: t("admin.validation.invalidTime"),
      endBeforeStart: t("admin.validation.endBeforeStart"),
    }),
    [t],
  );

  const status = existing?.status ?? "DRAFT";
  const readOnly = status === "ARCHIVED";
  const busy = save.isPending || action.isPending || remove.isPending;
  const start = combineDateTime(form.startDate, form.startTime);
  const willSchedule = isFutureStart(start);

  const previewContent: AnnouncementContent = {
    kind: form.kind,
    display: form.display,
    titleHe: form.titleHe,
    titleEn: form.titleEn,
    bodyHe: form.bodyHe,
    bodyEn: form.bodyEn,
    actionType: form.actionType,
    actionTarget: form.actionType === "ROUTE" ? form.route : form.url,
    actionLabelHe: form.actionLabelHe,
    actionLabelEn: form.actionLabelEn,
  };

  const update: UpdateAnnouncementField = (key, value) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function togglePlatform(platform: AnnouncementPlatform) {
    update(
      "platforms",
      form.platforms.includes(platform)
        ? form.platforms.filter((value) => value !== platform)
        : [...form.platforms, platform],
    );
  }

  function validate() {
    const result = buildAnnouncementPayload(form, messages);
    setErrors(result.errors);
    if (!result.payload) Alert.alert("", t("admin.validation.fixErrors"));
    return result.payload;
  }

  function showError(err: unknown) {
    Alert.alert("", adminErrorMessage(err, t, t("admin.errors.generic")));
  }

  async function handleSave() {
    const payload = validate();
    if (!payload) return;
    try {
      const saved = await save.mutateAsync(payload);
      if (isNew) router.replace(ADMIN_ROUTES.announcement(saved.id));
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function handlePublish() {
    const payload = validate();
    if (!payload) return;
    const scheduled = isFutureStart(start);
    const confirmed = await confirmAction({
      title: scheduled ? t("admin.announcements.scheduleTitle") : t("admin.announcements.publishTitle"),
      message: t("admin.announcements.publishMessage", {
        audience: audienceSummary(payload, t),
        start: scheduled ? formatDateTime(start?.toISOString(), i18n.language) : t("admin.announcements.now"),
      }),
      confirmLabel: scheduled ? t("admin.announcements.schedule") : t("admin.announcements.publish"),
      cancelLabel: t("admin.common.cancel"),
    });
    if (!confirmed) return;
    try {
      const saved = await save.mutateAsync(payload);
      await action.mutateAsync({
        id: saved.id,
        action: "publish",
        ...(scheduled && start ? { publishAt: start.toISOString() } : {}),
      });
      if (isNew) router.replace(ADMIN_ROUTES.announcement(saved.id));
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function runAction(kind: keyof typeof ACTION_CONFIRMS) {
    if (!existing) return;
    const config = ACTION_CONFIRMS[kind];
    const confirmed = await confirmAction({
      title: t(config.titleKey),
      message: t(config.messageKey),
      confirmLabel: t(`admin.announcements.actions.${config.name}`),
      cancelLabel: t("admin.common.cancel"),
      destructive: config.destructive,
    });
    if (!confirmed) return;
    try {
      await action.mutateAsync({ id: existing.id, action: config.name });
    } catch (err: unknown) {
      showError(err);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    const confirmed = await confirmAction({
      title: t("admin.announcements.deleteTitle"),
      message: t("admin.announcements.deleteMessage"),
      confirmLabel: t("admin.announcements.actions.delete"),
      cancelLabel: t("admin.common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await remove.mutateAsync(existing.id);
      router.back();
    } catch (err: unknown) {
      showError(err);
    }
  }

  const menuActions: SheetAction[] = [];
  if (existing) {
    if (status === "PUBLISHED") {
      menuActions.push({
        key: "unpublish",
        label: t("admin.announcements.actions.unpublish"),
        icon: "eye-off-outline",
        onPress: () => runAction("unpublish"),
      });
    }
    menuActions.push(
      status === "ARCHIVED"
        ? {
            key: "restore",
            label: t("admin.announcements.actions.restore"),
            icon: "restore",
            onPress: () => runAction("restore"),
          }
        : {
            key: "archive",
            label: t("admin.announcements.actions.archive"),
            icon: "archive-outline",
            destructive: true,
            onPress: () => runAction("archive"),
          },
    );
    if (status === "DRAFT") {
      menuActions.push({
        key: "delete",
        label: t("admin.announcements.actions.delete"),
        icon: "trash-can-outline",
        destructive: true,
        onPress: handleDelete,
      });
    }
  }

  return {
    isNew,
    query,
    existing,
    form,
    errors,
    status,
    readOnly,
    busy,
    willSchedule,
    previewContent,
    menuActions,
    isSaving: save.isPending,
    isActing: action.isPending,
    update,
    togglePlatform,
    handleSave,
    handlePublish,
    restore: () => runAction("restore"),
  };
}

export type AnnouncementEditor = ReturnType<typeof useAnnouncementEditor>;
