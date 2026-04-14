import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  axiosInstance,
  setAccessToken,
  setOnAuthLost,
} from "../services/axios/axios";

type User = { id: string; email: string; role: string };
type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: Status;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await axiosInstance.post("/auth/login", { email, password });
    setAccessToken(r.data.access_token);
    setUser(r.data.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    }
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    setOnAuthLost(clearSession);
    (async () => {
      try {
        const r = await axiosInstance.post("/auth/refresh");
        setAccessToken(r.data.access_token);
        setUser(r.data.user);
        setStatus("authenticated");
      } catch {
        setStatus("unauthenticated");
      }
    })();
    return () => setOnAuthLost(null);
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, status, login, logout }),
    [user, status, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return ctx;
}
