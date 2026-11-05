import type { ComponentProps } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useFoodImage } from "../../hooks/useFoodImage";
import { useImageSource } from "../../../../shared/hooks/useImageSource";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  imageUrl: string;
  fallbackIcon: IconName;
  onChangeImage: (uri: string) => void;
  onRemoveImage: () => void;
};

const SQUARE: [number, number] = [1, 1];

export function FormImageHeader({ imageUrl, fallbackIcon, onChangeImage, onRemoveImage }: Props) {
  const { t } = useTranslation("pantry");
  const { t: tCommon } = useTranslation("common");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const source = useImageSource({ onPick: onChangeImage, aspect: SQUARE });
  const hasImage = Boolean(imageUrl.trim());
  const { uri } = useFoodImage(imageUrl.trim());

  const actions: { key: string; icon: IconName; label: string; onPress: () => void }[] = [
    {
      key: "library",
      icon: hasImage ? "image-edit-outline" : "image-plus-outline",
      label: hasImage ? t("form.replaceImage") : t("form.addImage"),
      onPress: source.pickFromLibrary,
    },
    {
      key: "camera",
      icon: "camera-outline",
      label: tCommon("image.takePhoto"),
      onPress: source.takePhoto,
    },
  ];

  return (
    <View style={[styles.root, dir.row]}>
      <Pressable
        onPress={source.pickFromLibrary}
        accessibilityRole="imagebutton"
        accessibilityLabel={hasImage ? t("form.replaceImage") : t("form.addImage")}
        style={({ pressed }) => [styles.preview, pressed && styles.pressed]}
      >
        {hasImage ? (
          uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="cover" accessible={false} />
          ) : (
            <MaterialCommunityIcons name={fallbackIcon} size={40} color={colors.textMuted} />
          )
        ) : (
          <MaterialCommunityIcons name={fallbackIcon} size={40} color={colors.textMuted} />
        )}
      </Pressable>

      {hasImage ? (
        <View style={[styles.remove, dir.isRTL ? styles.removeRtl : styles.removeLtr]}>
          <IconButton
            icon="close"
            size={32}
            iconSize={18}
            variant="glass"
            color={colors.onImage}
            style={styles.removeButton}
            accessibilityLabel={t("product.removeImage")}
            onPress={onRemoveImage}
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name={action.icon} size={26} color={colors.textPrimary} />
            <Text style={styles.actionLabel} numberOfLines={2}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        gap: spacing.ms,
        alignItems: "stretch",
      },
      preview: {
        flex: 1.45,
        aspectRatio: 1.25,
        borderRadius: radius.lg,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      image: {
        width: "100%",
        height: "100%",
      },
      remove: {
        position: "absolute",
        top: spacing.sm,
      },
      removeRtl: {
        right: spacing.sm,
      },
      removeLtr: {
        left: spacing.sm,
      },
      removeButton: {
        borderRadius: 16,
        backgroundColor: colors.imageScrim,
      },
      actions: {
        flex: 1,
        gap: spacing.ms,
      },
      action: {
        flex: 1,
        minHeight: 64,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.lg,
        backgroundColor: colors.glassCard,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      actionLabel: {
        ...typography.label,
        textAlign: "center",
        color: colors.textPrimary,
      },
      pressed: {
        opacity: 0.75,
      },
    }),
  );
