import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import { confirmAction } from "../../../shared/helpers/confirm";
import { formatCalories } from "../../../shared/helpers/formatNumber";
import { MealItemSummary } from "../types";
import { useRemoveMealItem } from "./useDayLog";

export function useMealRemoval(date: string) {
  const { t } = useTranslation("dashboard");
  const removeItemMutation = useRemoveMealItem(date);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());

  function setPending(id: string, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  async function run(id: string, action: () => Promise<void>) {
    setPending(id, true);
    try {
      await action();
    } catch {
      Alert.alert("", t("remove.failed"));
    } finally {
      setPending(id, false);
    }
  }

  async function removeItem(item: MealItemSummary, mealLabel: string): Promise<boolean> {
    if (pendingIds.has(item.id)) return false;

    const confirmed = await confirmAction({
      title: t("remove.itemTitle", { name: item.name, meal: mealLabel }),
      message: t("remove.itemMessage", { calories: formatCalories(item.calories) }),
      confirmLabel: t("remove.confirm"),
      cancelLabel: t("remove.cancel"),
      destructive: true,
    });

    if (!confirmed) return false;

    void run(item.id, () => removeItemMutation.mutateAsync(item.id));
    return true;
  }

  return { pendingIds, removeItem };
}
