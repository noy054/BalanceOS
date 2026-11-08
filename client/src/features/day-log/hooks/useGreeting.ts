import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "../../auth/hooks/useAuthStore";

type GreetingPeriod = "morning" | "afternoon" | "evening" | "night";

function periodFor(hour: number): GreetingPeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

export function useGreeting() {
  const { t } = useTranslation("dashboard");
  const fullName = useAuthStore((state) => state.user?.fullName ?? "");
  const [period, setPeriod] = useState(() => periodFor(new Date().getHours()));

  useEffect(() => {
    const timer = setInterval(() => setPeriod(periodFor(new Date().getHours())), 60_000);
    return () => clearInterval(timer);
  }, []);

  const name = fullName.trim().split(/\s+/)[0] ?? "";
  const greeting = t(`greeting.${period}`);
  return name ? t("greeting.withName", { greeting, name }) : greeting;
}
