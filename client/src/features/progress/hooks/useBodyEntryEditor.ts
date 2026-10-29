import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { confirmAction } from "../../../shared/helpers/confirm";
import { useTodayKey } from "../../../shared/hooks/useTodayKey";
import { MAX_PHOTOS_PER_ENTRY } from "../constants";
import { buildEntryPayload, emptyEntryForm, EntryFormErrors, EntryFormState, formFromEntry } from "../helpers/entryForm";
import { BodyMetric } from "../types";
import { PhotoSyncError, useBodyEntry, useDeleteBodyEntry, useSaveBodyEntry } from "./useProgress";

export type DraftPhoto = {
  key: string;
  photoId?: string;
  localUri?: string;
};

let draftCounter = 0;

function nextKey(): string {
  draftCounter += 1;
  return `draft-${draftCounter}`;
}

export function useBodyEntryEditor(routeId: string) {
  const { t } = useTranslation("progress");
  const today = useTodayKey();
  const isNew = routeId === "new";
  const query = useBodyEntry(isNew ? null : routeId);
  const entry = query.data;
  const save = useSaveBodyEntry();
  const remove = useDeleteBodyEntry();

  const [form, setForm] = useState<EntryFormState>(() => emptyEntryForm(today));
  const [errors, setErrors] = useState<EntryFormErrors>({});
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [replacements, setReplacements] = useState<Record<string, string>>({});
  const hydrated = useRef<string | null>(null);

  useEffect(() => {
    if (!entry || hydrated.current === entry.id) return;
    hydrated.current = entry.id;
    setForm(formFromEntry(entry));
    setPhotos(entry.photos.map((photo) => ({ key: photo.id, photoId: photo.id })));
  }, [entry]);

  const messages = useMemo(
    () => ({
      invalidNumber: t("form.invalidNumber"),
      outOfRange: (min: number, max: number) => t("form.outOfRange", { min, max }),
      noteTooLong: t("form.noteTooLong"),
      empty: t("form.empty"),
    }),
    [t],
  );

  const busy = save.isPending || remove.isPending;

  function update(field: BodyMetric | "note" | "date", value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  }

  function addPhoto(uri: string) {
    if (photos.length >= MAX_PHOTOS_PER_ENTRY) return;
    setPhotos((prev) => [...prev, { key: nextKey(), localUri: uri }]);
    setErrors((prev) => ({ ...prev, form: undefined }));
  }

  function replacePhoto(key: string, uri: string) {
    setPhotos((prev) => prev.map((photo) => (photo.key === key ? { ...photo, localUri: uri } : photo)));
    const target = photos.find((photo) => photo.key === key);
    if (target?.photoId) setReplacements((prev) => ({ ...prev, [key]: uri }));
  }

  function removePhoto(key: string) {
    const target = photos.find((photo) => photo.key === key);
    setPhotos((prev) => prev.filter((photo) => photo.key !== key));
    if (target?.photoId) {
      setRemovedIds((prev) => [...prev, target.photoId as string]);
      setReplacements((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSave() {
    if (busy) return;
    const result = buildEntryPayload(form, { isNew, photoCount: photos.length }, messages);
    setErrors(result.errors);
    if (!result.payload) return;
    try {
      await save.mutateAsync({
        id: isNew ? null : routeId,
        payload: result.payload,
        photos: {
          added: photos.filter((photo) => !photo.photoId && photo.localUri).map((photo) => photo.localUri as string),
          replaced: Object.entries(replacements).map(([id, uri]) => ({ id, uri })),
          removed: removedIds,
        },
      });
      router.back();
    } catch (err: unknown) {
      if (err instanceof PhotoSyncError && err.rolledBack) {
        Alert.alert("", t("photos.uploadFailed"));
        return;
      }
      if (err instanceof PhotoSyncError) {
        Alert.alert("", t("photos.partialFailure", { count: err.failed }));
        if (!isNew) {
          router.back();
        } else {
          router.replace({ pathname: "/(app)/progress/[id]", params: { id: err.entry.id } });
        }
        return;
      }
      Alert.alert("", t("form.saveFailed"));
    }
  }

  async function handleDelete() {
    if (!entry || busy) return;
    const confirmed = await confirmAction({
      title: t("entry.deleteTitle"),
      message: entry.photos.length > 0 ? t("entry.deleteMessageWithPhotos") : t("entry.deleteMessage"),
      confirmLabel: t("entry.delete"),
      cancelLabel: t("entry.cancel"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await remove.mutateAsync(entry);
      router.back();
    } catch {
      Alert.alert("", t("entry.deleteFailed"));
    }
  }

  return {
    isNew,
    query,
    entry,
    today,
    form,
    errors,
    photos,
    busy,
    isSaving: save.isPending,
    update,
    addPhoto,
    replacePhoto,
    removePhoto,
    handleSave,
    handleDelete,
  };
}
