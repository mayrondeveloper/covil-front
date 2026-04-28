import { axiosInstance } from "../axios/axios";

export type SettingKey = "drawer_icon_url";

export type SettingsMap = Partial<Record<SettingKey, string>> & {
  [key: string]: string | undefined;
};

export const fetchAll = () => axiosInstance.get<SettingsMap>(`/settings`);

export const upsert = (key: SettingKey, value: string) =>
  axiosInstance.put<{ key: string; value: string }>(`/settings/${key}`, {
    value,
  });
