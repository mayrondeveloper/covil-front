import { axiosInstance } from "../axios/axios";
import { Vote, Id, Paginated, PageParams } from "../types";
import { MAX_LIMIT, unwrap } from "../pagination";

export const fetchPage = (params?: PageParams) =>
  axiosInstance.get<Paginated<Vote>>(`/votes`, { params });

export const fetch = () => fetchPage({ limit: MAX_LIMIT }).then(unwrap);

export const findAllByAwardAndCategoryPage = (
  id_award: Id,
  id_category: Id,
  params?: PageParams
) =>
  axiosInstance.get<Paginated<Vote>>(
    `/votes/award/${id_award}/category/${id_category}`,
    { params }
  );

export const findAllByAwardAndCategory = (id_award: Id, id_category: Id) =>
  findAllByAwardAndCategoryPage(id_award, id_category, { limit: MAX_LIMIT }).then(
    unwrap
  );

export const create = (data: Partial<Vote>) =>
  axiosInstance.post<Vote>(`/votes`, data);

export const remove = (id: Id) => axiosInstance.delete<void>(`/votes/${id}`);
