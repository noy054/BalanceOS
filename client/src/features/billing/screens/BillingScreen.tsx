import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

import { SettingsScreenLayout } from "../../settings/components/SettingsScreenLayout";
import { SettingsSection } from "../../settings/components/SettingsSection";
import { Button } from "../../../shared/components/ui/Button";
import { StateView } from "../../../shared/components/ui/StateView";
import { confirmAction } from "../../../shared/helpers/confirm";
import { showToast } from "../../../shared/helpers/toast";
import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
import { formatPrice } from "../helpers/billingErrors";
import {
  useBillingStatus,
  useCancelSubscription,
  useCheckoutFlow,
  useResumeSubscription,
  useTrackedCheckout,
} from "../hooks/useBilling";
import { BillingInterval, BillingPayment, BillingPlan, BillingStatus, CheckoutState } from "../types";

export function BillingScreen() {
  const { t, i18n } = useTranslation("billing");
  const styles = useStyles();
  const dir = useDirection();
  const params = useLocalSearchParams<{ checkout?: string }>();
  const billing = useBillingStatus();
  const [interval, setSelectedInterval] = useState<BillingInterval>("YEARLY");
  const [trackedId, setTrackedId] = useState<string | null>(
    typeof params.checkout === "string" ? params.checkout : null,
  );

  useEffect(() => {
    if (typeof params.checkout === "string") setTrackedId(params.checkout);
  }, [params.checkout]);

  const onDone = useCallback(
    (state: CheckoutState) => {
      setTrackedId(null);
      if (params.checkout) router.setParams({ checkout: undefined, result: undefined });
      if (state.status === "COMPLETED") {
        showToast({ message: t(state.purpose === "SUBSCRIBE" ? "toast.subscribed" : "toast.cardUpdated") });
      } else {
        showToast({ message: t(state.status === "EXPIRED" ? "toast.expired" : "toast.failed") });
      }
    },
    [params.checkout, t],
  );

  const tracked = useTrackedCheckout(trackedId, onDone);
  const flow = useCheckoutFlow(setTrackedId);
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();

  const dateFormat = new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "long", year: "numeric" });
  const date = (value: string | null) => (value ? dateFormat.format(new Date(value)) : "");
  const price = (amount: number, currency: string) => formatPrice(amount, currency, i18n.language);

  async function handleCancel(status: BillingStatus) {
    const end = status.subscription?.currentPeriodEnd ?? null;
    const confirmed = await confirmAction({
      title: t("cancel.title"),
      message: t("cancel.message", { date: date(end) }),
      confirmLabel: t("cancel.confirm"),
      cancelLabel: t("cancel.keep"),
      destructive: true,
    });
    if (!confirmed) return;
    cancel.mutate(undefined, {
      onSuccess: () => showToast({ message: t("toast.canceled") }),
      onError: () => showToast({ message: t("errors.actionFailed") }),
    });
  }

  function startCheckout() {
    flow.subscribe.mutate(interval, { onError: () => showToast({ message: t("errors.checkoutFailed") }) });
  }

  if (billing.isLoading) {
    return (
      <SettingsScreenLayout title={t("title")}>
        <StateView variant="loading" />
      </SettingsScreenLayout>
    );
  }

  if (billing.isError || !billing.data) {
    return (
      <SettingsScreenLayout title={t("title")}>
        <StateView
          variant="error"
          message={t("errors.loadFailed")}
          actionLabel={t("errors.retry")}
          onAction={() => void billing.refetch()}
        />
      </SettingsScreenLayout>
    );
  }

  const status = billing.data;
  const sub = status.subscription;
  const live = sub && (sub.status === "ACTIVE" || sub.status === "PAST_DUE");
  const canSubscribe = !live || !status.hasProAccess;
  const busy = flow.subscribe.isPending || flow.updateCard.isPending || tracked.isWaiting;
  const monthly = status.plans.find((plan) => plan.interval === "MONTHLY");
  const yearly = status.plans.find((plan) => plan.interval === "YEARLY");
  const savings =
    monthly && yearly ? Math.round((1 - yearly.amount / (monthly.amount * 12)) * 100) : 0;

  let headline: string;
  if (!sub || !live) {
    headline = sub?.endedAt ? t("status.ended", { date: date(sub.endedAt) }) : t("status.free");
  } else if (sub.status === "PAST_DUE") {
    headline = t("status.pastDue", { retry: date(sub.nextRetryAt), grace: date(sub.graceEndsAt) });
  } else if (sub.cancelAtPeriodEnd) {
    headline = t("status.ending", { date: date(sub.currentPeriodEnd) });
  } else {
    headline = t("status.renews", {
      date: date(sub.currentPeriodEnd),
      price: price(sub.priceAmount, sub.currency),
      period: t(`period.${sub.interval}`),
    });
  }

  return (
    <SettingsScreenLayout title={t("title")}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, status.hasProAccess && styles.heroPro]}>
          <View style={[styles.heroTop, dir.row]}>
            <Text style={[styles.planName, dir.text]}>{status.hasProAccess ? t("plan.pro") : t("plan.free")}</Text>
            {sub?.status === "PAST_DUE" ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t("badge.pastDue")}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.headline, dir.text]}>{headline}</Text>
          {sub?.status === "PAST_DUE" ? (
            <Button
              label={t("actions.updateCard")}
              icon="credit-card-outline"
              onPress={() => flow.updateCard.mutate()}
              loading={flow.updateCard.isPending}
              disabled={busy}
              fullWidth
            />
          ) : null}
          {sub?.status === "ACTIVE" && sub.cancelAtPeriodEnd ? (
            <Button
              label={t("actions.resume")}
              icon="restart"
              onPress={() => resume.mutate(undefined, { onError: () => showToast({ message: t("errors.actionFailed") }) })}
              loading={resume.isPending}
              disabled={busy}
              fullWidth
            />
          ) : null}
        </View>

        {tracked.isWaiting ? (
          <View style={[styles.waiting, dir.row]} accessibilityLiveRegion="polite">
            <ActivityIndicator />
            <Text style={[styles.waitingText, dir.text]}>{t("waiting")}</Text>
          </View>
        ) : null}

        <SettingsSection title={t("includes.title")}>
          <View style={styles.includes}>
            {(["statistics", "reports", "history"] as const).map((key) => (
              <View key={key} style={[styles.includeRow, dir.row]}>
                <MaterialCommunityIcons name="check" size={18} style={styles.includeIcon} />
                <Text style={[styles.includeText, dir.text]}>{t(`includes.${key}`)}</Text>
              </View>
            ))}
          </View>
        </SettingsSection>

        {canSubscribe ? (
          <SettingsSection title={t("plans.title")}>
            <View style={styles.plans}>
              {status.plans.map((plan) => (
                <PlanOption
                  key={plan.interval}
                  plan={plan}
                  selected={interval === plan.interval}
                  price={price(plan.amount, plan.currency)}
                  note={plan.interval === "YEARLY" && savings > 0 ? t("plans.save", { percent: savings }) : null}
                  onSelect={() => setSelectedInterval(plan.interval)}
                />
              ))}
              {status.checkoutAvailable ? (
                <Button
                  label={t("actions.subscribe")}
                  icon="lock-outline"
                  onPress={startCheckout}
                  loading={flow.subscribe.isPending}
                  disabled={busy}
                  fullWidth
                />
              ) : (
                <Text style={[styles.muted, dir.text]}>{t("plans.unavailable")}</Text>
              )}
              <Text style={[styles.muted, dir.text]}>{t("plans.terms")}</Text>
            </View>
          </SettingsSection>
        ) : null}

        {live && sub ? (
          <SettingsSection title={t("method.title")}>
            <View style={[styles.methodRow, dir.row]}>
              <MaterialCommunityIcons name="credit-card-outline" size={24} style={styles.includeIcon} />
              <View style={styles.methodText}>
                <Text style={[styles.methodName, dir.text]}>
                  {sub.paymentMethod
                    ? t("method.card", { brand: sub.paymentMethod.brand ?? t("method.cardFallback"), last4: sub.paymentMethod.last4 })
                    : t("method.none")}
                </Text>
                {sub.paymentMethod?.expiry ? (
                  <Text style={[styles.muted, dir.text]}>{t("method.expiry", { expiry: sub.paymentMethod.expiry })}</Text>
                ) : null}
              </View>
              <Button
                label={t("actions.update")}
                variant="tonal"
                size="sm"
                onPress={() => flow.updateCard.mutate(undefined, { onError: () => showToast({ message: t("errors.checkoutFailed") }) })}
                disabled={busy}
              />
            </View>
          </SettingsSection>
        ) : null}

        {status.payments.length > 0 ? (
          <SettingsSection title={t("history.title")}>
            {status.payments.map((payment, index) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                date={date(payment.createdAt)}
                amount={price(payment.amount, payment.currency)}
                last={index === status.payments.length - 1}
              />
            ))}
          </SettingsSection>
        ) : null}

        {live && sub && !sub.cancelAtPeriodEnd ? (
          <Pressable
            onPress={() => void handleCancel(status)}
            disabled={cancel.isPending || busy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
          >
            {cancel.isPending ? <ActivityIndicator /> : <Text style={styles.cancelText}>{t("actions.cancel")}</Text>}
          </Pressable>
        ) : null}
      </ScrollView>
    </SettingsScreenLayout>
  );
}

function PlanOption({
  plan,
  selected,
  price,
  note,
  onSelect,
}: {
  plan: BillingPlan;
  selected: boolean;
  price: string;
  note: string | null;
  onSelect: () => void;
}) {
  const { t } = useTranslation("billing");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${t(`plans.${plan.interval}`)}, ${price} ${t(`period.${plan.interval}`)}`}
      style={[styles.plan, selected && styles.planSelected, dir.row]}
    >
      <MaterialCommunityIcons
        name={selected ? "radiobox-marked" : "radiobox-blank"}
        size={22}
        color={selected ? colors.accent : colors.textMuted}
      />
      <View style={styles.planText}>
        <Text style={[styles.planTitle, dir.text]}>{t(`plans.${plan.interval}`)}</Text>
        {note ? <Text style={[styles.planNote, dir.text]}>{note}</Text> : null}
      </View>
      <Text style={styles.planPrice}>
        {price}
        <Text style={styles.planPeriod}>{` ${t(`period.${plan.interval}`)}`}</Text>
      </Text>
    </Pressable>
  );
}

function PaymentRow({
  payment,
  date,
  amount,
  last,
}: {
  payment: BillingPayment;
  date: string;
  amount: string;
  last: boolean;
}) {
  const { t } = useTranslation("billing");
  const styles = useStyles();
  const dir = useDirection();
  return (
    <View style={[styles.paymentRow, dir.row, !last && styles.divider]}>
      <View style={styles.methodText}>
        <Text style={[styles.paymentTitle, dir.text]}>{t(`history.kind.${payment.kind}`)}</Text>
        <Text style={[styles.muted, dir.text]}>{date}</Text>
      </View>
      <View style={dir.alignEnd}>
        <Text style={styles.paymentAmount}>{payment.kind === "VERIFICATION" ? "—" : amount}</Text>
        <Text style={[styles.paymentStatus, payment.status === "FAILED" && styles.paymentFailed]}>
          {t(`history.status.${payment.status}`)}
        </Text>
      </View>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
      hero: {
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.glassBorder,
        backgroundColor: colors.surface,
      },
      heroPro: { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft },
      heroTop: { alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
      planName: { ...typography.title, color: colors.textPrimary },
      headline: { ...typography.body, color: colors.textSecondary },
      badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.round,
        backgroundColor: colors.surfaceMuted,
      },
      badgeText: { ...typography.caption, fontFamily: fonts.semibold, color: colors.textPrimary },
      waiting: {
        alignItems: "center",
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
      },
      waitingText: { ...typography.callout, color: colors.textPrimary, flex: 1 },
      includes: { padding: spacing.md, gap: spacing.sm },
      includeRow: { alignItems: "center", gap: spacing.sm },
      includeIcon: { color: colors.accent },
      includeText: { ...typography.callout, color: colors.textPrimary, flex: 1 },
      plans: { padding: spacing.md, gap: spacing.sm },
      plan: {
        alignItems: "center",
        gap: spacing.ms,
        minHeight: 64,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.surface,
      },
      planSelected: { borderColor: colors.accent },
      planText: { flex: 1, minWidth: 0, gap: 2 },
      planTitle: { ...typography.bodyStrong, color: colors.textPrimary },
      planNote: { ...typography.caption, fontFamily: fonts.semibold, color: colors.success },
      planPrice: { ...typography.bodyStrong, ...typography.number, color: colors.textPrimary },
      planPeriod: { ...typography.caption, color: colors.textSecondary },
      muted: { ...typography.footnote, color: colors.textSecondary },
      methodRow: { alignItems: "center", gap: spacing.ms, padding: spacing.md },
      methodText: { flex: 1, minWidth: 0, gap: 2 },
      methodName: { ...typography.bodyStrong, ...typography.number, color: colors.textPrimary },
      paymentRow: { alignItems: "center", gap: spacing.ms, paddingHorizontal: spacing.md, paddingVertical: spacing.ms },
      divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      paymentTitle: { ...typography.callout, color: colors.textPrimary },
      paymentAmount: { ...typography.callout, ...typography.number, color: colors.textPrimary },
      paymentStatus: { ...typography.caption, color: colors.textSecondary },
      paymentFailed: { color: colors.danger },
      cancel: { minHeight: 48, alignItems: "center", justifyContent: "center" },
      cancelText: { ...typography.callout, fontFamily: fonts.semibold, color: colors.danger },
      pressed: { opacity: 0.7 },
    }),
  );
