import { useCallback } from "react";
import { toast, TypeOptions } from "react-toastify";

export const useNotification = () => {
  const notify = useCallback((message: string, type: TypeOptions = "info") => {
    toast(message, { type });
  }, []);

  return {
    notify,
    success: useCallback((message: string) => toast.success(message), []),
    error: useCallback((message: string) => toast.error(message), []),
    info: useCallback((message: string) => toast.info(message), []),
    warn: useCallback((message: string) => toast.warn(message), []),
  };
};
