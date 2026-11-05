export function calorieStatus(eaten: number, target: number) {
  const isOver = target > 0 && Math.round(eaten) > Math.round(target);
  const isReached = target > 0 && Math.round(eaten) === Math.round(target);
  const progress = target > 0 ? Math.min(eaten / target, 1) : 0;
  return { isOver, isReached, progress };
}
