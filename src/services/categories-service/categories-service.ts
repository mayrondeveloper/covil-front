import { axiosInstance } from "../axios/axios";
import { Id, NamedEntity, Paginated, PageParams } from "../types";
import { MAX_LIMIT, unwrap } from "../pagination";

export const fetchPage = (params?: PageParams) =>
  axiosInstance.get<Paginated<NamedEntity>>(`/categories`, { params });

export const fetch = () => fetchPage({ limit: MAX_LIMIT }).then(unwrap);

export const fetchOne = (id: Id) =>
  axiosInstance.get<NamedEntity>(`/categories/${id}`);

export const create = (data: Partial<NamedEntity>) =>
  axiosInstance.post<NamedEntity>(`/categories`, data);

export interface BulkCreateResult {
  created: NamedEntity[];
  skipped: string[];
}

export const bulkCreate = (data: { names: string[] }) =>
  axiosInstance.post<BulkCreateResult>(`/categories/bulk`, data);

export const update = (id: Id, data: Partial<NamedEntity>) =>
  axiosInstance.put<NamedEntity>(`/categories/${id}`, data);

export const remove = (id: Id) =>
  axiosInstance.delete<void>(`/categories/${id}`);
