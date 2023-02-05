import { axiosInstance } from "../axios/axios";

const baseURL = process.env.REACT_APP_BASE_PATH;

export const fetch = () => axiosInstance.get(`${baseURL}/mechanisms`);

export const create = (data) =>
  axiosInstance.post(`${baseURL}/mechanisms`, data);
