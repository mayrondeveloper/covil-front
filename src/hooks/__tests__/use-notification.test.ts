import { renderHook, act } from "@testing-library/react";
import { useNotification } from "../use-notification";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe("useNotification", () => {
  beforeEach(() => jest.clearAllMocks());

  it("notify chama toast com tipo", () => {
    const { result } = renderHook(() => useNotification());
    act(() => result.current.notify("oi", "success"));
    expect(toast).toHaveBeenCalledWith("oi", { type: "success" });
  });

  it("success/error/info/warn delegam aos métodos do toast", () => {
    const { result } = renderHook(() => useNotification());
    act(() => {
      result.current.success("ok");
      result.current.error("bad");
      result.current.info("info");
      result.current.warn("warn");
    });
    expect(toast.success).toHaveBeenCalledWith("ok");
    expect(toast.error).toHaveBeenCalledWith("bad");
    expect(toast.info).toHaveBeenCalledWith("info");
    expect(toast.warn).toHaveBeenCalledWith("warn");
  });
});
