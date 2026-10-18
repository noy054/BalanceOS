import { useEffect, useRef, useState } from "react";
import { Alert, Animated, View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { BarcodeScanningResult } from "expo-camera";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { ProductCatalogCard } from "../components/products/ProductCatalogCard";
import { BarcodeManualProductForm } from "../components/products/BarcodeManualProductForm";
import { useBarcodeResolver } from "../hooks/useBarcodeResolver";
import { getBarcodeLookupErrorKey, isScannableBarcode } from "../helpers/barcode";
import { SCANNABLE_BARCODE_TYPES } from "../constants";
import { PantryProduct, ProductCatalogProduct } from "../types";
import { useRecipeReturn } from "../recipeReturnStore";
import { useMealReturn } from "../mealReturnStore";
import { usePantryHighlight } from "../pantryHighlightStore";
import { useAppTheme } from "../../../shared/theme";
import { useStyles } from "./styles/BarcodeScreen.styles";

type Phase = "scanning" | "loading" | "found" | "not_found" | "manual" | "exists";

export function BarcodeScreen() {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";

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

    return navigation.addListener("beforeRemove", () => {
      if (productWasSavedRef.current) {
        productWasSavedRef.current = false;
        return;
      }
      setReopenPicker(true);
    });
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

  // Animate the scan line up and down while actively scanning
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

  async function handleScan({ data, type }: BarcodeScanningResult) {
    if (__DEV__) {
      console.log("[barcode]", { type, data, valid: isScannableBarcode(data), locked: scanLocked.current });
    }
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

  function handleManualSuccess(p: PantryProduct) {
    handleProductAdded(p);
    router.back();
  }

  function handleOpenManual() {
    setPhase("manual");
  }

  // ── Permission states ──────────────────────────────────────────────────────

  if (!permission) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader
          title={t("barcode.title")}
          onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
        />
        <View style={styles.body}>
          <ActivityIndicator color={colors.primaryGreen} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader
          title={t("barcode.title")}
          onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
        />
        <View style={styles.body}>
          <View style={styles.permissionCard}>
            <View style={styles.iconBubble}>
              <MaterialCommunityIcons
                name="camera-off"
                size={40}
                color={colors.primaryGreen}
              />
            </View>
            <Text
              style={[
                styles.permissionTitle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("barcode.permissionTitle")}
            </Text>
            <Text
              style={[
                styles.permissionMessage,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {permission.canAskAgain
                ? t("barcode.permissionMessage")
                : t("barcode.permissionDenied")}
            </Text>
            {permission.canAskAgain ? (
              <Pressable
                style={({ pressed }) => [
                  styles.permissionBtn,
                  pressed && styles.permissionBtnPressed,
                ]}
                onPress={requestPermission}
              >
                <Text style={styles.permissionBtnText}>
                  {t("barcode.permissionButton")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Product already in pantry ─────────────────────────────────────────────

  if (phase === "exists" && existingPantryProduct) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <View style={styles.glowTop} />
          <View style={styles.glowSide} />
        </View>
        <ScreenHeader
          title={t("barcode.title")}
          onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
        />
        <View style={styles.body}>
          <View style={styles.existsCard}>
            <View style={styles.existsIconRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={36}
                color={colors.primaryGreen}
              />
              <Text style={styles.existsTitle}>{t("barcode.existsTitle")}</Text>
            </View>
            <Text
              style={[styles.existsName, { textAlign: isRTL ? "right" : "left" }]}
              numberOfLines={2}
            >
              {existingPantryProduct.name}
            </Text>
            {existingPantryProduct.brand ? (
              <Text
                style={[styles.existsBrand, { textAlign: isRTL ? "right" : "left" }]}
                numberOfLines={1}
              >
                {existingPantryProduct.brand}
              </Text>
            ) : null}
            <Text
              style={[styles.existsHint, { textAlign: isRTL ? "right" : "left" }]}
            >
              {t("barcode.existsProductIn")}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.viewPantryBtn,
              { flexDirection: isRTL ? "row-reverse" : "row" },
              pressed && styles.viewPantryBtnPressed,
            ]}
            onPress={handleViewInPantry}
          >
            <MaterialCommunityIcons
              name="package-variant"
              size={17}
              color="#000"
            />
            <Text style={styles.viewPantryBtnText}>{t("barcode.viewInPantry")}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.manualBtn,
              { flexDirection: isRTL ? "row-reverse" : "row" },
              pressed && styles.manualBtnPressed,
            ]}
            onPress={handleReset}
          >
            <View style={styles.manualIconCircle}>
              <MaterialCommunityIcons
                name="barcode-scan"
                size={17}
                color={colors.primaryGreen}
              />
            </View>
            <Text style={styles.manualBtnText}>{t("barcode.scanAnother")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Product found ──────────────────────────────────────────────────────────

  if (phase === "found" && product) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <View style={styles.glowTop} />
          <View style={styles.glowSide} />
        </View>
        <ScreenHeader
          title={t("barcode.title")}
          onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProductCatalogCard
            product={product}
            onScanAnother={handleReset}
            onAdded={handleProductAdded}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Manual entry ───────────────────────────────────────────────────────────

  if (phase === "not_found" || phase === "manual") {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <View style={styles.glowTop} />
          <View style={styles.glowSide} />
        </View>
        <ScreenHeader
          title={t("barcode.title")}
          onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
        />
        <View style={styles.body}>
          {phase === "not_found" ? (
            <View
              style={[
                styles.notFoundBanner,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <MaterialCommunityIcons
                name="barcode-off"
                size={16}
                color={colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.notFoundTitle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {t("barcode.notFound")}
                </Text>
                <Text
                  style={[
                    styles.notFoundHint,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {t("barcode.notFoundHint")}
                </Text>
              </View>
            </View>
          ) : null}

          <BarcodeManualProductForm
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
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.glowTop} />
        <View style={styles.glowSide} />
      </View>

      <ScreenHeader
        title={t("barcode.title")}
        onBack={fromRecipePicker ? handleBackFromRecipe : undefined}
      />

      <View style={styles.body}>
        <View style={styles.scanCard}>
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
                <ActivityIndicator size="large" color={colors.primaryGreen} />
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
                        outputRange: [-85, 85],
                      }),
                    }],
                  },
                ]}
              />
            )}
          </View>

          <Text
            style={[styles.subtitle, { textAlign: isRTL ? "right" : "left" }]}
          >
            {t("barcode.subtitle")}
          </Text>
          <Text
            style={[styles.distanceHint, { textAlign: isRTL ? "right" : "left" }]}
          >
            {t("barcode.distanceHint")}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.manualBtn,
            { flexDirection: isRTL ? "row-reverse" : "row" },
            pressed && styles.manualBtnPressed,
          ]}
          onPress={handleOpenManual}
        >
          <View style={styles.manualIconCircle}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={17}
              color={colors.primaryGreen}
            />
          </View>
          <Text style={styles.manualBtnText}>{t("barcode.manualButton")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
