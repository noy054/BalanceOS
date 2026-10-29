import { create } from "zustand";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
};

type ConfirmRequest = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

type ConfirmState = {
  request: ConfirmRequest | null;
};

export const useConfirmStore = create<ConfirmState>(() => ({ request: null }));

export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().request?.resolve(false);
    useConfirmStore.setState({ request: { ...options, resolve } });
  });
}

export function settleConfirm(confirmed: boolean) {
  const { request } = useConfirmStore.getState();
  if (!request) return;
  useConfirmStore.setState({ request: null });
  request.resolve(confirmed);
}
