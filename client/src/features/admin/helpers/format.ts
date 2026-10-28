import { getLocale } from "../../../shared/i18n";
import { AdminPerson } from "../types";

export function formatDateTime(value: string | null | undefined, language: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return date.toLocaleString(getLocale(language), { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return date.toISOString();
  }
}

export function formatShortDate(value: string | null | undefined, language: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return date.toLocaleDateString(getLocale(language), { day: "numeric", month: "short" });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function personName(person: AdminPerson | null | undefined) {
  if (!person) return "—";
  return person.fullName || person.email;
}
