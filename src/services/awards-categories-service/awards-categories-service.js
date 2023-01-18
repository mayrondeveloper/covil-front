import { axiosInstance } from "../axios/axios";

const baseURL = 'http://localhost:4002';

export const fetch = () => axiosInstance.get(`${baseURL}/award-categories`);

export const create = (data) =>
    axiosInstance.post(`${baseURL}/award-categories`, data);

export const remove = (id) =>
    axiosInstance.delete(`${baseURL}/award-categories/${id}`);
