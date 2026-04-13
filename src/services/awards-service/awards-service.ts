import { axiosInstance } from "../axios/axios";
import {
  Award,
  Id,
  Paginated,
  PageParams,
  RankingResponse,
  ScoringScheme,
} from "../types";
import { MAX_LIMIT, unwrap } from "../pagination";

export const fetchPage = (params?: PageParams) =>
  axiosInstance.get<Paginated<Award>>(`/awards`, { params });

export const fetch = () => fetchPage({ limit: MAX_LIMIT }).then(unwrap);

export const fetchOne = (id: Id) => axiosInstance.get<Award>(`/awards/${id}`);

export const create = (data: Partial<Award>) =>
  axiosInstance.post<Award>(`/awards`, data);

export const remove = (id: Id) => axiosInstance.delete<void>(`/awards/${id}`);

export const update = (id: Id, data: Partial<Award>) =>
  axiosInstance.put<Award>(`/awards/${id}`, data);

export const fetchScoringScheme = (id: Id) =>
  axiosInstance.get<ScoringScheme>(`/awards/${id}/scoring-scheme`);

export interface AddVotersResult {
  added: number;
  requested: number;
}

/**
 * Append-only: adiciona um ou mais votantes ao prêmio.
 * Idempotente — backend ignora ids já vinculados.
 * Resposta: `{ added, requested }`. `requested - added` = quantos foram pulados.
 */
export const addVoters = (awardId: Id, voterIds: Id[]) =>
  axiosInstance.post<AddVotersResult>(`/awards/${awardId}/voters`, {
    id_voters: voterIds,
  });

export interface AddGamesResult {
  added: number;
  requested: number;
}

/**
 * Append-only: adiciona um ou mais jogos ao prêmio.
 * Idempotente — backend ignora ids já vinculados.
 */
export const addGames = (awardId: Id, gameIds: Id[]) =>
  axiosInstance.post<AddGamesResult>(`/awards/${awardId}/games`, {
    id_games: gameIds,
  });

export interface CloneAwardOptions {
  name?: string;
  year?: string | number;
  copy_categories?: boolean;
  copy_voters?: boolean;
  copy_games?: boolean;
}

/**
 * Clona uma edição existente. Backend cria nova edição com nome/ano novos
 * e copia categorias, votantes e jogos do prêmio fonte (sem copiar votos).
 */
export const cloneAward = (sourceId: Id, options: CloneAwardOptions) =>
  axiosInstance.post<Award>(`/awards/${sourceId}/clone`, options);

export const fetchRanking = (awardId: Id, categoryId: Id) =>
  axiosInstance.get<RankingResponse>(
    `/awards/${awardId}/categories/${categoryId}/ranking`
  );
