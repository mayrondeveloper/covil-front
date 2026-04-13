import axios, { AxiosError } from "axios";
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
});

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
    const message = formatErrorMessage(status, error.response?.data);

    if (process.env.NODE_ENV !== "test") {
      toast.error(message, {
        toastId: `http-${status ?? "network"}-${error.response?.data?.error ?? ""}`,
      });
    }

    return Promise.reject(error);
  }
);
