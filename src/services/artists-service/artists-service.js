import { axiosInstance } from "../axios/axios";

const baseURL = 'http://localhost:4002';

export const fetch = () => axiosInstance.get(`${baseURL}/artists`);

export const create = (data) =>
    axiosInstance.post(`${baseURL}/artists`, data);
