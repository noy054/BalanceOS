import { useEffect, useRef, useState } from "react";
import { Alert, Animated, View, Text, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { BarcodeScanningResult } from "expo-camera";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { Button } from "../../../shared/components/ui/Button";
import { StateView } from "../../../shared/components/ui/StateView";
import { ProductCatalogCard } from "../components/products/ProductCatalogCard";
import { useBarcodeResolver } from "../hooks/useBarcodeResolver";
import { getBarcodeLookupErrorKey, isScannableBarcode } from "../helpers/barcode";
import { SCANNABLE_BARCODE_TYPES } from "../constants";
import { PantryProduct, ProductCatalogProduct } from "../types";
import { useRecipeReturn } from "../recipeReturnStore";
import { useMealReturn } from "../mealReturnStore";
import { usePantryHighlight } from "../pantryHighlightStore";
import { cameraColors, useAppTheme } from "../../../shared/theme";
import { useStyles } from "./styles/BarcodeScreen.styles";
import { useDirection } from "../../../shared/hooks/useDirection";

type Phase = "scanning" | "loading" | "found" | "not_found" | "exists";

export function BarcodeScreen() {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();

  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const setPending = useRecipeReturn((s) => s.setPending);
  const setReopenPicker = useRecipeReturn((s) => s.setReopenPicker);
  const setMealPending = useMealReturn((s) => s.setPending);

  const fromRecipePicker = returnTo === "recipe";
  const fromMealFlow = returnTo === "meal";

  const setHighlight = usePantryHighlight((s) => s.setHighlight);

  const navigation = useNavigation();
  const productWasSavedRef = useRef(false);

  useEffect(() => {
    if (!fromRecipePicker) return;

    const unsubscribe = navigation.addListener("removed", () => {
      if (productWasSavedRef.current) {
        productWasSavedRef.current = false;
        return;
      }
      setReopenPicker(true);
    });

    return () => queueMicrotask(unsubscribe);
  }, [navigation, fromRecipePicker, setReopenPicker]);

  function handleProductAdded(product: PantryProduct) {
    productWasSavedRef.current = true;
    if (fromRecipePicker) {
      setPending(product);
    } else if (fromMealFlow) {
      setMealPending(product);
    } else {
      setHighlight(product.id);
    }
  }

  function handleBackFromRecipe() {
    setReopenPicker(true);
    router.back();
  }

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("scanning");
  const [product, setProduct] = useState<ProductCatalogProduct | null>(null);
  const [existingPantryProduct, setExistingPantryProduct] = useState<PantryProduct | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const scanLocked = useRef(false);
  const resolveBarcode = useBarcodeResolver();

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (phase !== "scanning") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, scanLineAnim]);

  async function handleScan({ data }: BarcodeScanningResult) {
    if (scanLocked.current) return;
    const barcode = data.trim();
    if (!isScannableBarcode(barcode)) return;
    scanLocked.current = true;
    setScannedBarcode(barcode);
    setPhase("loading");

    try {
      const result = await resolveBarcode(barcode);

      if (result.status === "IN_PANTRY") {
        if (fromRecipePicker || fromMealFlow) {
          handleProductAdded(result.pantryProduct);
          router.back();
          return;
        }
        setExistingPantryProduct(result.pantryProduct);
        setPhase("exists");
      } else if (result.status === "IN_CATALOG") {
        setProduct(result.catalogItem);
        setPhase("found");
      } else {
        setPhase("not_found");
      }
    } catch (err: unknown) {
      Alert.alert("", t(getBarcodeLookupErrorKey(err)), [{ text: t("barcode.retry"), onPress: handleReset }], {
        cancelable: true,
        onDismiss: handleReset,
      });
    }
  }

  function handleViewInPantry() {
    if (!existingPantryProduct) return;
    setHighlight(existingPantryProduct.id);
    router.navigate("/(app)/pantry");
  }

  function handleReset() {
    scanLocked.current = false;
    setProduct(null);
    setExistingPantryProduct(null);
    setScannedBarcode("");
    setPhase("scanning");
  }

  function openEditor(params: { barcode?: string; catalogId?: string }) {
    productWasSavedRef.current = true;
    router.replace({
      pathname: "/(app)/pantry/add-product",
      params: {
        ...(params.barcode ? { barcode: params.barcode } : {}),
        ...(params.catalogId ? { catalogId: params.catalogId } : {}),
        ...(fromRecipePicker || fromMealFlow ? { returnTo } : {}),
      },
    });
  }

  function handleOpenManual() {
    openEditor({ barcode: scannedBarcode || undefined });
  }

  const header = (
    <ScreenHeader
      title={t("barcode.title")}
      onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
    />
  );

  // ── Permission states ──────────────────────────────────────────────────────

  if (!permission) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        {header}
        <StateView variant="loading" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        {header}
        <StateView
          variant="empty"
          icon="camera-off-outline"
          title={t("barcode.permissionTitle")}
          message={
            permission.canAskAgain
              ? t("barcode.permissionMessage")
              : t("barcode.permissionDenied")
          }
        />
        {permission.canAskAgain ? (
          <View style={styles.bottomActions}>
            <Button
              label={t("barcode.permissionButton")}
              onPress={requestPermission}
              fullWidth
            />
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  // ── Product already in pantry ─────────────────────────────────────────────

  if (phase === "exists" && existingPantryProduct) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        {header}
        <View style={styles.body}>
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <MaterialCommunityIcons name="check" size={26} color={colors.success} />
            </View>

            <Text style={styles.resultTitle}>{t("barcode.existsTitle")}</Text>

            <Text style={styles.resultName} numberOfLines={2}>
              {existingPantryProduct.name}
            </Text>

            {existingPantryProduct.brand ? (
              <Text style={styles.resultMeta} numberOfLines={1}>
                {existingPantryProduct.brand}
              </Text>
            ) : null}

            <Text style={styles.resultHint}>{t("barcode.existsProductIn")}</Text>
          </View>

          <View style={styles.actionsStack}>
            <Button
              label={t("barcode.viewInPantry")}
              icon="package-variant"
              onPress={handleViewInPantry}
              fullWidth
            />

            <Button
              label={t("barcode.scanAnother")}
              icon="barcode-scan"
              variant="secondary"
              onPress={handleReset}
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Product found ──────────────────────────────────────────────────────────

  if (phase === "found" && product) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        {header}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <ProductCatalogCard
            product={product}
            onScanAnother={handleReset}
            onAdded={handleProductAdded}
            onEdit={() => openEditor({ catalogId: product.id })}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (phase === "not_found") {
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        {header}
        <View style={styles.body}>
          <View style={styles.resultCard} accessibilityRole="alert">
            <View style={[styles.resultIcon, styles.resultIconWarning]}>
              <MaterialCommunityIcons name="barcode-off" size={26} color={colors.warning} />
            </View>
            <Text style={styles.resultTitle}>{t("barcode.notFound")}</Text>
            {scannedBarcode ? <Text style={styles.resultMeta}>{scannedBarcode}</Text> : null}
            <Text style={styles.resultHint}>{t("barcode.notFoundCreateHint")}</Text>
          </View>

          <View style={styles.actionsStack}>
            <Button
              label={t("barcode.createProduct")}
              icon="plus"
              onPress={handleOpenManual}
              fullWidth
            />
            <Button
              label={t("barcode.scanAnother")}
              icon="barcode-scan"
              variant="secondary"
              onPress={handleReset}
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Camera scanning / loading ──────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {header}

      <View style={styles.body}>
        <View style={styles.scanArea}>
          <CameraView
            style={styles.camera}
            facing="back"
            autofocus="off"
            zoom={0}
            onBarcodeScanned={handleScan}
            barcodeScannerSettings={{
              barcodeTypes: [...SCANNABLE_BARCODE_TYPES],
            }}
          />

          <View style={styles.scanCornerTL} />
          <View style={styles.scanCornerTR} />
          <View style={styles.scanCornerBL} />
          <View style={styles.scanCornerBR} />

          {phase === "loading" ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={cameraColors.foreground} />
              <Text style={styles.loadingText}>{t("barcode.searching")}</Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-90, 90],
                    }),
                  }],
                },
              ]}
            />
          )}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.subtitle}>{t("barcode.subtitle")}</Text>
          <Text style={styles.distanceHint}>{t("barcode.distanceHint")}</Text>
        </View>
      </View>

      <View style={styles.bottomActions}>
        <Button
          label={t("barcode.manualButton")}
          icon="pencil-outline"
          variant="secondary"
          onPress={handleOpenManual}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
