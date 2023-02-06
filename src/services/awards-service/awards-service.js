import { axiosInstance } from "../axios/axios";

export const fetch = () => axiosInstance.get(`/awards`);

export const fetchOne = (id) => axiosInstance.get(`/awards/${id}`);

export const create = (data) => axiosInstance.post(`/awards`, data);

export const remove = (id) => axiosInstance.delete(`/awards/${id}`);

export const update = (id, data) => axiosInstance.put(`/awards/${id}`, data);
