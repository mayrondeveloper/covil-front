import { axiosInstance } from "../axios/axios";
import { Participant, Id, Paginated, PageParams } from "../types";
import { MAX_LIMIT, unwrap } from "../pagination";

export const fetchPage = (params?: PageParams) =>
  axiosInstance.get<Paginated<Participant>>(`/participants`, { params });

export const fetch = () => fetchPage({ limit: MAX_LIMIT }).then(unwrap);

export const create = (data: Partial<Participant>) =>
  axiosInstance.post<Participant>(`/participants`, data);

export const remove = (id: Id) =>
  axiosInstance.delete<void>(`/participants/${id}`);
