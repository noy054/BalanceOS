import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { IconButton } from "../../../../shared/components/ui/IconButton";
import { CoverImage } from "../../../../shared/components/ui/CoverImage";
import { fonts, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { withAlpha } from "../../../../shared/helpers/progressColor";
import { SUPER_HERO_IMAGE } from "../../helpers/superDepartments";

type Props = {
  title: string;
  subtitle: string;
  backLabel: string;
  topInset: number;
  onBack: () => void;
};

export const SUPER_HERO_OVERLAP = 28;

const MIN_CONTENT_HEIGHT = 228;
const MAX_CONTENT_HEIGHT = 300;
const COMPACT_WIDTH = 360;

export function SuperHero({ title, subtitle, backLabel, topInset, onBack }: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const towardText = dir.isRTL ? "to left" : "to right";
  const compact = width < COMPACT_WIDTH;
  const contentHeight = Math.round(
    Math.min(Math.max(width * 0.64, MIN_CONTENT_HEIGHT), MAX_CONTENT_HEIGHT),
  );

  return (
    <View
      style={[
        styles.root,
        { minHeight: topInset + contentHeight, paddingTop: topInset + spacing.sm },
      ]}
    >
      <CoverImage source={SUPER_HERO_IMAGE} mirrored={dir.isRTL} />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: `linear-gradient(${towardText}, ${withAlpha(colors.imageScrim, 0.78)} 0%, ${withAlpha(colors.imageScrim, 0.4)} 40%, ${withAlpha(colors.imageScrim, 0)} 70%)`,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: `linear-gradient(to bottom, ${withAlpha(colors.imageScrim, 0.5)} 0%, ${withAlpha(colors.imageScrim, 0)} 28%, ${withAlpha(colors.canvas, 0)} 60%, ${withAlpha(colors.canvas, 0.85)} 88%, ${colors.canvas} 100%)`,
          },
        ]}
      />

      <View style={[styles.topBar, dir.row]}>
        <IconButton
          icon={dir.backIcon}
          variant="glass"
          size={40}
          iconSize={24}
          color={colors.onImage}
          accessibilityLabel={backLabel}
          onPress={onBack}
          style={styles.back}
        />
      </View>

      <View style={[styles.text, dir.isRTL ? styles.sideRtl : styles.sideLtr]}>
        <Text
          style={[styles.title, compact && styles.titleCompact, dir.text]}
          accessibilityRole="header"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact, dir.text]} numberOfLines={3}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        width: "100%",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingBottom: SUPER_HERO_OVERLAP + spacing.md,
        overflow: "hidden",
      },
      topBar: {
        minHeight: 44,
        alignItems: "center",
      },
      back: {
        borderRadius: 20,
        backgroundColor: withAlpha(colors.imageScrim, 0.45),
        borderColor: withAlpha(colors.onImage, 0.16),
      },
      text: {
        maxWidth: "62%",
        gap: spacing.xs,
        marginTop: spacing.md,
      },
      sideRtl: {
        alignSelf: "flex-end",
      },
      sideLtr: {
        alignSelf: "flex-start",
      },
      title: {
        ...typography.display,
        fontFamily: fonts.headingSemibold,
        fontSize: 40,
        lineHeight: 48,
        color: colors.onImage,
      },
      titleCompact: {
        fontSize: 34,
        lineHeight: 40,
      },
      subtitleCompact: {
        fontSize: 14,
        lineHeight: 20,
      },
      subtitle: {
        ...typography.body,
        fontSize: 16,
        lineHeight: 23,
        color: withAlpha(colors.onImage, 0.82),
      },
    }),
  );
