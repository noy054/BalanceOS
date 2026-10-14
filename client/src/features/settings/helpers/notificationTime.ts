export type TimeField = "breakfast" | "lunch" | "dinner" | "daily" | "weekly";

export function formatTime(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function timeToDate(value: string) {
  const date = new Date();
  const [hourRaw, minuteRaw] = value.split(":");

  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
    date.setHours(hour);
    date.setMinutes(minute);
  } else {
    date.setHours(9);
    date.setMinutes(0);
  }

  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}
