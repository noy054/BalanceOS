export const BILLING_ENDPOINTS = {
  STATUS: "/billing",
  CHECKOUT: "/billing/checkout",
  PAYMENT_METHOD: "/billing/payment-method",
  CHECKOUT_STATUS: (id: string) => `/billing/checkouts/${id}`,
  CANCEL: "/billing/subscription/cancel",
  RESUME: "/billing/subscription/resume",
} as const;

export const BILLING_QUERY_KEYS = {
  status: ["billing", "status"] as const,
};

export const BILLING_ROUTE = "/(app)/settings/billing";

export const SUBSCRIPTION_REQUIRED = "SUBSCRIPTION_REQUIRED";

export const CHECKOUT_POLL_MS = 1500;
export const CHECKOUT_POLL_LIMIT = 40;
