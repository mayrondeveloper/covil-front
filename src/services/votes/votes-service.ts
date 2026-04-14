import { axiosInstance } from "../axios/axios";
import { Vote, Id, Paginated, PageParams } from "../types";
import { MAX_LIMIT, unwrap } from "../pagination";

type VotesFilter = PageParams & {
  id_award?: Id;
  id_vote?: Id;
  id_category?: Id;
  id_game?: Id;
};

export const fetchPage = (params?: VotesFilter) =>
  axiosInstance.get<Paginated<Vote>>(`/votes`, { params });

export const fetch = () => fetchPage({ limit: MAX_LIMIT }).then(unwrap);

export const fetchByAwardAndVoter = (awardId: Id, voterId: Id) =>
  fetchPage({ id_award: awardId, id_vote: voterId, limit: MAX_LIMIT }).then(
    unwrap
  );

export const fetchByAward = (awardId: Id) =>
  fetchPage({ id_award: awardId, limit: MAX_LIMIT }).then(unwrap);

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
