export type BillingInterval = "MONTHLY" | "YEARLY";

export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";

export type CheckoutStatus = "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED";

export type BillingPlan = {
  interval: BillingInterval;
  amount: number;
  currency: string;
};

export type PaymentMethod = {
  brand: string | null;
  last4: string;
  expiry: string | null;
};

export type SubscriptionSummary = {
  status: SubscriptionStatus;
  interval: BillingInterval;
  priceAmount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  endedAt: string | null;
  graceEndsAt: string | null;
  nextRetryAt: string | null;
  paymentMethod: PaymentMethod | null;
};

export type BillingPayment = {
  id: string;
  kind: "INITIAL" | "RENEWAL" | "VERIFICATION";
  status: "PAID" | "FAILED";
  amount: number;
  currency: string;
  failureReason: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
};

export type BillingStatus = {
  plan: "FREE" | "PRO";
  hasProAccess: boolean;
  hasFeatureAccess: boolean;
  checkoutAvailable: boolean;
  plans: BillingPlan[];
  subscription: SubscriptionSummary | null;
  payments: BillingPayment[];
};

export type CheckoutSession = {
  checkoutId: string;
  url: string;
};

export type CheckoutState = {
  id: string;
  purpose: "SUBSCRIBE" | "UPDATE_PAYMENT_METHOD";
  status: CheckoutStatus;
  failureReason: string | null;
};
