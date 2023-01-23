import { axiosInstance } from "../axios/axios";

const baseURL = "http://localhost:4002";

export const fetch = () => axiosInstance.get(`${baseURL}/participants`);

export const create = (data) =>
  axiosInstance.post(`${baseURL}/participants`, data);

export const remove = (id) =>
  axiosInstance.delete(`${baseURL}/participants/${id}`);
