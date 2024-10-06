require("dotenv").config();
const sequelize = require("./db");
const express = require("express");
const router = require("./routes/index");
const ErrorHandlerMiddleware = require("./middlewares/ErrorHandlerMiddleware");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(ErrorHandlerMiddleware);

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`server is working on ${PORT}`);
  });
};

start();
