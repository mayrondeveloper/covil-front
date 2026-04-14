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

export const remove = (id: Id) =>
  axiosInstance.delete<void>(`/award-categories/${id}`);
