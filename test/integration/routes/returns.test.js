const mongoose = require("mongoose");
const request = require("supertest");
const moment = require("moment");
const bcrypt = require("bcrypt");
const { Rental } = require("../../../models/rental");
const { User } = require("../../../models/user");
const { Car } = require("../../../models/car");

describe("/api/returns", () => {
  const path = "/api/returns";
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

  describe("POST /", () => {
    let hashedPassword;
    let user;
    let userId;
    let token;
    let carId;
    let car;
    let rental;

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

    it("should return 400 if userId/carId do not match an existing active rental", async () => {
      await Rental.remove({});

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if return is already processed", async () => {
      await Rental.updateOne({ _id: rental._id }, { dateReturned: new Date() });

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 200 if valid request", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should set the return date if input is valid", async () => {
      await exec();
      const rentalInDb = await Rental.findById(rental._id);
      const diff = new Date() - rentalInDb.dateReturned;

      expect(diff).toBeLessThan(10 * 1000);
    });

    it("should calculate and set the rental fee if input is valid", async () => {
      rental.dateOut = moment()
        .add(-7, "days")
        .toDate();
      await rental.save();
      await exec();
      const rentalInDb = await Rental.findById(rental._id);

      expect(rentalInDb.rentalFee).toBe(7);
    });

    it("should increase the stock of the car if input is valid", async () => {
      await exec();
      const carInDb = await Car.findById(carId);

      expect(carInDb.numberInStock).toBe(car.numberInStock + 1);
    });

    it("should return the rental if input is valid", async () => {
      const res = await exec();

      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "user",
          "car",
          "dateOut",
          "dateReturned",
          "rentalFee"
        ])
      );
    });
  });
});
