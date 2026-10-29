import {
  EntryForCalculation,
  latestValues,
  metricSeries,
  summarizeMetric,
} from './progress.calculations';

function entry(
  date: string,
  values: Partial<EntryForCalculation>,
  createdAt = `${date}T08:00:00Z`,
): EntryForCalculation {
  return {
    date,
    createdAt: new Date(createdAt),
    weightKg: null,
    waistCm: null,
    hipsCm: null,
    chestCm: null,
    upperArmCm: null,
    thighCm: null,
    ...values,
  };
}

describe('progress calculations', () => {
  const entries = [
    entry('2026-10-10', { weightKg: 80.4, waistCm: 90 }),
    entry('2026-10-01', { weightKg: 82 }),
    entry('2026-10-10', { weightKg: 80.1 }, '2026-10-10T20:00:00Z'),
    entry('2026-10-20', { waistCm: 88.5 }),
    entry('2026-10-25', { weightKg: 81.2 }),
  ];

  it('orders points by date and keeps the latest entry of a day', () => {
    expect(metricSeries(entries, 'weightKg')).toEqual([
      { date: '2026-10-01', value: 82 },
      { date: '2026-10-10', value: 80.1 },
      { date: '2026-10-25', value: 81.2 },
    ]);
  });

  it('skips entries that did not record the metric', () => {
    expect(metricSeries(entries, 'waistCm')).toEqual([
      { date: '2026-10-10', value: 90 },
      { date: '2026-10-20', value: 88.5 },
    ]);
  });

  it('reports change, range and endpoints over the period', () => {
    expect(summarizeMetric(entries, 'weightKg')).toEqual(
      expect.objectContaining({
        start: { date: '2026-10-01', value: 82 },
        end: { date: '2026-10-25', value: 81.2 },
        change: -0.8,
        min: 80.1,
        max: 82,
      }),
    );
  });

  it('has no change with a single measurement and empty summaries without data', () => {
    expect(summarizeMetric([entries[1]], 'weightKg').change).toBeNull();
    expect(summarizeMetric(entries, 'thighCm')).toEqual({
      points: [],
      start: null,
      end: null,
      change: null,
      min: null,
      max: null,
    });
  });

  it('finds the latest known value of each metric independently', () => {
    const latest = latestValues(entries);
    expect(latest.weightKg).toEqual({ value: 81.2, date: '2026-10-25' });
    expect(latest.waistCm).toEqual({ value: 88.5, date: '2026-10-20' });
    expect(latest.hipsCm).toBeNull();
  });
});
