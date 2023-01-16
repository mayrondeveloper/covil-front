import { axiosInstance } from "../axios/axios";

const baseURL = 'http://localhost:4002';

export const fetch = () => axiosInstance.get(`${baseURL}/designers`);

export const create = (data) =>
    axiosInstance.post(`${baseURL}/designers`, data);
