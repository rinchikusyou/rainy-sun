const Router = require("express");
const router = new Router();
const userController = require("../controllers/userController");

router.use("/user", userController);

module.exports = router;
