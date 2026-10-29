import { daysBetween, isDayKey, isWithinFutureLimit } from './day-key';

describe('isDayKey', () => {
  it.each(['2026-10-28', '2024-02-29', '2000-01-01'])('accepts %s', (v) => {
    expect(isDayKey(v)).toBe(true);
  });

  it.each([
    '2026-02-29',
    '2026-13-01',
    '2026-1-01',
    '2026-10-28T00:00:00Z',
    '1999-12-31',
    'today',
    20261028,
  ])('rejects %s', (v) => {
    expect(isDayKey(v)).toBe(false);
  });
});

describe('daysBetween', () => {
  it('counts calendar days across month and DST boundaries', () => {
    expect(daysBetween('2026-10-01', '2026-10-31')).toBe(30);
    expect(daysBetween('2026-03-27', '2026-03-30')).toBe(3);
    expect(daysBetween('2026-10-28', '2026-10-28')).toBe(0);
  });
});

describe('isWithinFutureLimit', () => {
  const now = new Date('2026-10-28T22:00:00Z');

  it.each(['2020-01-01', '2026-10-28', '2026-10-29', '2027-10-29'])(
    'accepts %s',
    (v) => {
      expect(isWithinFutureLimit(v, now)).toBe(true);
    },
  );

  it.each(['2027-10-31', '2099-12-31'])('rejects %s', (v) => {
    expect(isWithinFutureLimit(v, now)).toBe(false);
  });
});
