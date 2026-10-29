import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { ActionSheet, SheetAction } from "../../../shared/components/ui/ActionSheet";
import { useDirection } from "../../../shared/hooks/useDirection";
import { useImageSource } from "../../../shared/hooks/useImageSource";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { MAX_PHOTOS_PER_ENTRY, PHOTO_ASPECT } from "../constants";
import { DraftPhoto } from "../hooks/useBodyEntryEditor";
import { PhotoViewer } from "./PhotoViewer";
import { PrivatePhoto } from "./PrivatePhoto";

type Props = {
  photos: DraftPhoto[];
  disabled: boolean;
  onAdd: (uri: string) => void;
  onReplace: (key: string, uri: string) => void;
  onRemove: (key: string) => void;
};

type Target = { kind: "add" } | { kind: "replace"; key: string };

export function PhotoSection({ photos, disabled, onAdd, onReplace, onRemove }: Props) {
  const { t } = useTranslation("progress");
  const { t: tCommon } = useTranslation("common");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const target = useRef<Target>({ kind: "add" });
  const [sourceOpen, setSourceOpen] = useState(false);
  const [menuPhoto, setMenuPhoto] = useState<DraftPhoto | null>(null);
  const [viewing, setViewing] = useState<DraftPhoto | null>(null);

  const source = useImageSource({
    aspect: PHOTO_ASPECT,
    onPick: (uri) => {
      const current = target.current;
      if (current.kind === "replace") onReplace(current.key, uri);
      else onAdd(uri);
    },
  });

  const canAdd = photos.length < MAX_PHOTOS_PER_ENTRY && !disabled;

  const sourceActions: SheetAction[] = [
    { key: "camera", label: tCommon("image.takePhoto"), icon: "camera-outline", onPress: source.takePhoto },
    { key: "library", label: tCommon("image.chooseFromLibrary"), icon: "image-outline", onPress: source.pickFromLibrary },
  ];

  const photoActions: SheetAction[] = menuPhoto
    ? [
        { key: "view", label: t("photos.view"), icon: "eye-outline", onPress: () => setViewing(menuPhoto) },
        {
          key: "camera",
          label: t("photos.replaceCamera"),
          icon: "camera-outline",
          disabled,
          onPress: () => {
            target.current = { kind: "replace", key: menuPhoto.key };
            void source.takePhoto();
          },
        },
        {
          key: "library",
          label: t("photos.replaceLibrary"),
          icon: "image-outline",
          disabled,
          onPress: () => {
            target.current = { kind: "replace", key: menuPhoto.key };
            void source.pickFromLibrary();
          },
        },
        {
          key: "remove",
          label: t("photos.remove"),
          icon: "trash-can-outline",
          destructive: true,
          disabled,
          onPress: () => onRemove(menuPhoto.key),
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      <Text style={[styles.hint, dir.text]}>{t("photos.privacy")}</Text>
      <View style={[styles.grid, dir.row]}>
        {photos.map((photo, index) => (
          <Pressable
            key={photo.key}
            onPress={() => setMenuPhoto(photo)}
            accessibilityRole="button"
            accessibilityLabel={t("photos.photoNumber", { number: index + 1 })}
            accessibilityHint={t("photos.photoHint")}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <PrivatePhoto photoId={photo.photoId} localUri={photo.localUri} style={styles.image} />
            {photo.localUri ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t("photos.pending")}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
        {canAdd ? (
          <Pressable
            onPress={() => {
              target.current = { kind: "add" };
              setSourceOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={t("photos.add")}
            style={({ pressed }) => [styles.tile, styles.addTile, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="camera-plus-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.addText}>{t("photos.add")}</Text>
          </Pressable>
        ) : null}
      </View>
      {photos.length >= MAX_PHOTOS_PER_ENTRY ? (
        <Text style={[styles.hint, dir.text]}>{t("photos.limit", { count: MAX_PHOTOS_PER_ENTRY })}</Text>
      ) : null}

      <ActionSheet
        visible={sourceOpen}
        title={t("photos.add")}
        actions={sourceActions}
        onClose={() => setSourceOpen(false)}
      />
      <ActionSheet
        visible={menuPhoto !== null}
        title={t("photos.photo")}
        actions={photoActions}
        onClose={() => setMenuPhoto(null)}
      />
      <PhotoViewer
        photo={viewing ? { photoId: viewing.photoId, localUri: viewing.localUri } : null}
        onClose={() => setViewing(null)}
      />
    </View>
  );
}

const TILE_WIDTH = 92;

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      container: { gap: spacing.sm },
      hint: { ...typography.caption, color: colors.textMuted },
      grid: { flexWrap: "wrap", gap: spacing.sm },
      tile: {
        width: TILE_WIDTH,
        aspectRatio: PHOTO_ASPECT[0] / PHOTO_ASPECT[1],
        borderRadius: radius.md,
        overflow: "hidden",
        backgroundColor: colors.surfaceMuted,
      },
      image: { width: "100%", height: "100%" },
      addTile: {
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.borderStrong,
        backgroundColor: colors.surface,
      },
      addText: { ...typography.caption, color: colors.textSecondary, textAlign: "center" },
      pressed: { opacity: 0.75 },
      badge: {
        position: "absolute",
        bottom: spacing.xs,
        left: spacing.xs,
        right: spacing.xs,
        borderRadius: radius.xs,
        backgroundColor: colors.overlay,
        paddingVertical: 2,
      },
      badgeText: { ...typography.caption, color: "#FFFFFF", textAlign: "center" },
    }),
  );
