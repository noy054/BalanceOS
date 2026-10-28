import type { ComponentProps } from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../shared/theme';
import { useStyles, getDirectionStyles } from './styles/SettingsRow.styles';
import { getDirection } from '../../../shared/theme/direction';

type Props = {
  label: string;
  hint?: string;
  icon?: ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress?: () => void;
  rightElement?: React.ReactNode;
  last?: boolean;
  destructive?: boolean;
  showChevron?: boolean;
};

export function SettingsRow({
  label,
  hint,
  icon,
  onPress,
  rightElement,
  last = false,
  destructive = false,
  showChevron = true,
}: Props) {
  const { i18n } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);
  const direction = getDirection(isRTL);

  const content = (pressed: boolean) => (
    <View style={[styles.row, dir.row, pressed && styles.pressed]}>
      {icon ? (
        <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={destructive ? colors.danger : colors.textSecondary}
          />
        </View>
      ) : null}

      <View style={[styles.body, !last && styles.rowBorder, dir.row]}>
        <View style={styles.left}>
          <Text style={[styles.label, destructive && styles.labelDestructive, dir.text]}>
            {label}
          </Text>
          {hint ? <Text style={[styles.hint, dir.text]}>{hint}</Text> : null}
        </View>

        <View style={[styles.right, dir.rightRow]}>
          {rightElement ?? null}
          {onPress && showChevron ? (
            <MaterialCommunityIcons
              name={direction.forwardIcon}
              size={20}
              color={colors.textMuted}
            />
          ) : null}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={hint ? `${label}, ${hint}` : label}
      >
        {({ pressed }) => content(pressed)}
      </Pressable>
    );
  }

  return content(false);
}
