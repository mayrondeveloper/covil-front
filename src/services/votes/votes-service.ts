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

export const update = (
  id: Id,
  data: { place?: string; id_game?: Id },
) => axiosInstance.patch<Vote>(`/votes/${id}`, data);

export type BulkVoteConflictReason =
  | "duplicate_place"
  | "duplicate_game"
  | "invalid_place"
  | "unknown";

export interface BulkVoteConflict {
  place: string;
  id_game: string;
  reason: BulkVoteConflictReason;
}

export interface BulkVotesResult {
  created: Vote[];
  conflicts: BulkVoteConflict[];
}

export const bulkCreate = (data: {
  id_award: Id;
  id_category: Id;
  id_vote: Id;
  votes: { place: string; id_game: Id }[];
}) => axiosInstance.post<BulkVotesResult>(`/votes/bulk`, data);

export const remove = (id: Id) => axiosInstance.delete<void>(`/votes/${id}`);
