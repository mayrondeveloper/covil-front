import { axiosInstance } from "../axios/axios";

const baseURL = "http://localhost:4002";

export const fetch = () => axiosInstance.get(`${baseURL}/votes`);

export const findAllByAwardAndCategory = (id_award, id_category) =>
  axiosInstance.get(
    `${baseURL}/votes/award/${id_award}/category/${id_category}`
  );

export const create = (data) => axiosInstance.post(`${baseURL}/votes`, data);

export const remove = (id) => axiosInstance.delete(`${baseURL}/votes/${id}`);
