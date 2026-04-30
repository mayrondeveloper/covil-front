import { axiosInstance } from "../axios/axios";

export type UploadFolder =
  | "games"
  | "participants"
  | "awards"
  | "award-categories"
  | "misc";

export interface UploadResponse {
  url: string;
  key: string;
  size: number;
  mime: string;
  width: number;
  height: number;
}

export const upload = (
  file: File,
  folder: UploadFolder = "misc",
  onProgress?: (percent: number) => void
) => {
  const form = new FormData();
  form.append("file", file);
  return axiosInstance.post<UploadResponse>(`/uploads`, form, {
    params: { folder },
    // Não setar Content-Type — axios/browser definem multipart/form-data com boundary automaticamente
    onUploadProgress: (e) => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
};

export const remove = (key: string) =>
  axiosInstance.delete<void>(`/uploads/${encodeURIComponent(key)}`);

export const uploadFromUrl = (url: string, folder: UploadFolder = "misc") =>
  axiosInstance.post<UploadResponse>(`/uploads/from-url`, { url, folder });
