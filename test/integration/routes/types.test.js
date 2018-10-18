const request = require("supertest");
const mongoose = require("mongoose");
const { Type } = require("../../../models/type");
const { User } = require("../../../models/user");

describe("/api/types", () => {
  const path = "/api/types";
  let server;

  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await Type.remove({});
  });

  describe("GET /", () => {
    it("should return all types", async () => {
      await Type.collection.insertMany([{ name: "type1" }, { name: "type2" }]);

      const res = await request(server).get(path);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === "type1")).toBeTruthy();
      expect(res.body.some(g => g.name === "type2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if the id is not valid", async () => {
      const res = await request(server).get(`${path}/1234`);
      expect(res.status).toBe(400);
    });

    it("should return 404 if the type with the given id does not exist", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`${path}/${id}`);
      expect(res.status).toBe(404);
    });

    it("should return the type with the given id", async () => {
      const type = new Type({ name: "type1" });
      await type.save();

      const res = await request(server).get(`${path}/${type._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", type.name);
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
      name = "type1";
    });

    afterEach(async () => {
      await Type.remove({});
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

    it("should return 400 if type name is empty", async () => {
      name = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if type name has more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the type if it is valid", async () => {
      const res = await exec();
      const type = await Type.findOne({ name: "type1" });

      expect(res.status).toBe(201);
      expect(type).not.toBeNull();
    });

    it("should return the type if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "type1");
    });
  });

  describe("PUT /", () => {
    let token;
    let type;
    let updatedName;
    let id;

    const exec = () => {
      return request(server)
        .put(`${path}/${id}`)
        .set("x-auth-token", token)
        .send({ name: updatedName });
    };

    beforeEach(async () => {
      type = new Type({ name: "type1" });
      await type.save();

      token = new User({ isAdmin: true }).generateAuthToken();
      id = type._id;
      updatedName = "updatedName";
    });

    afterEach(async () => {
      await Type.remove({});
    });

    it("should return 400 if the id is not valid", async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the type with the given id does not exist", async () => {
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

    it("should return 400 if type name is empty", async () => {
      updatedName = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if type name has more than 50 characters", async () => {
      updatedName = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should update the type if input is valid", async () => {
      await exec();

      const updatedType = await Type.findById(type._id);

      expect(updatedType.name).toBe(updatedName);
    });

    it("should return the updated type if input is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", type._id.toHexString());
      expect(res.body).toHaveProperty("name", updatedName);
    });
  });

  describe("DELETE /", () => {
    let token;
    let type;
    let id;

    const exec = () => {
      return request(server)
        .delete(`${path}/${id}`)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      type = new Type({ name: "type1" });
      await type.save();

      token = new User({ isAdmin: true }).generateAuthToken();
      id = type._id;
    });

    afterEach(async () => {
      await Type.remove({});
    });

    it("should return 400 if the id is not valid", async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the type with the given id does not exist", async () => {
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

    it("should delete the type if input is valid", async () => {
      await exec();

      const typeInDb = await Type.findById(id);

      expect(typeInDb).toBeNull();
    });

    it("should return the removed type", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", type._id.toHexString());
      expect(res.body).toHaveProperty("name", type.name);
    });
  });
});
