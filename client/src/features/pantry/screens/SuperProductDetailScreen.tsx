import { ReactNode, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { StateView } from "../../../shared/components/ui/StateView";
import { Button } from "../../../shared/components/ui/Button";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useDirection } from "../../../shared/hooks/useDirection";
import { useAppTheme } from "../../../shared/theme";
import { useCatalogItem } from "../hooks/usePantry";
import { useSuperPantry } from "../hooks/useSuperCatalog";
import { CatalogFact, catalogBasis, catalogFacts, catalogSummary, formatFactValue } from "../helpers/catalogNutrition";
import { CatalogProductDetail } from "../types";
import { useStyles } from "./styles/SuperProductDetailScreen.styles";

type Props = { id: string };

type SectionKey = "nutrition" | "ingredients" | "allergens" | "brand";

const SECTION_ICONS = {
  nutrition: "chart-bar",
  ingredients: "format-list-bulleted",
  allergens: "alert-circle-outline",
  brand: "tag-outline",
} as const satisfies Record<SectionKey, string>;

export function SuperProductDetailScreen({ id }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const dir = useDirection();
  const { width } = useWindowDimensions();
  const { data: item, isLoading, isError, refetch } = useCatalogItem(id);
  const { add, remove, pendingIds } = useSuperPantry();
  const [open, setOpen] = useState<SectionKey | null>(null);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(app)/pantry/super");
  }

  const backButton = (
    <IconButton
      icon={dir.backIcon}
      variant="glass"
      size={42}
      iconSize={24}
      color={colors.textPrimary}
      accessibilityLabel={t("super.detail.back")}
      onPress={goBack}
      style={styles.backButton}
    />
  );

  if (isLoading || isError || !item) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.statusHeader, dir.row]}>{backButton}</View>
        {isLoading ? (
          <StateView variant="loading" />
        ) : (
          <StateView
            variant="error"
            message={t("super.detail.loadFailed")}
            actionLabel={t("super.detail.retry")}
            onAction={() => void refetch()}
          />
        )}
      </View>
    );
  }

  const heroHeight = Math.round(Math.min(width, 520) * 0.78);
  const isPending = pendingIds.has(item.id);
  const summary = catalogSummary(item);
  const basis = catalogBasis(item);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: heroHeight + insets.top }]}>
          <View style={styles.heroGlow} />
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.heroImage, { marginTop: insets.top + 24 }]}
              contentFit="contain"
              transition={120}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={[styles.heroPlaceholder, { marginTop: insets.top + 24 }]}>
              <MaterialCommunityIcons name="food-variant" size={72} color={colors.textMuted} />
            </View>
          )}
          <View style={[styles.heroControls, dir.row, { top: insets.top + 8 }]}>{backButton}</View>
        </View>

        <View style={styles.body}>
          <View style={[styles.identity, dir.row]}>
            <View style={[styles.identityText, dir.alignStart]}>
              <Text style={[styles.name, dir.text]} accessibilityRole="header" numberOfLines={3}>
                {item.name}
              </Text>
              {item.brand ? (
                <Text style={[styles.brand, dir.text]} numberOfLines={1}>
                  {item.brand}
                </Text>
              ) : null}
            </View>
            {item.verificationStatus === "ADMIN_VERIFIED" ? (
              <View style={[styles.verified, dir.row]}>
                <MaterialCommunityIcons name="check-circle" size={16} color={colors.accentFill} />
                <Text style={styles.verifiedLabel}>{t("super.detail.verified")}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.panel} accessible accessibilityLabel={summaryLabel(summary, basis, t)}>
            <View style={[styles.panelRow, dir.row]}>
              {summary.map((fact, index) => (
                <View key={fact.key} style={[styles.panelCellWrap, dir.row]}>
                  {index > 0 ? <View style={styles.panelDivider} /> : null}
                  <View style={styles.panelCell}>
                  <Text style={styles.panelValue} numberOfLines={1}>
                    {fact.value === null ? "—" : formatFactValue(fact)}
                  </Text>
                  <Text style={styles.panelUnit} numberOfLines={1}>
                    {t(`super.detail.${fact.unit}`)}
                  </Text>
                  <Text style={styles.panelLabel} numberOfLines={1}>
                    {t(`super.detail.${fact.key}`)}
                  </Text>
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.panelBasis}>{t(`super.detail.${basis}`)}</Text>
          </View>

          <Section
            id="nutrition"
            title={t("super.detail.nutritionTitle")}
            open={open === "nutrition"}
            onToggle={setOpen}
          >
            <NutritionFacts item={item} />
          </Section>

          <Section
            id="ingredients"
            title={t("super.detail.ingredientsTitle")}
            preview={item.ingredientsText ?? t("super.detail.unavailable")}
            open={open === "ingredients"}
            onToggle={setOpen}
          >
            <Text style={[styles.sectionText, dir.text]}>
              {item.ingredientsText ?? t("super.detail.ingredientsUnavailable")}
            </Text>
          </Section>

          <Section
            id="allergens"
            title={t("super.detail.allergensTitle")}
            preview={item.allergensText ?? t("super.detail.unavailable")}
            open={open === "allergens"}
            onToggle={setOpen}
          >
            <Text style={[styles.sectionText, dir.text]}>
              {item.allergensText ?? t("super.detail.allergensUnavailable")}
            </Text>
          </Section>

          <Section
            id="brand"
            title={t("super.detail.brandTitle")}
            preview={item.brand ?? item.manufacturer ?? t("super.detail.unavailable")}
            open={open === "brand"}
            onToggle={setOpen}
          >
            <BrandDetails item={item} />
          </Section>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {item.pantryProductId ? (
          <View style={[styles.footerRow, dir.row]}>
            <View style={styles.footerAction}>
              <Button
                label={t("super.viewInPantry")}
                icon="check-circle"
                variant="secondary"
                fullWidth
                disabled={isPending}
                onPress={() => router.push(`/(app)/pantry/${item.pantryProductId}`)}
              />
            </View>
            <View style={styles.footerAction}>
              <Button
                label={t("super.removeFromPantry")}
                icon="minus-circle-outline"
                variant="danger"
                fullWidth
                loading={isPending}
                onPress={() => void remove(item)}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.footerRow, dir.row]}>
            <View style={styles.footerAction}>
              <Button
                label={t("super.addWithServing")}
                icon="scale-balance"
                variant="secondary"
                fullWidth
                disabled={isPending}
                onPress={() =>
                  router.push({ pathname: "/(app)/pantry/add-product", params: { catalogId: item.id } })
                }
              />
            </View>
            <View style={styles.footerAction}>
              <Button
                label={t("super.addToPantry")}
                icon="plus"
                fullWidth
                loading={isPending}
                onPress={() => void add(item)}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function summaryLabel(summary: CatalogFact[], basis: string, t: ReturnType<typeof useTranslation<"pantry">>["t"]) {
  const parts = summary.map(
    (fact) =>
      `${t(`super.detail.${fact.key}`)} ${fact.value === null ? t("super.detail.unavailable") : `${formatFactValue(fact)} ${t(`super.detail.${fact.unit}`)}`}`,
  );
  return `${parts.join(", ")}. ${t(`super.detail.${basis}` as "super.detail.per100g")}`;
}

function Section({
  id,
  title,
  preview,
  open,
  onToggle,
  children,
}: {
  id: SectionKey;
  title: string;
  preview?: string;
  open: boolean;
  onToggle: (next: SectionKey | null) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const dir = useDirection();

  return (
    <View style={[styles.section, open && styles.sectionOpen]}>
      <Pressable
        onPress={() => onToggle(open ? null : id)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t(open ? "super.detail.collapseA11y" : "super.detail.expandA11y", { section: title })}
        style={[styles.sectionHeader, dir.row]}
      >
        <View style={styles.sectionIcon}>
          <MaterialCommunityIcons name={SECTION_ICONS[id]} size={18} color={colors.textPrimary} />
        </View>
        <View style={[styles.sectionTitles, dir.alignStart]}>
          <Text style={[styles.sectionTitle, dir.text]}>{title}</Text>
          {preview && !open ? (
            <Text style={[styles.sectionPreview, dir.text]} numberOfLines={1}>
              {preview}
            </Text>
          ) : null}
        </View>
        <MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={22} color={colors.textSecondary} />
      </Pressable>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

function NutritionFacts({ item }: { item: CatalogProductDetail }) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const facts = catalogFacts(item);

  return (
    <View>
      <Text style={[styles.factsBasis, dir.text]}>{t(`super.detail.${catalogBasis(item)}`)}</Text>
      {facts.map((fact) => (
        <View key={fact.key} style={[styles.factRow, dir.row]}>
          <Text
            style={[
              fact.nested ? styles.factLabelNested : styles.factLabel,
              dir.text,
              fact.nested && (dir.isRTL ? styles.indentRight : styles.indentLeft),
            ]}
          >
            {t(`super.detail.${fact.key}`)}
          </Text>
          <Text style={fact.value === null ? styles.factMissing : styles.factValue}>
            {fact.value === null
              ? t("super.detail.unavailable")
              : `${formatFactValue(fact)} ${t(`super.detail.${fact.unit}`)}`}
          </Text>
        </View>
      ))}
      {item.servingSizeText || item.servingSizeGrams ? (
        <View style={[styles.factRow, dir.row]}>
          <Text style={[styles.factLabel, dir.text]}>{t("super.detail.serving")}</Text>
          <Text style={styles.factValue}>
            {item.servingSizeText ?? `${item.servingSizeGrams} ${t("super.detail.grams")}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function BrandDetails({ item }: { item: CatalogProductDetail }) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const rows = [
    { key: "brand", value: item.brand },
    { key: "manufacturer", value: item.manufacturer },
    { key: "barcode", value: item.barcode },
    { key: "country", value: item.countryCode },
  ].filter((row): row is { key: string; value: string } => Boolean(row.value));

  if (rows.length === 0) {
    return <Text style={[styles.sectionText, dir.text]}>{t("super.detail.brandUnavailable")}</Text>;
  }

  return (
    <View>
      {rows.map((row) => (
        <View key={row.key} style={[styles.factRow, dir.row]}>
          <Text style={[styles.factLabel, dir.text]}>{t(`super.detail.${row.key}` as "super.detail.brand")}</Text>
          <Text style={styles.factValue} selectable>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
