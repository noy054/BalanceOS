import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../../../shared/theme';

export function BarcodeScreen() {
  const { t } = useTranslation('pantry');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('barcode.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.scanArea}>
          <View style={styles.scanCornerTL} />
          <View style={styles.scanCornerTR} />
          <View style={styles.scanCornerBL} />
          <View style={styles.scanCornerBR} />
          <MaterialCommunityIcons
            name="barcode-scan"
            size={80}
            color={colors.primaryGreenMid}
          />
        </View>
        <Text style={styles.subtitle}>{t('barcode.subtitle')}</Text>
        <Text style={styles.placeholder}>{t('barcode.placeholder')}</Text>
        <Pressable
          style={({ pressed }) => [styles.manualBtn, pressed && styles.manualBtnPressed]}
          onPress={() => router.replace('/(app)/pantry/add-product')}
        >
          <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primaryGreen} />
          <Text style={styles.manualBtnText}>{t('barcode.manualButton')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICK = 3;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  scanArea: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  scanCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: colors.primaryGreen,
    borderTopLeftRadius: 4,
  },
  scanCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: colors.primaryGreen,
    borderTopRightRadius: 4,
  },
  scanCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: colors.primaryGreen,
    borderBottomLeftRadius: 4,
  },
  scanCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: colors.primaryGreen,
    borderBottomRightRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  placeholder: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  manualBtnPressed: {
    opacity: 0.8,
  },
  manualBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
});
