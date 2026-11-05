import { useState } from "react";
import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";

import { DateKey, fromDateKey } from "../../../shared/helpers/dateKey";
import { useDirection } from "../../../shared/hooks/useDirection";
import { track } from "../../analytics/analytics";
import { useAuthStore } from "../../auth/hooks/useAuthStore";
import { useMacroVisibility } from "../../pantry/hooks/useMacroVisibility";
import { useServingFormat } from "../../pantry/hooks/useServingFormat";
import { reportsApi } from "../api/reportsApi";
import { buildReportHtml, ReportNutrient, ReportText } from "../helpers/reportHtml";
import { ReportItem, ReportPeriod } from "../types";
import { isSubscriptionRequired } from "../../billing/helpers/billingErrors";

const MEAL_KEYS: Record<string, string> = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACK_1: "snack",
  SNACK_2: "snack2",
};

export function useExportPdf() {
  const { t, i18n } = useTranslation("settings");
  const { t: tStats } = useTranslation("statistics");
  const { t: tDashboard } = useTranslation("dashboard");
  const { t: tPantry } = useTranslation("pantry");
  const dir = useDirection();
  const visibility = useMacroVisibility();
  const servingFormat = useServingFormat();
  const userName = useAuthStore((state) => state.user?.fullName ?? null);
  const [isExporting, setIsExporting] = useState(false);

  const language = i18n.language;
  const longDate = (date: string) =>
    fromDateKey(date).toLocaleDateString(language, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const shortDate = (date: string) =>
    fromDateKey(date).toLocaleDateString(language, { weekday: "short", day: "numeric", month: "numeric" });
  const plainDate = (date: string) =>
    fromDateKey(date).toLocaleDateString(language, { day: "numeric", month: "long", year: "numeric" });

  function amountLabel(item: ReportItem) {
    if (item.kind === "SAVED_MEAL") return t("export.wholeMeal");
    if (item.kind === "RECIPE") {
      return item.servings != null ? tPantry("foodCard.recipeServings", { count: item.servings }) : "—";
    }
    if (item.serving && (item.grams != null || item.servings != null || item.milliliters != null)) {
      return servingFormat.amount(item.serving, {
        grams: item.grams,
        servings: item.servings,
        milliliters: item.milliliters,
      });
    }
    if (item.milliliters != null) return servingFormat.milliliters(item.milliliters);
    return item.grams != null ? `${Math.round(item.grams * 10) / 10} ${tStats("units.g")}` : "—";
  }

  async function exportPdf(
    period: ReportPeriod,
    from: DateKey,
    to: DateKey,
  ): Promise<boolean | "needs_pro"> {
    if (isExporting) return false;
    setIsExporting(true);
    try {
      const report = await reportsApi.nutrition(from, to);
      const nutrients: ReportNutrient[] = [
        "calories",
        "protein",
        ...(visibility.showCarbs ? (["carbs"] as const) : []),
        ...(visibility.showFat ? (["fat"] as const) : []),
        ...(visibility.showFiber ? (["fiber"] as const) : []),
      ];
      const text: ReportText = {
        title: t(`export.reportTitle.${period}`),
        periodLabel: from === to ? longDate(from) : `${plainDate(from)} – ${plainDate(to)}`,
        generatedLabel: t("export.generatedAt", {
          date: new Date().toLocaleString(language, { dateStyle: "medium", timeStyle: "short" }),
        }),
        person: userName,
        summaryTitle: t("export.summary"),
        loggedDays: t("export.loggedDays", { count: report.loggedDays, total: report.rangeDays }),
        average: t("export.average"),
        target: t("export.target"),
        total: t("export.total"),
        dailyTitle: t("export.daily"),
        detailTitle: t("export.details"),
        date: t("export.date"),
        item: t("export.item"),
        amount: t("export.amount"),
        notLogged: tStats("trend.notLogged"),
        emptyPeriod: t("export.empty"),
        footnote: t("export.footnote"),
        nutrientLabel: (key) => tStats(`macros.${key}`),
        unit: (key) => (key === "calories" ? tStats("units.kcal") : tStats("units.g")),
        dateLabel: longDate,
        shortDateLabel: shortDate,
        mealLabel: (mealType) => tDashboard(`mealTypes.${MEAL_KEYS[mealType] ?? "snack"}`),
        amountLabel,
      };
      const html = buildReportHtml({ report, text, nutrients, language, isRTL: dir.isRTL });

      if (Platform.OS === "web") {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            UTI: "com.adobe.pdf",
            dialogTitle: text.title,
          });
        } else {
          await Print.printAsync({ uri });
        }
      }
      track("pdf_exported");
      return true;
    } catch (error) {
      track("pdf_exported", "failed");
      return isSubscriptionRequired(error) ? "needs_pro" : false;
    } finally {
      setIsExporting(false);
    }
  }

  return { exportPdf, isExporting };
}
