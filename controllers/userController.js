const Router = require("express");
const router = new Router();
const ApiError = require("../error/ApiError");
const userService = require("../services/userService");

router.post("/registration", async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return next(ApiError.badRequest("Некорректные данные"));
    }
    const candidate = await userService.checkCandidate(email);
    if (candidate) {
      return next(
        ApiError.badRequest("Пользователь с таким email уже существует")
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
    return next(ApiError.badRequest("Ошибка запроса"));
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest("Некорректный email или пароль"));
    }
    const user = await userService.checkCandidate(email);
    if (!user) {
      return next(
        ApiError.badRequest("Пользователя с таким email не существует")
      );
    }
    const validate = userService.compareCryptPassword(password, user.password);
    if (!validate) {
      return next(ApiError.badRequest("Неверный пароль"));
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
    return next(ApiError.badRequest("Ошибка запроса"));
  }
});

module.exports = router;
