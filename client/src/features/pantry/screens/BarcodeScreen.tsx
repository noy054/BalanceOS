import { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ProductCatalogCard } from '../components/ProductCatalogCard';
import { ManualProductCatalogForm } from '../components/ManualProductCatalogForm';
import { productCatalogApi } from '../api/productCatalogApi';
import { ProductCatalogProduct } from '../types';
import { colors } from '../../../shared/theme';
import { styles } from './styles/BarcodeScreen.styles';

type Phase = 'scanning' | 'loading' | 'found' | 'not_found' | 'manual';

export function BarcodeScreen() {
  const { t, i18n } = useTranslation('pantry');
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('scanning');
  const [product, setProduct] = useState<ProductCatalogProduct | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const scanLocked = useRef(false);

  async function handleScan({ data }: BarcodeScanningResult) {
    if (scanLocked.current) return;
    scanLocked.current = true;
    setScannedBarcode(data);
    setPhase('loading');

    try {
      const found = await productCatalogApi.lookupByBarcode(data);
      if (found) {
        setProduct(found);
        setPhase('found');
      } else {
        setPhase('not_found');
      }
    } catch {
      setPhase('not_found');
    }
  }

  function handleReset() {
    scanLocked.current = false;
    setProduct(null);
    setScannedBarcode('');
    setPhase('scanning');
  }

  function handleManualSuccess(p: ProductCatalogProduct) {
    setProduct(p);
    setPhase('found');
  }

  function handleOpenManual() {
    setPhase('manual');
  }

  // ── Permission states ──────────────────────────────────────────────────────

  if (!permission) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScreenHeader title={t('barcode.title')} />
        <View style={styles.body}>
          <ActivityIndicator color={colors.primaryGreen} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScreenHeader title={t('barcode.title')} />
        <View style={styles.body}>
          <View style={styles.permissionCard}>
            <View style={styles.iconBubble}>
              <MaterialCommunityIcons name="camera-off" size={40} color={colors.primaryGreen} />
            </View>
            <Text style={[styles.permissionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('barcode.permissionTitle')}
            </Text>
            <Text style={[styles.permissionMessage, { textAlign: isRTL ? 'right' : 'left' }]}>
              {permission.canAskAgain
                ? t('barcode.permissionMessage')
                : t('barcode.permissionDenied')}
            </Text>
            {permission.canAskAgain ? (
              <Pressable
                style={({ pressed }) => [styles.permissionBtn, pressed && styles.permissionBtnPressed]}
                onPress={requestPermission}
              >
                <Text style={styles.permissionBtnText}>{t('barcode.permissionButton')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Product found ──────────────────────────────────────────────────────────

  if (phase === 'found' && product) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <View style={styles.glowTop} />
          <View style={styles.glowSide} />
        </View>
        <ScreenHeader title={t('barcode.title')} />
        <View style={styles.body}>
          <ProductCatalogCard product={product} onScanAnother={handleReset} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Manual entry ───────────────────────────────────────────────────────────

  if (phase === 'not_found' || phase === 'manual') {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <View style={styles.glowTop} />
          <View style={styles.glowSide} />
        </View>
        <ScreenHeader title={t('barcode.title')} />
        <View style={styles.body}>
          {phase === 'not_found' ? (
            <View style={[styles.notFoundBanner, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <MaterialCommunityIcons name="barcode-off" size={16} color={colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.notFoundTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('barcode.notFound')}
                </Text>
                <Text style={[styles.notFoundHint, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('barcode.notFoundHint')}
                </Text>
              </View>
            </View>
          ) : null}

          <ManualProductCatalogForm
            barcode={scannedBarcode}
            onSuccess={handleManualSuccess}
            onCancel={handleReset}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Camera scanning / loading ──────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.glowTop} />
        <View style={styles.glowSide} />
      </View>

      <ScreenHeader title={t('barcode.title')} />

      <View style={styles.body}>
        <View style={styles.scanCard}>
          <View style={styles.scanArea}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={phase === 'loading' ? undefined : handleScan}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'qr'],
              }}
            />

            <View style={styles.scanCornerTL} />
            <View style={styles.scanCornerTR} />
            <View style={styles.scanCornerBL} />
            <View style={styles.scanCornerBR} />

            {phase === 'loading' ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primaryGreen} />
                <Text style={styles.loadingText}>{t('barcode.searching')}</Text>
              </View>
            ) : (
              <View style={styles.scanLine} />
            )}
          </View>

          <Text
            style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}
          >
            {t('barcode.subtitle')}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.manualBtn,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
            pressed && styles.manualBtnPressed,
          ]}
          onPress={handleOpenManual}
        >
          <View style={styles.manualIconCircle}>
            <MaterialCommunityIcons name="pencil-outline" size={17} color={colors.primaryGreen} />
          </View>
          <Text style={styles.manualBtnText}>{t('barcode.manualButton')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
