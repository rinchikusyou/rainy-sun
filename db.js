const { Sequelize } = require("sequelize");
require("dotenv").config();

const { DB_PORT, DB_HOST, DB_PASSWORD, DB_USERNAME, DB_NAME } = process.env;

module.exports = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  dialect: "postgres",
  host: DB_HOST,
  port: DB_PORT,
});
