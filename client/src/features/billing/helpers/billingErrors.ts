import { isAxiosError } from "axios";

import { SUBSCRIPTION_REQUIRED } from "../constants";

export function isSubscriptionRequired(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 403) return false;
  const data: unknown = error.response.data;
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { code?: unknown }).code === SUBSCRIPTION_REQUIRED
  );
}

export function formatPrice(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}
