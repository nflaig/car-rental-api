const request = require("supertest");
const { Brand } = require("../../../models/brand");
const { User } = require("../../../models/user");

describe("auth middleware", () => {
  let server;
  let token;

  const exec = () => {
    return request(server)
      .post("/api/brands")
      .set("x-auth-token", token)
      .send({ name: "brand1" });
  };

  beforeEach(() => {
    server = require("../../../index");
    token = new User({ isAdmin: true }).generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Brand.remove({});
  });

  it("should return 401 if no token is provided", async () => {
    token = "";
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    token = "a";
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 201 if token is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(201);
  });
});
