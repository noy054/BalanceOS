import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { DateKey, msUntilNextDay, todayKey } from "../helpers/dateKey";

export function useTodayKey(): DateKey {
  const [today, setToday] = useState(todayKey);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const sync = () => {
      setToday(todayKey());
      clearTimeout(timer);
      timer = setTimeout(sync, msUntilNextDay());
    };

    timer = setTimeout(sync, msUntilNextDay());
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return today;
}
