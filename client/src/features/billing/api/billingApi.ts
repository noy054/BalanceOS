import { apiClient } from "../../../shared/api/client";
import { BILLING_ENDPOINTS } from "../constants";
import { BillingInterval, BillingStatus, CheckoutSession, CheckoutState } from "../types";

export const billingApi = {
  status(): Promise<BillingStatus> {
    return apiClient.get<BillingStatus>(BILLING_ENDPOINTS.STATUS).then((r) => r.data);
  },

  checkout(interval: BillingInterval, returnUrl: string): Promise<CheckoutSession> {
    return apiClient
      .post<CheckoutSession>(BILLING_ENDPOINTS.CHECKOUT, { interval, returnUrl })
      .then((r) => r.data);
  },

  updatePaymentMethod(returnUrl: string): Promise<CheckoutSession> {
    return apiClient
      .post<CheckoutSession>(BILLING_ENDPOINTS.PAYMENT_METHOD, { returnUrl })
      .then((r) => r.data);
  },

  checkoutStatus(id: string): Promise<CheckoutState> {
    return apiClient.get<CheckoutState>(BILLING_ENDPOINTS.CHECKOUT_STATUS(id)).then((r) => r.data);
  },

  cancel(): Promise<BillingStatus> {
    return apiClient.post<BillingStatus>(BILLING_ENDPOINTS.CANCEL).then((r) => r.data);
  },

  resume(): Promise<BillingStatus> {
    return apiClient.post<BillingStatus>(BILLING_ENDPOINTS.RESUME).then((r) => r.data);
  },
};
