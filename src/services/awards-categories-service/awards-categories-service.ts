import { axiosInstance } from "../axios/axios";
import { AwardCategory, Id, Paginated, PageParams } from "../types";
import { MAX_LIMIT, unwrap } from "../pagination";

export const fetchPage = (params?: PageParams) =>
  axiosInstance.get<Paginated<AwardCategory>>(`/award-categories`, { params });

export const fetch = () => fetchPage({ limit: MAX_LIMIT }).then(unwrap);

export const fetchByAward = (award: Id) =>
  axiosInstance
    .get<Paginated<AwardCategory>>(`/award-categories`, {
      params: { award, limit: MAX_LIMIT },
    })
    .then(unwrap);

export const create = (
  data: Partial<AwardCategory> & { award_id?: Id },
) => axiosInstance.post<AwardCategory>(`/award-categories`, data);

export const update = (
  id: Id,
  data: { name?: string; description?: string },
) => axiosInstance.patch<AwardCategory>(`/award-categories/${id}`, data);

export interface BulkCategoryItem {
  name: string;
  description?: string;
}

export interface BulkCreateResult {
  created: AwardCategory[];
  skipped: string[];
}

export const bulkCreate = (data: {
  categories: BulkCategoryItem[];
  award_id?: Id;
}) =>
  axiosInstance.post<BulkCreateResult>(`/award-categories/bulk`, data);

export const remove = (id: Id) =>
  axiosInstance.delete<void>(`/award-categories/${id}`);
