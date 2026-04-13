import { axiosInstance } from "../axios/axios";
import { Id, NamedEntity, Paginated, PageParams } from "../types";
import { MAX_LIMIT, unwrap } from "../pagination";

export const fetchPage = (params?: PageParams) =>
  axiosInstance.get<Paginated<NamedEntity>>(`/designers`, { params });

export const fetch = () => fetchPage({ limit: MAX_LIMIT }).then(unwrap);

export const fetchOne = (id: Id) =>
  axiosInstance.get<NamedEntity>(`/designers/${id}`);

export const create = (data: Partial<NamedEntity>) =>
  axiosInstance.post<NamedEntity>(`/designers`, data);

export const update = (id: Id, data: Partial<NamedEntity>) =>
  axiosInstance.put<NamedEntity>(`/designers/${id}`, data);

export const remove = (id: Id) =>
  axiosInstance.delete<void>(`/designers/${id}`);
