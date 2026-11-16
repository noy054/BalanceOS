import { useEffect } from "react";

import { useCalorieToneStore } from "../../../shared/store/calorieToneStore";
import { useDayLog } from "../hooks/useDayLog";
import { useSelectedDate } from "../hooks/useSelectedDate";
import { calorieStatus } from "../helpers/calorieStatus";

export function CalorieToneSync() {
  const { date } = useSelectedDate();
  const { data } = useDayLog(date);
  const setOverTarget = useCalorieToneStore((state) => state.setOverTarget);
  const overTarget = data ? calorieStatus(data.caloriesEaten, data.caloriesTarget).isOver : false;

  useEffect(() => {
    setOverTarget(overTarget);
  }, [overTarget, setOverTarget]);

  return null;
}
