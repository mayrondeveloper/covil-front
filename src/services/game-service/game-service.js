import { axiosInstance } from "../axios/axios";

export const fetch = () => axiosInstance.get(`/games`);

export const findAllByAwardAndCategory = (id_award, id_category) =>
  axiosInstance.get(`/games/award/${id_award}/category/${id_category}`);

export const create = (data) => axiosInstance.post(`/games`, data);

export const deleteGame = (id) => axiosInstance.delete(`/games/${id}`);
