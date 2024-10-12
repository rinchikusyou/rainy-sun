const Router = require("express");
const router = new Router();
const ApiError = require("../error/ApiError");
const userService = require("../services/userService");

router.post("/registration", async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return next(ApiError.badRequest("Uncorrect data"));
    }
    const candidate = await userService.checkCandidate(email);
    if (candidate) {
      return next(
        ApiError.badRequest("A user with this email already exists")
      );
    }
    const hashPassword = await userService.cryptPassword(password);

    const user = await userService.create(username, email, hashPassword, role);

    const jwt = userService.generateToken(
      user.id,
      username,
      email,
      role,
      user.imgAvatar
    );
    res.json({ token: jwt });
  } catch (err) {
    console.log(err);
    return next(ApiError.badRequest("Request error"));
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest("Uncorrect Email or password"));
    }
    const user = await userService.checkCandidate(email);
    if (!user) {
      return next(
        ApiError.badRequest("A user with this email already exists")
      );
    }
    const validate = userService.compareCryptPassword(password, user.password);
    if (!validate) {
      return next(ApiError.badRequest("Uncorrect password"));
    }
    const jwt = userService.generateToken(
      user.id,
      user.username,
      email,
      user.role,
      user.imgAvatar
    );
    res.json({ token: jwt });
  } catch (err) {
    return next(ApiError.badRequest("Request error"));
  }
});

module.exports = router;
