import { useMemo, useState } from "react";

import { PantryProduct } from "../types";
import { PickerDraft } from "../helpers/recipeIngredientPickerDraft";
import { sortByMealCategory } from "../helpers/sortByMealCategory";
import { convertAmount, defaultAmount, defaultAmountUnit, nextAmountUnit } from "../helpers/serving";
import { matchesAllTerms } from "../../../shared/helpers/searchTerms";

export function useRecipeIngredientPicker(products: PantryProduct[]) {
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Map<string, PickerDraft>>(new Map());

  const filteredProducts = useMemo(() => {
    const searched = search.trim()
      ? products.filter((product) => matchesAllTerms(search, product.name, product.brand))
      : products;

    return sortByMealCategory(searched, null);
  }, [products, search]);

  const draftList = useMemo(() => [...drafts.values()], [drafts]);
  const selectedCount = draftList.length;

  function reset() {
    setSearch("");
    setDrafts(new Map());
  }

  function toggleProduct(product: PantryProduct) {
    setDrafts((prev) => {
      const next = new Map(prev);

      if (next.has(product.id)) {
        next.delete(product.id);
        return next;
      }

      next.set(product.id, {
        product,
        quantity: defaultAmount(product),
        unit: defaultAmountUnit(product),
      });

      return next;
    });
  }

  function include(product: PantryProduct) {
    setDrafts((prev) => {
      if (prev.has(product.id)) return prev;
      const next = new Map(prev);
      next.set(product.id, {
        product,
        quantity: defaultAmount(product),
        unit: defaultAmountUnit(product),
      });
      return next;
    });
  }

  function updateQuantity(id: string, quantity: string) {
    setDrafts((prev) => {
      const next = new Map(prev);
      const draft = next.get(id);

      if (draft) {
        next.set(id, {
          ...draft,
          quantity,
        });
      }

      return next;
    });
  }

  function toggleUnit(id: string) {
    setDrafts((prev) => {
      const next = new Map(prev);
      const draft = next.get(id);

      if (draft) {
        const nextUnit = nextAmountUnit(draft.product, draft.unit);

        next.set(id, {
          ...draft,
          unit: nextUnit,
          quantity: convertAmount(draft.product, draft.quantity, draft.unit, nextUnit),
        });
      }

      return next;
    });
  }

  return {
    search,
    setSearch,
    drafts,
    draftList,
    selectedCount,
    filteredProducts,
    reset,
    toggleProduct,
    include,
    updateQuantity,
    toggleUnit,
  };
}
