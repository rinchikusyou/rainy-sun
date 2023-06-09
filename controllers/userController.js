const Router = require('express');
const router = new Router();
const ApiError = require("../error/ApiError")
const userService = require("../services/userService")
const checkTokenValidation = require("../middlewares/checkTokenValidationMiddleware")



router.post("/registration", async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return next(ApiError.badRequest("Некорректные данные"));
    }
    const candidate = await userService.checkCandidate(email);
    if (candidate) {
      return next(ApiError.badRequest("Пользователь с таким email уже существует"));
    }
    const hashPassword = await userService.cryptPassword(password);

    const user = await userService.create(username, email, hashPassword, role, req.files);


    const jwt = userService.generateToken(user.id, username, email, role, user.imgAvatar);
    res.json({ token: jwt });
  }
  catch (err) {
    return next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.put("/", checkTokenValidation, async (req, res, next) => {
  try {
    const { username, delete_img } = req.body;
    const user = await userService.updateUser(username, req.user.email, delete_img, req.files);
    if (!user) {
      return next(ApiError.badRequest("Ошибка запроса"))
    }
    const jwt = userService.generateToken(user.id, user.username, user.email, user.role, user.imgAvatar);
    res.json({ token: jwt })
  }
  catch (e) {
    return next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.put("/changepassword", checkTokenValidation, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userService.checkCandidate(req.user.email);
    const validate = userService.compareCryptPassword(oldPassword, user.password);
    if (!validate) {
      return next(ApiError.badRequest("Неверный пароль"));
    }
    const hashedNewPassword = await userService.cryptPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    const jwt = userService.generateToken(user.id, user.username, user.email, user.role, user.imgAvatar);
    res.json({ token: jwt });
  }
  catch (e) {
    return next(ApiError.badRequest("Ошибка запроса"))
  }
})


router.get("/getuser/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(ApiError.badRequest("Ошибка запроса"))
    }
    const user = await userService.getUser(id);
    if (!user) {
      return next(ApiError.badRequest("Пользователь не найден"))
    }
    return res.json(user);
  }
  catch (e) {
    return next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest("Некорректный email или пароль"));
    }
    const user = await userService.checkCandidate(email);
    if (!user) {
      return next(ApiError.badRequest("Пользователя с таким email не существует"));
    }
    const validate = userService.compareCryptPassword(password, user.password);
    if (!validate) {
      return next(ApiError.badRequest("Неверный пароль"));
    }
    const jwt = userService.generateToken(user.id, user.username, email, user.role, user.imgAvatar);
    res.json({ token: jwt })
  }
  catch (err) {
    return next(ApiError.badRequest("Ошибка запроса"))
  }
})
router.get("/authcheck", checkTokenValidation, async (req, res, next) => {
  const { username, email, id, role, fileName } = req.user;
  const jwt = userService.generateToken(id, username, email, role, fileName);
  res.json({ token: jwt });
})

module.exports = router