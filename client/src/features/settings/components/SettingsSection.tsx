import { View } from 'react-native';

import { SectionHeader } from '../../../shared/components/ui/SectionHeader';
import { useStyles } from './styles/SettingsSection.styles';

type Props = {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
};

export function SettingsSection({ title, children, danger = false }: Props) {
  const styles = useStyles();

  return (
    <View style={styles.wrapper}>
      <SectionHeader title={title} tone={danger ? 'danger' : 'default'} />
      <View style={[styles.card, danger && styles.cardDanger]}>{children}</View>
    </View>
  );
}
