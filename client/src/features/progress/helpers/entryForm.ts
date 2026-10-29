import { BODY_METRICS, METRIC_RANGES, NOTE_MAX_LENGTH } from "../constants";
import { BodyEntry, BodyEntryPayload, BodyMetric } from "../types";

export type EntryFormState = Record<BodyMetric, string> & {
  date: string;
  note: string;
};

export type EntryFormErrors = Partial<Record<BodyMetric | "note" | "form", string>>;

export type EntryFormMessages = {
  invalidNumber: string;
  outOfRange: (min: number, max: number) => string;
  noteTooLong: string;
  empty: string;
};

export function emptyEntryForm(date: string): EntryFormState {
  return {
    date,
    note: "",
    weightKg: "",
    waistCm: "",
    hipsCm: "",
    chestCm: "",
    upperArmCm: "",
    thighCm: "",
  };
}

function toText(value: number | null): string {
  return value === null ? "" : String(value);
}

export function formFromEntry(entry: BodyEntry): EntryFormState {
  return {
    date: entry.date,
    note: entry.note ?? "",
    weightKg: toText(entry.weightKg),
    waistCm: toText(entry.waistCm),
    hipsCm: toText(entry.hipsCm),
    chestCm: toText(entry.chestCm),
    upperArmCm: toText(entry.upperArmCm),
    thighCm: toText(entry.thighCm),
  };
}

export function parseMeasurement(text: string): number | null | "invalid" {
  const trimmed = text.trim().replace(",", ".");
  if (!trimmed) return null;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return "invalid";
  return Math.round(Number(trimmed) * 10) / 10;
}

export function hasAnyValue(payload: BodyEntryPayload): boolean {
  return BODY_METRICS.some((metric) => payload[metric] != null) || Boolean(payload.note);
}

export function buildEntryPayload(
  form: EntryFormState,
  options: { isNew: boolean; photoCount: number },
  messages: EntryFormMessages,
): { payload: (BodyEntryPayload & { date: string }) | null; errors: EntryFormErrors } {
  const errors: EntryFormErrors = {};
  const payload: BodyEntryPayload & { date: string } = { date: form.date };

  for (const metric of BODY_METRICS) {
    const parsed = parseMeasurement(form[metric]);
    const range = METRIC_RANGES[metric];
    if (parsed === "invalid") {
      errors[metric] = messages.invalidNumber;
    } else if (parsed !== null && (parsed < range.min || parsed > range.max)) {
      errors[metric] = messages.outOfRange(range.min, range.max);
    } else if (parsed !== null || !options.isNew) {
      payload[metric] = parsed;
    }
  }

  const note = form.note.trim();
  if (note.length > NOTE_MAX_LENGTH) errors.note = messages.noteTooLong;
  if (note || !options.isNew) payload.note = note || null;

  if (Object.keys(errors).length === 0 && !hasAnyValue(payload) && options.photoCount === 0) {
    errors.form = messages.empty;
  }

  return { payload: Object.keys(errors).length === 0 ? payload : null, errors };
}
