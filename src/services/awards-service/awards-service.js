import { axiosInstance } from "../axios/axios";

const baseURL = 'http://localhost:4002';

export const fetch = () => axiosInstance.get(`${baseURL}/awards`);

export const create = (data) =>
    axiosInstance.post(`${baseURL}/awards`, data);

export const remove = (id) =>
    axiosInstance.delete(`http://localhost:4002/awards/${id}`);
