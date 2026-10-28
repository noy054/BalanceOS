import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "../../../shared/components/ScreenHeader";
import { StateView } from "../../../shared/components/ui/StateView";
import { useThemedStyles } from "../../../shared/theme";
import { useAuthStore } from "../../auth/hooks/useAuthStore";

type Props = {
  title: string;
  rightElement?: ReactNode;
  children: ReactNode;
};

export function AdminScaffold({ title, rightElement, children }: Props) {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const isAdmin = useAuthStore((state) => state.user?.role === "ADMIN");

  return (
    <SafeAreaView style={styles.root} edges={["top"]} key={i18n.language}>
      <ScreenHeader title={title} rightElement={isAdmin ? rightElement : undefined} />
      {isAdmin ? (
        children
      ) : (
        <StateView variant="error" icon="shield-lock-outline" message={t("admin.notAllowed")} />
      )}
    </SafeAreaView>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
    }),
  );
