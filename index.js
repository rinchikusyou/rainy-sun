require("dotenv").config();
const sequelize = require("./db")
const models = require("./models/models.js")
const express = require('express');
const router = require("./routes/index")
const fileUpload = require("express-fileupload")
const ErrorHandlerMiddleware = require("./middlewares/ErrorHandlerMiddleware")
const cors = require("cors")
const path = require("path")
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const staticPath = path.resolve(__dirname, "static");

if (!fs.existsSync(staticPath)) {
  fs.mkdirSync(staticPath);
}

app.use(cors());
app.use(express.json());
app.use(fileUpload({}));
app.use(express.static(staticPath))
app.use("/api", router);
app.use(ErrorHandlerMiddleware);

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`server is working on ${PORT}`)
  })

}

start();
