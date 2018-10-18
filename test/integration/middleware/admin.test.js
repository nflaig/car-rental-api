const request = require("supertest");
const { Brand } = require("../../../models/brand");
const { User } = require("../../../models/user");

describe("admin middleware", () => {
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

  it("should return 403 if user is not an admin", async () => {
    token = new User().generateAuthToken();
    const res = await exec();

    expect(res.status).toBe(403);
  });

  it("should return 201 if user is an admin", async () => {
    const res = await exec();

    expect(res.status).toBe(201);
  });
});
