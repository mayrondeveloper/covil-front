import { AxiosResponse } from "axios";
import { Paginated } from "./types";

export const unwrap = <T>(r: AxiosResponse<Paginated<T>>): AxiosResponse<T[]> => ({
  ...r,
  data: r.data.data,
});

export const MAX_LIMIT = 200;
