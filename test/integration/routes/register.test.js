const request = require("supertest");
const bcrypt = require("bcrypt");
const { User } = require("../../../models/user");

describe("/api/register", () => {
  const path = "/api/register";
  let server;

  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await User.remove({});
  });

  describe("POST /", () => {
    let name;
    let email;
    let password;
    let hashedPassword;
    let user;

    const exec = () => {
      return request(server)
        .post(path)
        .send({ name, email, password });
    };

    beforeAll(async () => {
      const salt = await bcrypt.genSalt(12);
      password = "Password123";
      hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        name: "user1",
        email: "user1@domain.com",
        password: hashedPassword
      });
    });

    beforeEach(() => {
      name = "user1";
      email = "user1@domain.com";
      password = "Password123";
    });

    afterEach(async () => {
      await User.remove({});
    });

    it("should return 400 if user name is empty", async () => {
      name = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user name has more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user name has invalid characters", async () => {
      name = "<scritp>alert(xss)</script>";
      const res = await exec();

      expect(res.status).toBe(400);
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

    it("should return 400 if user password it not complex enough", async () => {
      password = "password123";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user already exists", async () => {
      await user.save();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the user if input is valid", async () => {
      const res = await exec();
      const userInDb = await User.findOne({ email: "user1@domain.com" });

      expect(res.status).toBe(201);
      expect(userInDb).not.toBeNull();
    });

    it("should return the user and token if input is valid", async () => {
      const res = await exec();

      expect(res.header).toHaveProperty("x-auth-token");
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "user1");
      expect(res.body).toHaveProperty("email", "user1@domain.com");
    });
  });
});
