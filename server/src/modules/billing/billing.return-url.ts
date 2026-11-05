const APP_SCHEME = 'balanceos:';

export function isAllowedReturnUrl(
  value: string,
  options: { production: boolean; webOrigins: string[] },
): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.username || url.password) return false;
  if (url.protocol === APP_SCHEME) return true;
  if (!options.production && url.protocol === 'exp:') return true;
  if (url.protocol === 'https:' || url.protocol === 'http:') {
    if (options.webOrigins.includes(url.origin)) return true;
    if (
      !options.production &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    ) {
      return true;
    }
  }
  return false;
}
