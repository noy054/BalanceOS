import { useMemo, useState } from "react";

import { PantryProduct } from "../types";
import { PickerDraft } from "../helpers/recipeIngredientPickerDraft";

export function useRecipeIngredientPicker(products: PantryProduct[]) {
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Map<string, PickerDraft>>(new Map());

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.brand?.toLowerCase().includes(normalizedSearch),
    );
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

      const unit: "grams" | "servings" = product.servingSizeG
        ? "servings"
        : "grams";

      next.set(product.id, {
        product,
        quantity: product.servingSizeG ? "1" : "100",
        unit,
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
        next.set(id, {
          ...draft,
          unit: draft.unit === "grams" ? "servings" : "grams",
          quantity: "",
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
    updateQuantity,
    toggleUnit,
  };
}
