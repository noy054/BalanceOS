import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

export function adminErrorMessage(error: unknown, t: TFunction<"settings">, fallback: string) {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 409) return t("admin.errors.conflict");
    if (status === 403) return t("admin.notAllowed");
    if (status === 404) return t("admin.errors.notFound");
    if (status === 400) return t("admin.errors.invalid");
    if (!error.response) return t("admin.errors.network");
  }
  return fallback;
}
