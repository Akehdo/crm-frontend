import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ApiError,
  ApiRequestOptions,
  request,
  SessionExpiredError,
} from "../../../shared/api/http";
import {
  AuthTokens,
  clearStoredTokens,
  decodeJwtExpiration,
  getStoredTokens,
  setStoredTokens,
} from "../lib/tokenStorage";

type AuthTokensResponse = {
  access_token: string;
  refresh_token: string;
};

type AuthCredentials = {
  email: string;
  password: string;
};

type AuthApiOptions = ApiRequestOptions & {
  skipAuth?: boolean;
};

type AuthContextValue = {
  api: <TResponse = unknown>(
    path: string,
    options?: AuthApiOptions,
  ) => Promise<TResponse>;
  bootstrapping: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthTokens>;
  sessionMessage: string;
  tokens: AuthTokens | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const initialTokens = useMemo(() => getStoredTokens(), []);
  const [tokens, setTokensState] = useState<AuthTokens | null>(initialTokens);
  const [bootstrapping, setBootstrapping] = useState(Boolean(initialTokens));
  const [sessionMessage, setSessionMessage] = useState("");
  const tokensRef = useRef<AuthTokens | null>(initialTokens);
  const refreshPromiseRef = useRef<Promise<AuthTokens> | null>(null);

  const setTokens = useCallback((nextTokens: AuthTokens | null) => {
    tokensRef.current = nextTokens;
    setTokensState(nextTokens);

    if (nextTokens) {
      setStoredTokens(nextTokens);
    } else {
      clearStoredTokens();
    }
  }, []);

  const clearSession = useCallback(
    (message = "Сессия завершена.") => {
      setTokens(null);
      setSessionMessage(message);
    },
    [setTokens],
  );

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshToken = tokensRef.current?.refreshToken;
    if (!refreshToken) {
      clearSession("Войдите, чтобы продолжить.");
      throw new SessionExpiredError();
    }

    refreshPromiseRef.current = request<AuthTokensResponse>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    })
      .then((payload) => {
        const nextTokens = normalizeTokens(payload);
        setTokens(nextTokens);
        setSessionMessage("");
        return nextTokens;
      })
      .catch((error: unknown) => {
        clearSession("Сессия истекла. Войдите снова.");
        throw error;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [clearSession, setTokens]);

  const api = useCallback(
    async <TResponse,>(path: string, options: AuthApiOptions = {}) => {
      const currentTokens = tokensRef.current;
      const { skipAuth, ...requestOptions } = options;

      try {
        return await request<TResponse>(path, {
          ...requestOptions,
          token: skipAuth ? undefined : currentTokens?.accessToken,
        });
      } catch (error) {
        const shouldRefresh =
          !skipAuth &&
          error instanceof ApiError &&
          error.status === 401 &&
          Boolean(tokensRef.current?.refreshToken);

        if (!shouldRefresh) {
          throw error;
        }

        const nextTokens = await refreshSession();
        return request<TResponse>(path, {
          ...requestOptions,
          token: nextTokens.accessToken,
        });
      }
    },
    [refreshSession],
  );

  const login = useCallback(
    async ({ email, password }: AuthCredentials) => {
      const payload = await request<AuthTokensResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setTokens(normalizeTokens(payload));
      setSessionMessage("");
    },
    [setTokens],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokensRef.current?.refreshToken;
    setTokens(null);
    setSessionMessage("");

    if (refreshToken) {
      try {
        await request("/auth/logout", {
          method: "POST",
          body: { refresh_token: refreshToken },
        });
      } catch {
        // Local logout should still win if the network is already gone.
      }
    }
  }, [setTokens]);

  useEffect(() => {
    if (!tokensRef.current?.refreshToken) {
      setBootstrapping(false);
      return;
    }

    refreshSession()
      .catch(() => {})
      .finally(() => setBootstrapping(false));
  }, [refreshSession]);

  useEffect(() => {
    if (!tokens?.accessToken) {
      return undefined;
    }

    const expiresAt = decodeJwtExpiration(tokens.accessToken);
    if (!expiresAt) {
      return undefined;
    }

    const delay = Math.max(expiresAt - Date.now() - 60_000, 5_000);
    const timer = window.setTimeout(() => {
      refreshSession().catch(() => {});
    }, delay);

    return () => window.clearTimeout(timer);
  }, [refreshSession, tokens]);

  const value = useMemo<AuthContextValue>(
    () => ({
      api,
      bootstrapping,
      isAuthenticated: Boolean(tokens),
      login,
      logout,
      refreshSession,
      sessionMessage,
      tokens,
    }),
    [
      api,
      bootstrapping,
      login,
      logout,
      refreshSession,
      sessionMessage,
      tokens,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

function normalizeTokens(payload: AuthTokensResponse): AuthTokens {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  };
}
