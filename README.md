## Introduction

This project is a implementation of a Car Rental API in [Node.js](https://nodejs.org/en/).
It uses [Express](https://expressjs.com/) as web framework and [MongoDB](https://www.mongodb.com/) as database.
The code is fully covered by tests, using [Jest](https://jestjs.io/).

The application allows new users to register and authenticate by using [JSON Web Tokens](https://jwt.io/).
Registered users are able to rent a car and return it at any time.
Admins have additional privileges such as adding new cars to the database or viewing all active rentals.

## Installation

In order to run the application on your local machine some requirements need to be installed.

#### Node.js

Install `npm` which is distributed with Node.js.

https://nodejs.org/en/download/

#### MongoDB

Install MongoDB and make sure the database server is running.

https://www.mongodb.com/download-center/community

#### Dependencies

Change the directory to the project folder and install the dependencies.

```
npm install
```

## Tests

Run the tests to make sure everything is installed correctly and working.

```
npm test
```

## Usage

Finally, start the Node web server.

```
npm start
```

The application will run on http://localhost:3000 by default.
If the port is already in use, it can be changed by setting the `PORT` environment variable.
The easiest way to interact with the server is by installing a API development environment such as [Postman](https://www.getpostman.com/).

## License

Code released under the [MIT License](https://github.com/nflaig/car-rental-api/blob/master/LICENSE).
