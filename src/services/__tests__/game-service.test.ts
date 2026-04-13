import { axiosInstance } from "../axios/axios";
import * as gameService from "../game-service/game-service";

jest.mock("../axios/axios", () => ({
  axiosInstance: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: undefined })),
  },
}));

const mocked = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("game-service", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetch chama /games", () => {
    gameService.fetch();
    expect(mocked.get).toHaveBeenCalledWith("/games");
  });

  it("fetchOne chama /games/:id", () => {
    gameService.fetchOne("123");
    expect(mocked.get).toHaveBeenCalledWith("/games/123");
  });

  it("create faz POST /games com body", () => {
    gameService.create({ name: "Uno" });
    expect(mocked.post).toHaveBeenCalledWith("/games", { name: "Uno" });
  });

  it("update faz PUT /games/:id", () => {
    gameService.update("9", { name: "X" });
    expect(mocked.put).toHaveBeenCalledWith("/games/9", { name: "X" });
  });

  it("deleteGame faz DELETE /games/:id", () => {
    gameService.deleteGame("7");
    expect(mocked.delete).toHaveBeenCalledWith("/games/7");
  });

  it("findAllByAwardAndCategory monta URL", () => {
    gameService.findAllByAwardAndCategory("a1", "c1");
    expect(mocked.get).toHaveBeenCalledWith("/games/award/a1/category/c1");
  });
});
