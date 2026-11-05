import { AppState } from "react-native";
import { Mutation, MutationCache } from "@tanstack/react-query";

import { apiClient } from "../../shared/api/client";
import { useAuthStore } from "../auth/hooks/useAuthStore";

export type AnalyticsAction =
  | "meal_item_added"
  | "meal_item_updated"
  | "meal_item_removed"
  | "meal_copied"
  | "barcode_scanned"
  | "super_opened"
  | "super_product_added"
  | "super_product_removed"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "calculator_added_to_meal"
  | "saved_meal_created"
  | "saved_meal_updated"
  | "saved_meal_logged"
  | "recipe_created"
  | "recipe_updated"
  | "recipe_logged"
  | "statistics_viewed"
  | "pdf_exported";

export type AnalyticsStatus = "completed" | "failed";

export type AnalyticsMeta = {
  analytics?: AnalyticsAction | ((variables: unknown) => AnalyticsAction | null);
};

type QueuedEvent = {
  id: string;
  action: AnalyticsAction;
  status: AnalyticsStatus;
  occurredAt: string;
};

const FLUSH_DELAY_MS = 10_000;
const BATCH_SIZE = 50;
const MAX_QUEUE = 200;
const FLUSH_THRESHOLD = 20;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;
let started = false;

function eventId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function canTrack() {
  const user = useAuthStore.getState().user;
  return Boolean(user) && user?.role !== "ADMIN";
}

function schedule() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    void flushAnalytics();
  }, FLUSH_DELAY_MS);
}

export function track(action: AnalyticsAction, status: AnalyticsStatus = "completed") {
  if (!canTrack()) return;
  queue.push({ id: eventId(), action, status, occurredAt: new Date().toISOString() });
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
  if (queue.length >= FLUSH_THRESHOLD) void flushAnalytics();
  else schedule();
}

export async function flushAnalytics() {
  if (flushing || queue.length === 0 || !canTrack()) return;
  flushing = true;
  const batch = queue.slice(0, BATCH_SIZE);
  try {
    await apiClient.post("/analytics/events", { events: batch });
    const sent = new Set(batch.map((event) => event.id));
    queue = queue.filter((event) => !sent.has(event.id));
  } catch {
    schedule();
  } finally {
    flushing = false;
  }
}

export function startAnalytics() {
  if (started) return;
  started = true;
  AppState.addEventListener("change", (state) => {
    if (state !== "active") void flushAnalytics();
  });
  useAuthStore.subscribe((state, previous) => {
    if (state.user?.id !== previous.user?.id) queue = [];
  });
}

function resolveAction(mutation: Mutation<unknown, unknown, unknown, unknown>, variables: unknown) {
  const meta = mutation.options.meta as AnalyticsMeta | undefined;
  if (!meta?.analytics) return null;
  return typeof meta.analytics === "function" ? meta.analytics(variables) : meta.analytics;
}

export function createAnalyticsMutationCache() {
  return new MutationCache({
    onSuccess: (_data, variables, _context, mutation) => {
      const action = resolveAction(mutation, variables);
      if (action) track(action, "completed");
    },
    onError: (_error, variables, _context, mutation) => {
      const action = resolveAction(mutation, variables);
      if (action) track(action, "failed");
    },
  });
}
