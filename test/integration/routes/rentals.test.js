const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcrypt");
const { Rental } = require("../../../models/rental");
const { User } = require("../../../models/user");
const { Car } = require("../../../models/car");

describe("/api/rentals", () => {
  const path = "/api/rentals";
  let server;

  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await User.remove({});
    await Rental.remove({});
    await Car.remove({});
  });

  describe("GET /", () => {
    let userId1;
    let userId2;
    let carId1;
    let carId2;
    let token;

    const exec = () => {
      return request(server)
        .get(path)
        .set("x-auth-token", token);
    };

    beforeEach(() => {
      userId1 = mongoose.Types.ObjectId();
      userId2 = mongoose.Types.ObjectId();
      carId1 = mongoose.Types.ObjectId();
      carId2 = mongoose.Types.ObjectId();

      token = new User({ isAdmin: true }).generateAuthToken();
    });

    afterEach(async () => {
      await Rental.remove({});
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

    it("should return all rentals", async () => {
      await Rental.collection.insertMany([
        {
          user: {
            _id: userId1,
            name: "user1",
            email: "user1@domain.com"
          },
          car: {
            _id: carId1,
            name: "car1",
            dailyRentalRate: 1
          }
        },
        {
          user: {
            _id: userId2,
            name: "user2",
            email: "user2@domain.com"
          },
          car: {
            _id: carId2,
            name: "car2",
            dailyRentalRate: 1
          }
        }
      ]);

      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(
          g =>
            g.user.name === "user1" &&
            g.user.email === "user1@domain.com" &&
            g.car.name === "car1" &&
            g.car.dailyRentalRate === 1
        )
      ).toBeTruthy();
      expect(
        res.body.some(
          g =>
            g.user.name === "user2" &&
            g.user.email === "user2@domain.com" &&
            g.car.name === "car2" &&
            g.car.dailyRentalRate === 1
        )
      ).toBeTruthy();
    });
  });

  describe("GET /me", () => {
    let hashedPassword;
    let user;
    let userId;
    let carId;
    let rental;
    let token;

    const exec = () => {
      return request(server)
        .get(`${path}/me`)
        .set("x-auth-token", token);
    };

    beforeAll(async () => {
      const salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash("Password123", salt);
    });

    beforeEach(async () => {
      userId = mongoose.Types.ObjectId();
      carId = mongoose.Types.ObjectId();

      user = new User({
        _id: userId,
        name: "user1",
        email: "user1@domain.com",
        password: hashedPassword
      });

      rental = new Rental({
        user: user,
        car: {
          _id: carId,
          name: "car1",
          dailyRentalRate: 1
        }
      });
      await rental.save();

      id = rental._id;

      token = new User(user).generateAuthToken();
    });

    afterEach(async () => {
      await Rental.remove({});
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return the rental of the current user", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(
        res.body.some(
          g =>
            g.user.name === "user1" &&
            g.user.email === "user1@domain.com" &&
            g.car.name === "car1" &&
            g.car.dailyRentalRate === 1
        )
      ).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let userId;
    let carId;
    let rental;
    let id;
    let token;

    const exec = () => {
      return request(server)
        .get(`${path}/${id}`)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      userId = mongoose.Types.ObjectId();
      carId = mongoose.Types.ObjectId();

      rental = new Rental({
        user: {
          _id: userId,
          name: "user1",
          email: "user1@domain.com"
        },
        car: {
          _id: carId,
          name: "car1",
          dailyRentalRate: 1
        }
      });
      await rental.save();

      id = rental._id;

      token = new User({ isAdmin: true }).generateAuthToken();
    });

    afterEach(async () => {
      await Rental.remove({});
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

    it("should return 400 if the id is not valid", async () => {
      id = "1234";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the rental with the given id does not exist", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return the rental with the given id", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(["_id", "user", "car", "dateOut"])
      );
    });
  });

  describe("POST /", () => {
    let hashedPassword;
    let user;
    let userId;
    let token;
    let carId;
    let car;

    const exec = () => {
      return request(server)
        .post(path)
        .set("x-auth-token", token)
        .send({ carId });
    };

    beforeAll(async () => {
      const salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash("Password123", salt);
    });

    beforeEach(async () => {
      carId = mongoose.Types.ObjectId();
      userId = mongoose.Types.ObjectId();

      car = new Car({
        _id: carId,
        name: "car1",
        brand: { name: "brand1" },
        type: { name: "type1" },
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await car.save();

      user = new User({
        _id: userId,
        name: "user1",
        email: "user1@domain.com",
        password: hashedPassword
      });
      await user.save();

      token = new User(user).generateAuthToken();
    });

    afterEach(async () => {
      await User.remove({});
      await Rental.remove({});
      await Car.remove({});
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if carId is not provided", async () => {
      carId = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if carId is not a valid id", async () => {
      carId = "1234";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if car with the given id does not exist", async () => {
      carId = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user does not exist in db", async () => {
      token = new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if car is already in rental by the user", async () => {
      const rental = new Rental({
        user: {
          _id: userId,
          name: "user1",
          email: "user1@domain.com"
        },
        car: {
          _id: carId,
          name: "car1",
          dailyRentalRate: 1
        }
      });
      await rental.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if car is not in stock", async () => {
      await Car.updateOne({ _id: car._id }, { numberInStock: 0 });

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 201 if valid request", async () => {
      const res = await exec();

      expect(res.status).toBe(201);
    });

    it("should save the rental if valid request", async () => {
      await exec();
      const rentalInDb = await Rental.lookup(userId, carId);

      expect(rentalInDb).not.toBeNull();
    });

    it("should return the rental if it is valid", async () => {
      const res = await exec();

      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(["_id", "user", "car", "dateOut"])
      );
    });

    it("should decrease the stock of the car if request is valid", async () => {
      await exec();
      const carInDb = await Car.findById(carId);

      expect(carInDb.numberInStock).toBe(car.numberInStock - 1);
    });
  });
});
