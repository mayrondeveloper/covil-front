import { axiosInstance } from "../axios/axios";

export const fetch = () => axiosInstance.get(`/games`);

export const fetchOne = (id) => axiosInstance.get(`/games/${id}`);

export const findAllByAwardAndCategory = (id_award, id_category) =>
  axiosInstance.get(`/games/award/${id_award}/category/${id_category}`);

export const create = (data) => axiosInstance.post(`/games`, data);

export const deleteGame = (id) => axiosInstance.delete(`/games/${id}`);

export const update = (id, data) => axiosInstance.put(`/games/${id}`, data);

export const getDataGameByUrl = url => axiosInstance.get(`games/info?url=${url}`)
