import { axiosInstance } from "../axios/axios";

const baseURL = 'http://localhost:4002';

export const fetch = () => axiosInstance.get(`${baseURL}/mechanisms`);

export const create = (data) =>
    axiosInstance.post(`${baseURL}/mechanisms`, data);
