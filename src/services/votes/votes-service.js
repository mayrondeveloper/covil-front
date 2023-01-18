import { axiosInstance } from "../axios/axios";

const baseURL = 'http://localhost:4002';

export const fetch = () => axiosInstance.get(`${baseURL}/votes`);

export const create = (data) =>
    axiosInstance.post(`${baseURL}/votes`, data);

export const remove = (id) =>
    axiosInstance.delete(`${baseURL}/votes/${id}`);
