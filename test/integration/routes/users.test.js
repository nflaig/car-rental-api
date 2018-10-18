const request = require("supertest");
const bcrypt = require("bcrypt");
const { User } = require("../../../models/user");

describe("/api/users", () => {
  const path = "/api/users";
  let password;
  let hashedPassword;
  let server;
  let user1;
  let token1;
  let user2;
  let token2;

  beforeAll(async () => {
    const salt = await bcrypt.genSalt(12);
    password = "Password123";
    hashedPassword = await bcrypt.hash(password, salt);
  });

  beforeEach(async () => {
    server = require("../../../index");

    user1 = new User({
      name: "user1",
      email: "user1@domain.com",
      password: hashedPassword,
      isAdmin: true
    });
    await user1.save();

    token1 = new User(user1).generateAuthToken();

    user2 = new User({
      name: "user2",
      email: "user2@domain.com",
      password: hashedPassword,
      isAdmin: false
    });
    await user2.save();

    token2 = new User(user2).generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await User.remove({});
  });

  describe("GET /", () => {
    const exec = token => {
      return request(server)
        .get(path)
        .set("x-auth-token", token);
    };

    it("should return 401 if client is not logged in", async () => {
      const res = await exec("");

      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
      const res = await exec(token2);

      expect(res.status).toBe(403);
    });

    it("should return all users", async () => {
      const res = await exec(token1);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(
          g =>
            g.name === "user1" &&
            g.email === "user1@domain.com" &&
            g.password === undefined &&
            g.isAdmin === true
        )
      ).toBeTruthy();
      expect(
        res.body.some(
          g =>
            g.name === "user2" &&
            g.email === "user2@domain.com" &&
            g.password === undefined &&
            g.isAdmin === false
        )
      ).toBeTruthy();
    });
  });

  describe("GET /me", () => {
    const exec = token => {
      return request(server)
        .get(`${path}/me`)
        .set("x-auth-token", token);
    };

    it("should return 401 if client is not logged in", async () => {
      const res = await exec("");

      expect(res.status).toBe(401);
    });

    it("should return the user", async () => {
      const res = await exec(token1);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", user1.name);
      expect(res.body).toHaveProperty("email", user1.email);
      expect(res.body).toHaveProperty("isAdmin", user1.isAdmin);
      expect(res.body).not.toHaveProperty("password");
    });
  });
});
