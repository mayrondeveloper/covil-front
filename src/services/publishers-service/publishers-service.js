import { axiosInstance } from "../axios/axios";

const baseURL = 'http://localhost:4002';

export const fetch = () => axiosInstance.get(`${baseURL}/publishers`);

export const create = (data) =>
    axiosInstance.post(`${baseURL}/publishers`, data);
