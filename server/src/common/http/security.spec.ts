import { corsOrigins } from './security';

describe('corsOrigins', () => {
  it('uses the configured allow list', () => {
    expect(corsOrigins('https://a.app, https://b.app', true)).toEqual([
      'https://a.app',
      'https://b.app',
    ]);
  });

  it('allows any origin in development when none are configured', () => {
    expect(corsOrigins(undefined, false)).toBe(true);
  });

  it('blocks browser origins in production when none are configured', () => {
    expect(corsOrigins('', true)).toBe(false);
  });
});
