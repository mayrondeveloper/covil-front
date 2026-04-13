import { axiosInstance } from "../axios/axios";
import { Game, Id, Paginated, PageParams } from "../types";
import { MAX_LIMIT, unwrap } from "../pagination";

export const fetchPage = (params?: PageParams) =>
  axiosInstance.get<Paginated<Game>>(`/games`, { params });

export const fetch = () => fetchPage({ limit: MAX_LIMIT }).then(unwrap);

export const fetchOne = (id: Id) => axiosInstance.get<Game>(`/games/${id}`);

export const findAllByAwardAndCategory = (id_award: Id, id_category: Id) =>
  axiosInstance.get<Game[]>(`/games/award/${id_award}/category/${id_category}`);

export const create = (data: Partial<Game>) =>
  axiosInstance.post<Game>(`/games`, data);

export const deleteGame = (id: Id) => axiosInstance.delete<void>(`/games/${id}`);

export const update = (id: Id, data: Partial<Game>) =>
  axiosInstance.put<Game>(`/games/${id}`, data);

export const getDataGameByUrl = (url: string) =>
  axiosInstance.get<Game>(`/games/info?url=${url}`);
