import { axiosInstance } from "../axios/axios";

const baseURL = process.env.REACT_APP_BASE_PATH;

export const fetch = () => axiosInstance.get(`${baseURL}/games`);

export const findAllByAwardAndCategory = (id_award, id_category) =>
  axiosInstance.get(
    `${baseURL}/games/award/${id_award}/category/${id_category}`
  );

export const create = (data) => axiosInstance.post(`${baseURL}/games`, data);

export const deleteGame = (id) =>
  axiosInstance.delete(`http://localhost:4002/games/${id}`);
