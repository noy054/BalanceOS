import { NutritionReport, ReportItem, ReportTotals } from "../types";

export type ReportNutrient = keyof ReportTotals;

export type ReportText = {
  title: string;
  periodLabel: string;
  generatedLabel: string;
  person: string | null;
  summaryTitle: string;
  loggedDays: string;
  average: string;
  target: string;
  total: string;
  dailyTitle: string;
  detailTitle: string;
  date: string;
  item: string;
  amount: string;
  notLogged: string;
  emptyPeriod: string;
  footnote: string;
  nutrientLabel: (key: ReportNutrient) => string;
  unit: (key: ReportNutrient) => string;
  dateLabel: (date: string) => string;
  shortDateLabel: (date: string) => string;
  mealLabel: (mealType: string) => string;
  amountLabel: (item: ReportItem) => string;
};

type Options = {
  report: NutritionReport;
  text: ReportText;
  nutrients: ReportNutrient[];
  language: string;
  isRTL: boolean;
};

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function format(value: number, key: ReportNutrient) {
  if (key === "calories") return Math.round(value).toLocaleString("en-US");
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function num(value: string) {
  return `<span class="num" dir="ltr">${escape(value)}</span>`;
}

export function buildReportHtml({ report, text, nutrients, language, isRTL }: Options) {
  const value = (amount: number, key: ReportNutrient) => `${num(format(amount, key))} <span class="unit">${escape(text.unit(key))}</span>`;
  const loggedDays = report.days.filter((day) => day.logged);

  const summaryCards = nutrients
    .map(
      (key) => `
        <div class="card">
          <div class="card-label">${escape(text.nutrientLabel(key))}</div>
          <div class="card-value">${value(report.averages[key], key)}</div>
          <div class="card-sub">${escape(text.target)}: ${value(report.averageTargets[key], key)}</div>
        </div>`,
    )
    .join("");

  const headCells = nutrients.map((key) => `<th class="n">${escape(text.nutrientLabel(key))}</th>`).join("");

  const dailyRows = report.days
    .map((day) => {
      const cells = day.logged
        ? nutrients.map((key) => `<td class="n">${num(format(day.totals[key], key))}</td>`).join("")
        : `<td class="muted" colspan="${nutrients.length}">${escape(text.notLogged)}</td>`;
      return `<tr><td>${escape(text.shortDateLabel(day.date))}</td>${cells}<td class="n muted">${num(format(day.targets.calories, "calories"))}</td></tr>`;
    })
    .join("");

  const details = loggedDays
    .map((day) => {
      const meals = day.meals
        .map((meal) => {
          const rows = meal.items
            .map(
              (item) => `
                <tr>
                  <td>${escape(item.name)}</td>
                  <td class="amount">${escape(text.amountLabel(item))}</td>
                  ${nutrients.map((key) => `<td class="n">${num(format(item.totals[key], key))}</td>`).join("")}
                </tr>`,
            )
            .join("");
          return `
            <div class="meal">
              <div class="meal-head">
                <span class="meal-name">${escape(text.mealLabel(meal.mealType))}</span>
                <span class="meal-total">${value(meal.totals.calories, "calories")}</span>
              </div>
              <table>
                <thead><tr><th>${escape(text.item)}</th><th>${escape(text.amount)}</th>${headCells}</tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
        })
        .join("");
      return `
        <section class="day">
          <h3>${escape(text.dateLabel(day.date))}</h3>
          <div class="day-totals">${nutrients
            .map((key) => `<span>${escape(text.nutrientLabel(key))}: ${value(day.totals[key], key)}</span>`)
            .join("")}</div>
          ${meals}
        </section>`;
    })
    .join("");

  const multiDay = report.rangeDays > 1;

  return `<!DOCTYPE html>
<html lang="${escape(language)}" dir="${isRTL ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(text.title)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, "Segoe UI", Roboto, "Noto Sans Hebrew", "Arial Hebrew", Arial, sans-serif; color: #191C26; font-size: 11pt; line-height: 1.45; text-align: start; }
  .num { unicode-bidi: isolate; font-variant-numeric: tabular-nums; font-weight: 600; }
  .unit { color: #586176; font-size: 0.85em; }
  header { border-bottom: 3px solid #C5F87F; padding-bottom: 10px; margin-bottom: 18px; }
  .brand { font-size: 10pt; font-weight: 700; letter-spacing: 0.04em; color: #586176; }
  h1 { font-size: 20pt; margin: 2px 0 4px; }
  .meta { color: #586176; font-size: 10pt; }
  h2 { font-size: 13pt; margin: 22px 0 10px; }
  h3 { font-size: 12pt; margin: 0 0 6px; }
  .summary-line { margin-bottom: 10px; color: #586176; }
  .cards { display: flex; flex-wrap: wrap; gap: 8px; }
  .card { flex: 1 1 120px; border: 1px solid #E2E5EC; border-radius: 10px; padding: 10px 12px; background: #F6F7FA; }
  .card-label { font-size: 9pt; color: #586176; }
  .card-value { font-size: 15pt; margin-top: 2px; }
  .card-sub { font-size: 9pt; color: #586176; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  th { text-align: start; font-weight: 600; color: #586176; background: #F6F7FA; padding: 6px 8px; border-bottom: 1px solid #E2E5EC; }
  td { padding: 6px 8px; border-bottom: 1px solid #EEF0F5; vertical-align: top; }
  th.n, td.n { text-align: end; white-space: nowrap; }
  td.amount { color: #586176; white-space: nowrap; }
  .muted { color: #8C93A3; }
  .day { margin-top: 18px; break-inside: avoid-page; }
  .day-totals { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 9.5pt; color: #586176; margin-bottom: 8px; }
  .meal { margin: 10px 0 0; break-inside: avoid; }
  .meal-head { display: flex; justify-content: space-between; align-items: baseline; padding: 4px 0; border-bottom: 2px solid #DDF7ED; margin-bottom: 2px; }
  .meal-name { font-weight: 600; }
  footer { margin-top: 26px; font-size: 8.5pt; color: #8C93A3; }
</style>
</head>
<body>
  <header>
    <div class="brand">BalanceOS</div>
    <h1>${escape(text.title)}</h1>
    <div class="meta">${escape(text.periodLabel)}${text.person ? ` · ${escape(text.person)}` : ""}</div>
    <div class="meta">${escape(text.generatedLabel)}</div>
  </header>

  <h2>${escape(text.summaryTitle)}</h2>
  <div class="summary-line">${escape(text.loggedDays)}</div>
  ${loggedDays.length > 0 ? `<div class="cards">${summaryCards}</div>` : `<p class="muted">${escape(text.emptyPeriod)}</p>`}

  ${
    multiDay
      ? `<h2>${escape(text.dailyTitle)}</h2>
  <table>
    <thead><tr><th>${escape(text.date)}</th>${headCells}<th class="n">${escape(text.target)}</th></tr></thead>
    <tbody>${dailyRows}</tbody>
  </table>`
      : ""
  }

  ${loggedDays.length > 0 ? `<h2>${escape(text.detailTitle)}</h2>${details}` : ""}

  <footer>${escape(text.footnote)}</footer>
</body>
</html>`;
}
