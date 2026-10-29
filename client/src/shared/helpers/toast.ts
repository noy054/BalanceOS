import { create } from "zustand";

export type ToastOptions = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastState = {
  toast: (ToastOptions & { id: number }) | null;
};

export const useToastStore = create<ToastState>(() => ({ toast: null }));

let nextId = 1;

export function showToast(options: ToastOptions) {
  useToastStore.setState({ toast: { ...options, id: nextId++ } });
}

export function hideToast(id: number) {
  if (useToastStore.getState().toast?.id === id) {
    useToastStore.setState({ toast: null });
  }
}
