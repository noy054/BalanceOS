import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../shared/theme';
import { styles, getDirectionStyles } from './styles/SettingsRow.styles';

type Props = {
  label: string;
  hint?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  last?: boolean;
  destructive?: boolean;
  showChevron?: boolean;
};

export function SettingsRow({
  label,
  hint,
  onPress,
  rightElement,
  last = false,
  destructive = false,
  showChevron = true,
}: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  const content = (
    <View style={[styles.row, !last && styles.rowBorder, dir.row]}>
      <View style={styles.left}>
        <Text style={[styles.label, destructive && styles.labelDestructive, dir.text]}>{label}</Text>
        {hint ? <Text style={[styles.hint, dir.text]}>{hint}</Text> : null}
      </View>
      <View style={[styles.right, dir.rightRow]}>
        {rightElement ?? null}
        {onPress && showChevron ? (
          <MaterialCommunityIcons name="chevron-left" size={20} color={colors.textMuted} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}
