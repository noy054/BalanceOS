import { useEffect, useRef, useState } from "react";

import { useReduceMotion } from "./useReduceMotion";

const DURATION_MS = 900;

export function useAnimatedProgress(target: number) {
  const reduceMotion = useReduceMotion();
  const [value, setValue] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (reduceMotion) {
      current.current = target;
      setValue(target);
      return;
    }

    const from = current.current;
    const startedAt = Date.now();
    let frame = 0;

    const step = () => {
      const elapsed = Math.min((Date.now() - startedAt) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      current.current = from + (target - from) * eased;
      setValue(current.current);
      if (elapsed < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  return value;
}
