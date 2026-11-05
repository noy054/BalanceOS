import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { withAlpha } from "../../../../shared/helpers/progressColor";
import { CoverImage } from "../../../../shared/components/ui/CoverImage";
import { SUPER_BANNER_IMAGE } from "../../helpers/superDepartments";

type Props = {
  departmentName: string;
  onPress: () => void;
};

export function SuperBanner({ departmentName, onPress }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const towardText = dir.isRTL ? "to left" : "to right";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t("super.bannerTitle")}. ${t("super.bannerA11y", { department: departmentName })}`}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.image}>
        <CoverImage source={SUPER_BANNER_IMAGE} />
        <View
          style={[
            styles.scrim,
            {
              backgroundImage: `linear-gradient(${towardText}, ${withAlpha(colors.imageScrim, 0.94)} 0%, ${withAlpha(colors.imageScrim, 0.72)} 45%, ${withAlpha(colors.imageScrim, 0)} 85%)`,
            },
          ]}
        >
          <View style={[styles.text, dir.isRTL ? styles.sideRtl : styles.sideLtr]}>
            <Text style={[styles.title, dir.text]} numberOfLines={2}>
              {t("super.bannerTitle")}
            </Text>
            <Text style={[styles.subtitle, dir.text]} numberOfLines={2}>
              {t("super.bannerSubtitle")}
            </Text>
          </View>
          <View style={[styles.arrow, dir.isRTL ? styles.sideRtl : styles.sideLtr]}>
            <MaterialCommunityIcons name={dir.forwardIcon} size={22} color={colors.onAccent} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        borderRadius: radius.lg,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      pressed: {
        opacity: 0.88,
      },
      image: {
        width: "100%",
        minHeight: 152,
      },
      scrim: {
        flex: 1,
        justifyContent: "space-between",
        padding: spacing.md,
        gap: spacing.ms,
      },
      text: {
        maxWidth: "62%",
        gap: spacing.xxs,
      },
      title: {
        ...typography.headline,
        fontFamily: fonts.headingSemibold,
        fontSize: 19,
        lineHeight: 25,
        color: colors.onImage,
      },
      subtitle: {
        ...typography.footnote,
        color: withAlpha(colors.onImage, 0.78),
      },
      arrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.accentFill,
      },
      sideRtl: {
        alignSelf: "flex-end",
      },
      sideLtr: {
        alignSelf: "flex-start",
      },
    }),
  );
