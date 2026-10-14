import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStyles, getDirectionStyles } from './styles/SettingsSection.styles';

type Props = {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
};

export function SettingsSection({ title, children, danger = false }: Props) {
  const { i18n } = useTranslation();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === 'rtl';
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, danger && styles.titleDanger, dir.title]}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}
