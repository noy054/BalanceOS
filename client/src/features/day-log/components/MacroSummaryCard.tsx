import { Fragment } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { MacroItem } from "../types";
import { MacroProgressItem } from "./MacroProgressItem";
import { useStyles } from "./styles/MacroSummaryCard.styles";

type Props = {
  macros: MacroItem[];
  showProgressPercentages?: boolean;
};

export function MacroSummaryCard({
  macros,
  showProgressPercentages = true,
}: Props) {
  const { i18n } = useTranslation();
  const styles = useStyles();
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

            <MacroProgressItem
              macro={macro}
              showProgressPercentage={showProgressPercentages}
            />
          </Fragment>
        ))}
      </View>
    </View>
  );
}
