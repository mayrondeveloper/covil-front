import { axiosInstance } from "../axios/axios";

export const fetch = () => axiosInstance.get(`/awards`);

export const create = (data) => axiosInstance.post(`/awards`, data);

export const remove = (id) => axiosInstance.delete(`/awards/${id}`);
