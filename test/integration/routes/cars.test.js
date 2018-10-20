const request = require("supertest");
const mongoose = require("mongoose");
const { Brand } = require("../../../models/brand");
const { Type } = require("../../../models/type");
const { Car } = require("../../../models/car");
const { User } = require("../../../models/user");

describe("/api/cars", () => {
  const path = "/api/cars";
  let server;
  let brandId;
  let typeId;
  let brand;
  let type;

  beforeEach(async () => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await Brand.remove({});
    await Type.remove({});
    await Car.remove({});
  });

  describe("GET /", () => {
    beforeEach(async () => {
      brandId = mongoose.Types.ObjectId();
      typeId = mongoose.Types.ObjectId();

      brand = new Brand({
        _id: brandId,
        name: "brand1"
      });
      await brand.save();

      type = new Type({
        _id: typeId,
        name: "type1"
      });
      await type.save();
    });

    afterEach(async () => {
      await Brand.remove({});
      await Type.remove({});
      await Car.remove({});
    });

    it("should return all cars", async () => {
      await Car.collection.insertMany([
        {
          name: "car1",
          brand: brand,
          type: type,
          numberInStock: 1,
          dailyRentalRate: 1
        },
        {
          name: "car2",
          brand: brand,
          type: type,
          numberInStock: 2,
          dailyRentalRate: 2
        }
      ]);

      const res = await request(server).get(path);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(
          g =>
            g.name === "car1" &&
            g.brand.name === brand.name &&
            g.type.name === type.name &&
            g.numberOfSeats === 5 &&
            g.numberOfDoors === 4 &&
            g.transmission === "Manual" &&
            g.airConditioner === false &&
            g.numberInStock === 1 &&
            g.dailyRentalRate === 1
        )
      ).toBeTruthy();
      expect(
        res.body.some(
          g =>
            g.name === "car2" &&
            g.brand.name === brand.name &&
            g.type.name === type.name &&
            g.numberOfSeats === 5 &&
            g.numberOfDoors === 4 &&
            g.transmission === "Manual" &&
            g.airConditioner === false &&
            g.numberInStock === 2 &&
            g.dailyRentalRate === 2
        )
      ).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    beforeEach(async () => {
      brandId = mongoose.Types.ObjectId();
      typeId = mongoose.Types.ObjectId();

      brand = new Brand({
        _id: brandId,
        name: "brand1"
      });
      await brand.save();

      type = new Type({
        _id: typeId,
        name: "type1"
      });
      await type.save();
    });

    afterEach(async () => {
      await Brand.remove({});
      await Type.remove({});
      await Car.remove({});
    });

    it("should return 400 if the id is not valid", async () => {
      const res = await request(server).get(`${path}/1234`);
      expect(res.status).toBe(400);
    });

    it("should return 404 if the car with the given id does not exist", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`${path}/${id}`);
      expect(res.status).toBe(404);
    });

    it("should return the car with the given id", async () => {
      const car = new Car({
        name: "car1",
        brand: brand,
        type: type,
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await car.save();

      const res = await request(server).get(`${path}/${car._id}`);
      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "name",
          "brand",
          "type",
          "numberOfSeats",
          "numberOfDoors",
          "transmission",
          "airConditioner",
          "numberInStock",
          "dailyRentalRate"
        ])
      );
    });
  });

  describe("POST /", () => {
    let token;
    let name;
    let numberOfSeats;
    let numberOfDoors;
    let transmission;
    let airConditioner;
    let numberInStock;
    let dailyRentalRate;

    const exec = () => {
      return request(server)
        .post(path)
        .set("x-auth-token", token)
        .send({
          name,
          brandId,
          typeId,
          numberOfSeats,
          numberOfDoors,
          transmission,
          airConditioner,
          numberInStock,
          dailyRentalRate
        });
    };

    beforeEach(async () => {
      brandId = mongoose.Types.ObjectId();
      typeId = mongoose.Types.ObjectId();

      brand = new Brand({
        _id: brandId,
        name: "brand1"
      });
      await brand.save();

      type = new Type({
        _id: typeId,
        name: "type1"
      });
      await type.save();

      token = new User({ isAdmin: true }).generateAuthToken();
      name = "car1";
      numberOfSeats = 5;
      numberOfDoors = 4;
      transmission = "Manual";
      airConditioner = false;
      numberInStock = 1;
      dailyRentalRate = 1;
    });

    afterEach(async () => {
      await Brand.remove({});
      await Type.remove({});
      await Car.remove({});
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

    it("should return 400 if car name is empty", async () => {
      name = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if car name has more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if brandId is not provided", async () => {
      brandId = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if brand with given id does not exist", async () => {
      brandId = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if typeId is not provided", async () => {
      typeId = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if type with given id does not exist", async () => {
      typeId = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfSeats is empty", async () => {
      numberOfSeats = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfSeats is below 1", async () => {
      numberOfSeats = 0;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfSeats is not an integer", async () => {
      numberOfSeats = 1.5;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfDoors is empty", async () => {
      numberOfDoors = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfDoors is below 1", async () => {
      numberOfDoors = 0;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfDoors is not an integer", async () => {
      numberOfDoors = 1.5;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if transmission is empty", async () => {
      transmission = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if transmission is invalid", async () => {
      transmission = "xxxxx";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if airConditioner is empty", async () => {
      airConditioner = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if airConditioner is not a boolean", async () => {
      airConditioner = "notBoolean";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is empty", async () => {
      numberInStock = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is not an integer", async () => {
      numberInStock = 1.5;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is below 0", async () => {
      numberInStock = -1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is empty", async () => {
      dailyRentalRate = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is below 0", async () => {
      dailyRentalRate = -1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the car if it is valid", async () => {
      const res = await exec();
      const car = await Car.findOne({ name: "car1" });

      expect(res.status).toBe(201);
      expect(car).not.toBeNull();
    });

    it("should return the car if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "name",
          "brand",
          "type",
          "numberOfSeats",
          "numberOfDoors",
          "transmission",
          "airConditioner",
          "numberInStock",
          "dailyRentalRate"
        ])
      );
    });
  });

  describe("PUT /", () => {
    let token;
    let car;
    let updatedName;
    let numberOfSeats;
    let numberOfDoors;
    let transmission;
    let airConditioner;
    let numberInStock;
    let dailyRentalRate;
    let id;

    const exec = () => {
      return request(server)
        .put(`${path}/${id}`)
        .set("x-auth-token", token)
        .send({
          name: updatedName,
          brandId,
          typeId,
          numberOfSeats,
          numberOfDoors,
          transmission,
          airConditioner,
          numberInStock,
          dailyRentalRate
        });
    };

    beforeEach(async () => {
      brandId = mongoose.Types.ObjectId();
      typeId = mongoose.Types.ObjectId();

      brand = new Brand({
        _id: brandId,
        name: "brand1"
      });
      await brand.save();

      type = new Type({
        _id: typeId,
        name: "type1"
      });
      await type.save();

      car = new Car({
        name: "car1",
        brand: brand,
        type: type,
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await car.save();

      token = new User({ isAdmin: true }).generateAuthToken();
      id = car._id;
      updatedName = "updatedName";
      numberOfSeats = 5;
      numberOfDoors = 4;
      transmission = "Manual";
      airConditioner = false;
      numberInStock = 1;
      dailyRentalRate = 1;
    });

    afterEach(async () => {
      await Brand.remove({});
      await Type.remove({});
      await Car.remove({});
    });

    it("should return 400 if the id is not valid", async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the car with the given id does not exist", async () => {
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

    it("should return 400 if car name is empty", async () => {
      updatedName = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if car name has more than 50 characters", async () => {
      updatedName = new Array(52).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if brandId is not provided", async () => {
      brandId = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if brand with given id does not exist", async () => {
      brandId = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if typeId is not provided", async () => {
      typeId = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if type with given id does not exist", async () => {
      typeId = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfSeats is empty", async () => {
      numberOfSeats = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfSeats is below 1", async () => {
      numberOfSeats = 0;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfSeats is not an integer", async () => {
      numberOfSeats = 1.5;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfDoors is empty", async () => {
      numberOfDoors = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfDoors is below 1", async () => {
      numberOfDoors = 0;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberOfDoors is not an integer", async () => {
      numberOfDoors = 1.5;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if transmission is empty", async () => {
      transmission = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if transmission is invalid", async () => {
      transmission = "xxxxx";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if airConditioner is empty", async () => {
      airConditioner = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if airConditioner is not a boolean", async () => {
      airConditioner = "notBoolean";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is empty", async () => {
      numberInStock = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is not an integer", async () => {
      numberInStock = 1.5;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is below 0", async () => {
      numberInStock = -1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is empty", async () => {
      dailyRentalRate = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is below 0", async () => {
      dailyRentalRate = -1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should update the car if input is valid", async () => {
      await exec();

      const updatedCar = await Car.findById(car._id);

      expect(updatedCar.name).toBe(updatedName);
    });

    it("should return the updated car if input is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", car._id.toHexString());
      expect(res.body).toHaveProperty("name", updatedName);
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "name",
          "brand",
          "type",
          "numberOfSeats",
          "numberOfDoors",
          "transmission",
          "airConditioner",
          "numberInStock",
          "dailyRentalRate"
        ])
      );
    });
  });

  describe("DELETE /", () => {
    let token;
    let car;
    let id;

    const exec = () => {
      return request(server)
        .delete(`${path}/${id}`)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      brandId = mongoose.Types.ObjectId();
      typeId = mongoose.Types.ObjectId();

      brand = new Brand({
        _id: brandId,
        name: "brand1"
      });
      await brand.save();

      type = new Type({
        _id: typeId,
        name: "type1"
      });
      await type.save();

      car = new Car({
        name: "car1",
        brand: brand,
        type: type,
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await car.save();

      token = new User({ isAdmin: true }).generateAuthToken();
      id = car._id;
    });

    afterEach(async () => {
      await Brand.remove({});
      await Type.remove({});
      await Car.remove({});
    });

    it("should return 400 if the id is not valid", async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the car with the given id does not exist", async () => {
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

    it("should delete the car if input is valid", async () => {
      await exec();

      const carInDb = await Car.findById(id);

      expect(carInDb).toBeNull();
    });

    it("should return the removed car", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", car._id.toHexString());
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "name",
          "brand",
          "type",
          "numberOfSeats",
          "numberOfDoors",
          "transmission",
          "airConditioner",
          "numberInStock",
          "dailyRentalRate"
        ])
      );
    });
  });
});
