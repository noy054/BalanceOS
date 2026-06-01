import { Fragment } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { MacroItem } from "../types";
import { MacroProgressItem } from "./MacroProgressItem";
import { styles } from "./styles/MacroSummaryCard.styles";

type Props = {
  macros: MacroItem[];
};

export function MacroSummaryCard({ macros }: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === "rtl";

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.content,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        {macros.map((macro, index) => (
          <Fragment key={macro.key}>
            {index > 0 && <View style={styles.divider} />}
            <MacroProgressItem macro={macro} />
          </Fragment>
        ))}
      </View>
    </View>
  );
}
