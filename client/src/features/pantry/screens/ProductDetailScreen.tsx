import { useState } from "react";
import { ScrollView, Alert, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { StateView } from "../../../shared/components/ui/StateView";
import { ActionSheet } from "../../../shared/components/ui/ActionSheet";
import { usePantryProduct, useDeletePantryProduct } from "../hooks/usePantry";
import { useProductCalculator } from "../hooks/useProductCalculator";
import { NutritionFactsCard } from "../components/nutrition/NutritionFactsCard";
import { ProductCalculatorCard } from "../components/products/ProductCalculatorCard";
import { useStyles } from "./styles/ProductDetailScreen.styles";
import { keyboardBehavior } from "../../../shared/components/ui/KeyboardAvoider";

type Props = {
  id: string;
};

export function ProductDetailScreen({ id }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const styles = useStyles();
  const isRTL = i18n.dir(i18n.language) === "rtl";

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <ScreenHeader title={t("productDetail.title")} fallbackRoute="/(app)/pantry" />
        <StateView variant="loading" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScreenHeader title={t("productDetail.title")} fallbackRoute="/(app)/pantry" />
        <StateView variant="error" message={t("errors.loadFailed")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScreenHeader
        title={t("productDetail.title")}
        fallbackRoute="/(app)/pantry"
        rightIconName="dots-vertical"
        rightAccessibilityLabel={t("common.moreOptionsFor", { name: product.name })}
        onRightPress={() => setIsMenuOpen(true)}
      />

      <KeyboardAvoidingView
        style={styles.scroll}
        behavior={keyboardBehavior}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <NutritionFactsCard product={product} t={t} isRTL={isRTL} />

          <ProductCalculatorCard
            quantity={quantity}
            unit={unit}
            serving={product}
            calcResult={calcResult}
            isRTL={isRTL}
            t={t}
            gramsResult={gramsResult}
            onChangeQuantity={updateQuantity}
            onSelectUnit={selectUnit}
            onCalculate={calculate}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionSheet
        visible={isMenuOpen}
        title={product.name}
        onClose={() => setIsMenuOpen(false)}
        actions={[
          {
            key: "edit",
            label: t("common.edit"),
            icon: "pencil-outline",
            onPress: handleEdit,
          },
          {
            key: "delete",
            label: t("common.delete"),
            icon: "trash-can-outline",
            destructive: true,
            disabled: deleteProduct.isPending,
            onPress: handleDelete,
          },
        ]}
      />
    </SafeAreaView>
  );
}
