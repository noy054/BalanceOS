import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { colors } from '../../../shared/theme';
import { styles } from './styles/BarcodeScreen.styles';

export function BarcodeScreen() {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('barcode.title')} />

      <View style={styles.body}>
        <View style={styles.scanArea}>
          <View style={styles.scanCornerTL} />
          <View style={styles.scanCornerTR} />
          <View style={styles.scanCornerBL} />
          <View style={styles.scanCornerBR} />
          <MaterialCommunityIcons
            name="barcode-scan"
            size={72}
            color={colors.primaryGreenMid}
          />
        </View>
        <Text style={styles.subtitle}>{t('barcode.subtitle')}</Text>
        <Text style={styles.placeholder}>{t('barcode.placeholder')}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.manualBtn,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
            pressed && styles.manualBtnPressed,
          ]}
          onPress={() => router.replace('/(app)/pantry/add-product')}
        >
          <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primaryGreen} />
          <Text style={styles.manualBtnText}>{t('barcode.manualButton')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
