const request = require("supertest");
const mongoose = require("mongoose");
const { Brand } = require("../../../models/brand");
const { User } = require("../../../models/user");

describe("/api/brands", () => {
  const path = "/api/brands";
  let server;

  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await Brand.remove({});
  });

  describe("GET /", () => {
    it("should return all brands", async () => {
      await Brand.collection.insertMany([
        { name: "brand1" },
        { name: "brand2" }
      ]);

      const res = await request(server).get(path);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === "brand1")).toBeTruthy();
      expect(res.body.some(g => g.name === "brand2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if the id is not valid", async () => {
      const res = await request(server).get(`${path}/1234`);
      expect(res.status).toBe(400);
    });

    it("should return 404 if the brand with the given id does not exist", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`${path}/${id}`);
      expect(res.status).toBe(404);
    });

    it("should return the brand with the given id", async () => {
      const brand = new Brand({ name: "brand1" });
      await brand.save();

      const res = await request(server).get(`${path}/${brand._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", brand.name);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const exec = () => {
      return request(server)
        .post(path)
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = "brand1";
    });

    afterEach(async () => {
      await Brand.remove({});
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
      token = new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 400 if brand name is empty", async () => {
      name = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if brand name has more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the brand if it is valid", async () => {
      const res = await exec();
      const brand = await Brand.findOne({ name: "brand1" });

      expect(res.status).toBe(201);
      expect(brand).not.toBeNull();
    });

    it("should return the brand if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "brand1");
    });
  });

  describe("PUT /", () => {
    let token;
    let brand;
    let updatedName;
    let id;

    const exec = () => {
      return request(server)
        .put(`${path}/${id}`)
        .set("x-auth-token", token)
        .send({ name: updatedName });
    };

    beforeEach(async () => {
      brand = new Brand({ name: "brand1" });
      await brand.save();

      token = new User({ isAdmin: true }).generateAuthToken();
      id = brand._id;
      updatedName = "updatedName";
    });

    afterEach(async () => {
      await Brand.remove({});
    });

    it("should return 400 if the id is not valid", async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the brand with the given id does not exist", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
      token = new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 400 if brand name is empty", async () => {
      updatedName = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if brand name has more than 50 characters", async () => {
      updatedName = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should update the brand if input is valid", async () => {
      await exec();

      const updatedBrand = await Brand.findById(brand._id);

      expect(updatedBrand.name).toBe(updatedName);
    });

    it("should return the updated brand if input is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", brand._id.toHexString());
      expect(res.body).toHaveProperty("name", updatedName);
    });
  });

  describe("DELETE /", () => {
    let token;
    let brand;
    let id;

    const exec = () => {
      return request(server)
        .delete(`${path}/${id}`)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      brand = new Brand({ name: "brand1" });
      await brand.save();

      token = new User({ isAdmin: true }).generateAuthToken();
      id = brand._id;
    });

    afterEach(async () => {
      await Brand.remove({});
    });

    it("should return 400 if the id is not valid", async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the brand with the given id does not exist", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
      token = new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should delete the brand if input is valid", async () => {
      await exec();

      const brandInDb = await Brand.findById(id);

      expect(brandInDb).toBeNull();
    });

    it("should return the removed brand", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", brand._id.toHexString());
      expect(res.body).toHaveProperty("name", brand.name);
    });
  });
});
