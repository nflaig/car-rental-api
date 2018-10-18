const error = require("../../../middleware/error");
const mockRes = require("jest-mock-express").response;

describe("error middleware", () => {
  it("should return 500 if an unexpected error occurred", () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    error(new Error(), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalled();
  });
});
