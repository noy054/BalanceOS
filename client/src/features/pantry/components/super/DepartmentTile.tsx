import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { withAlpha } from "../../../../shared/helpers/progressColor";
import { CoverImage } from "../../../../shared/components/ui/CoverImage";
import { DEPARTMENT_IMAGES } from "../../helpers/superDepartments";
import { CatalogDepartment } from "../../types";

type Props = {
  department: CatalogDepartment;
  name: string;
  accessibilityLabel: string;
  width: number;
  onPress: () => void;
};

export function DepartmentTile({ department, name, accessibilityLabel, width, onPress }: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.root, { width }, pressed && styles.pressed]}
    >
      <View style={styles.image}>
        <CoverImage source={DEPARTMENT_IMAGES[department]} />
        <View
          style={[
            styles.scrim,
            {
              backgroundImage: `linear-gradient(to top, ${withAlpha(colors.imageScrim, 0.92)} 0%, ${withAlpha(colors.imageScrim, 0.55)} 40%, ${withAlpha(colors.imageScrim, 0)} 75%)`,
            },
          ]}
        >
          <View style={[styles.footer, dir.row]}>
            <Text style={[styles.name, dir.text]} numberOfLines={2}>
              {name}
            </Text>
            <MaterialCommunityIcons name={dir.forwardIcon} size={18} color={colors.onImage} />
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
        backgroundColor: colors.glassCard,
      },
      pressed: {
        opacity: 0.88,
      },
      image: {
        width: "100%",
        height: 116,
      },
      scrim: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: spacing.ms,
        paddingBottom: spacing.sm + 2,
      },
      footer: {
        alignItems: "center",
        gap: spacing.xs,
      },
      name: {
        ...typography.bodyStrong,
        fontFamily: fonts.semibold,
        flex: 1,
        minWidth: 0,
        color: colors.onImage,
      },
    }),
  );
