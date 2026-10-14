import { View } from "react-native";
import { TFunction } from "i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { ProductFormErrors, ProductFormState } from "../../helpers/productForm";
import { useStyles } from "./styles/ProductBasicInfoForm.styles";

type Props = {
  t: TFunction<"pantry">;
  language: string;
  errors: ProductFormErrors;
  autoFocus: boolean;
  field: (key: keyof ProductFormState) => {
    value: string;
    onChangeText: (text: string) => void;
  };
};

export function ProductBasicInfoForm({
  t,
  language,
  errors,
  autoFocus,
  field,
}: Props) {
  const styles = useStyles();

  return (
    <View style={styles.formCard}>
      <FormInput
        key={`name-${language}`}
        label={t("product.nameLabel")}
        error={errors.name}
        autoFocus={autoFocus}
        {...field("name")}
      />

      <FormInput
        key={`brand-${language}`}
        label={t("product.brandLabel")}
        error={errors.brand}
        {...field("brand")}
      />
    </View>
  );
}
