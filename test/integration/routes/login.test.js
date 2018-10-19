const request = require("supertest");
const bcrypt = require("bcrypt");
const { User } = require("../../../models/user");

describe("/api/login", () => {
  const path = "/api/login";
  let server;

  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await User.remove({});
  });

  describe("POST /", () => {
    let email;
    let password;
    let hashedPassword;
    let user;

    const exec = () => {
      return request(server)
        .post(path)
        .send({ email, password });
    };

    beforeAll(async () => {
      const salt = await bcrypt.genSalt(12);
      password = "Password123";
      hashedPassword = await bcrypt.hash(password, salt);
    });

    beforeEach(async () => {
      email = "user1@domain.com";
      password = "Password123";

      user = new User({
        name: "user1",
        email: "user1@domain.com",
        password: hashedPassword
      });
      await user.save();
    });

    afterEach(async () => {
      await User.remove({});
    });

    it("should return 400 if user email is empty", async () => {
      email = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user email has invalid format", async () => {
      email = "user1domain.com";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user password is empty", async () => {
      password = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user password has less than 8 characters", async () => {
      password = "1234567";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user password has more than 255 characters", async () => {
      password = new Array(257).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user with given email does not exists", async () => {
      email = "user2@domain.com";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is wrong for given email", async () => {
      password = "Password132";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return the token if email and password is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.text).toBeDefined();
    });
  });
});
