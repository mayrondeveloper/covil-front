import { axiosInstance } from "../axios/axios";

const baseURL = process.env.REACT_APP_BASE_PATH;

export const fetch = () => axiosInstance.get(`${baseURL}/award-categories`);

export const create = (data) =>
  axiosInstance.post(`${baseURL}/award-categories`, data);

export const remove = (id) =>
  axiosInstance.delete(`${baseURL}/award-categories/${id}`);
