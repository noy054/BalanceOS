import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { billingApi } from "../api/billingApi";
import { BILLING_QUERY_KEYS, CHECKOUT_POLL_LIMIT, CHECKOUT_POLL_MS } from "../constants";
import { BillingInterval, BillingStatus, CheckoutSession, CheckoutState } from "../types";

const RETURN_PATH = "settings/billing";

export function useBillingStatus() {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.status,
    queryFn: () => billingApi.status(),
    staleTime: 60 * 1000,
  });
}

export function useHasProAccess() {
  const { data, isLoading } = useBillingStatus();
  return { hasProAccess: data?.hasProAccess ?? false, isLoading };
}

function useRefreshBilling() {
  const queryClient = useQueryClient();
  return (status?: BillingStatus) => {
    if (status) queryClient.setQueryData(BILLING_QUERY_KEYS.status, status);
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.status, refetchType: "all" }),
      queryClient.invalidateQueries({ queryKey: ["statistics"], refetchType: "all" }),
    ]);
  };
}

function checkoutIdFrom(url: string | null | undefined): string | null {
  if (!url) return null;
  const { queryParams } = Linking.parse(url);
  const value = queryParams?.checkout;
  return typeof value === "string" ? value : null;
}

async function openCheckout(session: CheckoutSession, returnUrl: string): Promise<string | null> {
  if (Platform.OS === "web") {
    window.location.assign(session.url);
    return null;
  }
  const result = await WebBrowser.openAuthSessionAsync(session.url, returnUrl);
  if (result.type === "success") return checkoutIdFrom(result.url) ?? session.checkoutId;
  return session.checkoutId;
}

export function useCheckoutFlow(onTrack: (checkoutId: string) => void) {
  const returnUrl = Linking.createURL(RETURN_PATH);

  const subscribe = useMutation({
    mutationFn: async (interval: BillingInterval) => {
      const session = await billingApi.checkout(interval, returnUrl);
      return openCheckout(session, returnUrl);
    },
    onSuccess: (checkoutId) => {
      if (checkoutId) onTrack(checkoutId);
    },
  });

  const updateCard = useMutation({
    mutationFn: async () => {
      const session = await billingApi.updatePaymentMethod(returnUrl);
      return openCheckout(session, returnUrl);
    },
    onSuccess: (checkoutId) => {
      if (checkoutId) onTrack(checkoutId);
    },
  });

  return { subscribe, updateCard };
}

export function useTrackedCheckout(checkoutId: string | null, onDone: (state: CheckoutState) => void) {
  const refresh = useRefreshBilling();
  const polls = useRef(0);
  const [timedOut, setTimedOut] = useState(false);
  const reported = useRef<string | null>(null);

  useEffect(() => {
    polls.current = 0;
    setTimedOut(false);
  }, [checkoutId]);

  const query = useQuery({
    queryKey: ["billing", "checkout", checkoutId],
    queryFn: () => {
      polls.current += 1;
      return billingApi.checkoutStatus(checkoutId as string);
    },
    enabled: checkoutId !== null && !timedOut,
    refetchInterval: (current) =>
      current.state.data?.status === "PENDING" && polls.current < CHECKOUT_POLL_LIMIT ? CHECKOUT_POLL_MS : false,
    gcTime: 0,
  });

  const state = query.data;

  useEffect(() => {
    if (!state || state.status === "PENDING" || reported.current === state.id) return;
    reported.current = state.id;
    void refresh();
    onDone(state);
  }, [state, refresh, onDone]);

  useEffect(() => {
    if (state?.status === "PENDING" && polls.current >= CHECKOUT_POLL_LIMIT) setTimedOut(true);
  }, [state]);

  return { state, isWaiting: checkoutId !== null && (!state || state.status === "PENDING") && !timedOut, timedOut };
}

export function useCancelSubscription() {
  const refresh = useRefreshBilling();
  return useMutation({
    mutationFn: () => billingApi.cancel(),
    onSuccess: (status) => refresh(status),
  });
}

export function useResumeSubscription() {
  const refresh = useRefreshBilling();
  return useMutation({
    mutationFn: () => billingApi.resume(),
    onSuccess: (status) => refresh(status),
  });
}
