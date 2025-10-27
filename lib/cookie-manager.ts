export class CookieManager {
  static set(name: string, value: string, options: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}): void {
    if (typeof window === 'undefined') return;

    const {
      maxAge = 60 * 60 * 24 * 7, // 7 days default
      path = '/',
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax'
    } = options;

    let cookieString = `${name}=${encodeURIComponent(value)}`;
    cookieString += `; Max-Age=${maxAge}`;
    cookieString += `; Path=${path}`;

    if (secure) {
      cookieString += '; Secure';
    }

    cookieString += `; SameSite=${sameSite}`;

    document.cookie = cookieString;
  }

  static get(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');

      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }

    return null;
  }

  static remove(name: string, path: string = '/'): void {
    if (typeof window === 'undefined') return;

    document.cookie = `${name}=; Max-Age=0; Path=${path}`;
  }

  static clear(): void {
    if (typeof window === 'undefined') return;

    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const [cookieName] = cookie.trim().split('=');
      this.remove(cookieName);
    }
  }
}
