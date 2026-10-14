import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { PantryProduct } from "../../types";
import { useAppTheme } from "../../../../shared/theme";
import { useProductCalculator } from "../../hooks/useProductCalculator";
import { ProductCalculatorCard } from "./ProductCalculatorCard";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/ProductCalculatorModal.styles";

type ProductWithImage = PantryProduct & {
  imageUrl?: string | null;
};

type Props = {
  product: ProductWithImage | null;
  visible: boolean;
  onClose: () => void;
};

export function ProductCalculatorModal({ product, visible, onClose }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const { quantity, unit, calcResult, gramsResult, updateQuantity, selectUnit, calculate } =
    useProductCalculator(product);

  if (!product) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.card}>
            <View style={[styles.header, dir.headerRow]}>
              <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color={colors.textPrimary}
                />
              </Pressable>

              <View style={styles.titleGroup}>
                <Text style={[styles.title, dir.text]} numberOfLines={1}>
                  {product.name}
                </Text>

                <Text style={[styles.subtitle, dir.text]} numberOfLines={1}>
                  {t("productCalculator.quickTitle", {
                    defaultValue: "חישוב מהיר",
                  })}
                </Text>
              </View>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <ProductCalculatorCard
                quantity={quantity}
                unit={unit}
                servingSizeG={product.servingSizeG}
                calcResult={calcResult}
                isRTL={isRTL}
                t={t}
                gramsResult={gramsResult}
                onChangeQuantity={updateQuantity}
                onSelectUnit={selectUnit}
                onCalculate={calculate}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
