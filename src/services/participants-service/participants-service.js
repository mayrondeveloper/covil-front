import { axiosInstance } from "../axios/axios";

const baseURL = process.env.REACT_APP_BASE_PATH;

export const fetch = () => axiosInstance.get(`${baseURL}/participants`);

export const create = (data) =>
  axiosInstance.post(`${baseURL}/participants`, data);

export const remove = (id) =>
  axiosInstance.delete(`${baseURL}/participants/${id}`);
