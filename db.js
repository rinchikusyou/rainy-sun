const { Sequelize } = require('sequelize');
require("dotenv").config();


const { DATABASE_URL } = process.env

// const { DB_PORT, DB_HOST, DB_PASSWORD, DB_USERNAME, DB_NAME } = process.env

module.exports = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
})

// module.exports = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
//   dialect: "postgres",
//   host: DB_HOST,
//   port: DB_PORT,
// })