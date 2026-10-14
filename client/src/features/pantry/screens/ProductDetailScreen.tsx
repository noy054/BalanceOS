import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { useAppTheme } from "../../../shared/theme";
import { usePantryProduct, useDeletePantryProduct } from "../hooks/usePantry";
import { useProductCalculator } from "../hooks/useProductCalculator";
import { ProductHeaderActions } from "../components/products/ProductHeaderActions";
import { NutritionFactsCard } from "../components/nutrition/NutritionFactsCard";
import { ProductCalculatorCard } from "../components/products/ProductCalculatorCard";
import { useStyles } from "./styles/ProductDetailScreen.styles";

type Props = {
  id: string;
};

export function ProductDetailScreen({ id }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";

  const { data: product, isLoading } = usePantryProduct(id);
  const deleteProduct = useDeletePantryProduct();

  const { quantity, unit, calcResult, gramsResult, updateQuantity, selectUnit, calculate } =
    useProductCalculator(product);

  function handleEdit() {
    router.push({
      pathname: "/(app)/pantry/add-product",
      params: {
        id,
        mode: "edit",
      },
    });
  }

  function navigateAfterDelete() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(app)/pantry");
  }

  function handleDelete() {
    Alert.alert(
      t("productDetail.deleteConfirmTitle"),
      t("productDetail.deleteConfirmMessage"),
      [
        {
          text: t("productDetail.deleteConfirmNo"),
          style: "cancel",
        },
        {
          text: t("productDetail.deleteConfirmYes"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct.mutateAsync(id);
              navigateAfterDelete();
            } catch {
              Alert.alert("", t("errors.deleteFailed"));
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("errors.loadFailed")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.glowTop} />
        <View style={styles.glowSide} />
      </View>

      <ScreenHeader
        title={product.name}
        fallbackRoute="/(app)/pantry"
        rightElement={
          <ProductHeaderActions
            isRTL={isRTL}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <NutritionFactsCard product={product} t={t} isRTL={isRTL} />

        <ProductCalculatorCard
          quantity={quantity}
          unit={unit}
          servingSizeG={product?.servingSizeG}
          calcResult={calcResult}
          isRTL={isRTL}
          t={t}
          gramsResult={gramsResult}
          onChangeQuantity={updateQuantity}
          onSelectUnit={selectUnit}
          onCalculate={calculate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
