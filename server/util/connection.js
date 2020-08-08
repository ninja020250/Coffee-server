var pgp = require("pg-promise")({});
var connectionString =
  "postgres://postgres:nhatcuong123@localhost:5432/coffeeShop";
var db = pgp(connectionString);

const connectDB = () => {
  return new Promise((resolve, reject) => {
    db.connect()
      .then((res) => {
        console.log("Connect to db successfully");
        resolve(res);
      })
      .catch((error) => {
        console.log("ERROR:", error.message || error);
        reject(error);
      });
  });
  return;
};

const closeDBConnection = (c) => {
  c.done();
};

module.exports = {
  connectDB,
  closeDBConnection,
};
