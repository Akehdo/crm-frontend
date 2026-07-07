export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const TOKEN_STORAGE_KEY = "crm.auth.tokens";

export function getStoredTokens(): AuthTokens | null {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthTokens>;
    if (!parsed.accessToken || !parsed.refreshToken) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    };
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: AuthTokens): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredTokens(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function decodeJwtExpiration(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      exp?: unknown;
    };

    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}
