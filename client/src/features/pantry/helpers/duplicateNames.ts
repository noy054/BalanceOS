import { useMemo } from "react";

export function nameKey(name: string) {
  return name.trim().toLocaleLowerCase();
}

export function findDuplicateNames(names: readonly string[]): ReadonlySet<string> {
  const counts = new Map<string, number>();
  for (const name of names) {
    const key = nameKey(name);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([key]) => key));
}

export function useDuplicateNames(names: readonly string[]): ReadonlySet<string> {
  const signature = names.map(nameKey).join("\n");
  return useMemo(() => findDuplicateNames(signature ? signature.split("\n") : []), [signature]);
}

export function isAmbiguousName(duplicates: ReadonlySet<string>, name: string) {
  return duplicates.has(nameKey(name));
}
