interface CookieOptions {
  maxAgeSeconds?: number;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
}

function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

export function setCookie(
  name: string,
  value: string,
  { maxAgeSeconds = 60 * 60 * 24 * 7, sameSite = 'Lax', secure }: CookieOptions = {},
): void {
  if (!isBrowser()) {
    return;
  }

  const cookieParts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    'path=/',
  ];

  if (typeof maxAgeSeconds === 'number') {
    cookieParts.push(`max-age=${Math.max(0, Math.floor(maxAgeSeconds))}`);
  }

  cookieParts.push(`SameSite=${sameSite}`);

  const shouldUseSecureFlag =
    secure ?? (typeof window !== 'undefined' && window.location.protocol === 'https:');

  if (shouldUseSecureFlag) {
    cookieParts.push('secure');
  }

  document.cookie = cookieParts.join('; ');
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split('=');
    if (decodeURIComponent(cookieName) === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

export function deleteCookie(name: string): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/; SameSite=Lax`;
}
