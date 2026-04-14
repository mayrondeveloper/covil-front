import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

const baseURL = process.env.REACT_APP_BASE_PATH;

if (!baseURL) {
  // eslint-disable-next-line no-console
  console.error(
    "REACT_APP_BASE_PATH não está definido. Configure a variável de ambiente antes de iniciar a aplicação."
  );
}

export const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

// ---------- Access token (em memória) ----------
let _accessToken: string | null = null;
export const setAccessToken = (t: string | null) => {
  _accessToken = t;
};
export const getAccessToken = () => _accessToken;

// Callback invocado quando o refresh falha (auth perdida) — o AuthProvider registra.
let _onAuthLost: (() => void) | null = null;
export const setOnAuthLost = (fn: (() => void) | null) => {
  _onAuthLost = fn;
};

// Injeta Bearer em toda requisição autenticada
axiosInstance.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers = config.headers ?? ({} as any);
    (config.headers as any).Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ---------- Refresh on 401 ----------
let refreshPromise: Promise<string> | null = null;

const isAuthPath = (url: string | undefined) => {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
};

async function doRefresh(): Promise<string> {
  if (!refreshPromise) {
    // Usa axios puro para evitar recursão pelo interceptor de request/response.
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((r) => {
        const token = r.data?.access_token as string;
        _accessToken = token;
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthPath(original.url)
    ) {
      original._retry = true;
      try {
        const newToken = await doRefresh();
        original.headers = original.headers ?? ({} as any);
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return axiosInstance(original);
      } catch (e) {
        _accessToken = null;
        _onAuthLost?.();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

interface ServerErrorBody {
  message?: string;
  error?: string;
  conflict?: "place" | "game" | string;
  existing?: any;
  target?: string[];
}

const formatErrorMessage = (
  status: number | undefined,
  body: ServerErrorBody | undefined
): string => {
  // 409 DUPLICATE_VOTE / UNIQUE_CONSTRAINT_VIOLATION com payload rico do backend
  if (status === 409 && (body?.error === "DUPLICATE_VOTE" || body?.error === "UNIQUE_CONSTRAINT_VIOLATION")) {
    const existing = body.existing ?? {};
    const target = body.target ?? [];
    const conflict =
      body.conflict ??
      (target.includes("place") ? "place" : target.includes("id_game") ? "game" : undefined);

    if (conflict === "place") {
      return `Voto duplicado: este votante já registrou ${existing.place ?? "essa colocação"}º lugar nesta categoria${existing.game?.name ? ` (em ${existing.game.name})` : ""}.`;
    }
    if (conflict === "game") {
      return `Voto duplicado: este votante já votou neste jogo nesta categoria${existing.place ? ` (${existing.place}º lugar)` : ""}.`;
    }
    return "Voto duplicado para este votante nesta categoria.";
  }

  if (body?.message) return body.message;

  if (status) {
    if (status === 400) return "Dados inválidos. Verifique os campos.";
    if (status === 401) return "Não autorizado.";
    if (status === 403) return "Você não tem permissão para essa ação.";
    if (status === 404) return "Recurso não encontrado.";
    if (status === 409) return "Conflito: este registro entra em conflito com outro existente.";
    if (status === 413) return "Arquivo grande demais. O limite é 5 MB.";
    if (status === 415) return "Formato de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.";
    if (status === 422) return "Não foi possível baixar a imagem dessa URL. Verifique se está acessível.";
    if (status >= 500) return "O servidor encontrou um problema. Tente novamente em instantes.";
    return `Erro ${status} ao comunicar com o servidor.`;
  }
  return "Falha de rede ao comunicar com o servidor.";
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ServerErrorBody>) => {
    const status = error.response?.status;
    const url = error.config?.url;
    // Endpoints de auth: silenciosos aqui. A página de login exibe o próprio erro,
    // e o /auth/refresh pode falhar em bootstrap sem sessão (normal).
    if (isAuthPath(url)) return Promise.reject(error);

    const message = formatErrorMessage(status, error.response?.data);

    if (process.env.NODE_ENV !== "test") {
      toast.error(message, {
        toastId: `http-${status ?? "network"}-${error.response?.data?.error ?? ""}`,
      });
    }

    return Promise.reject(error);
  }
);
