export const PANTRY_SORTS = ["newest", "updated", "name"] as const;

export type PantrySort = (typeof PANTRY_SORTS)[number];

type Sortable = { id: string; name: string; createdAt: string; updatedAt: string };

export function sortPantryItems<T extends Sortable>(items: T[], sort: PantrySort, locale: string): T[] {
  const sorted = [...items];
  if (sort === "name") {
    const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });
    return sorted.sort((a, b) => collator.compare(a.name, b.name) || a.id.localeCompare(b.id));
  }
  const field = sort === "updated" ? "updatedAt" : "createdAt";
  return sorted.sort((a, b) => b[field].localeCompare(a[field]) || b.id.localeCompare(a.id));
}
