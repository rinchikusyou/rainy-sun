const Router = require('express');
const router = new Router();
const ApiError = require("../error/ApiError")
const checkTokenValidation = require("../middlewares/checkTokenValidationMiddleware");
const commentService = require('../services/commentService');
const checkUserIsAuthMiddleware = require('../middlewares/checkUserIsAuthMiddleware');


router.post("/:id", checkTokenValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    if (!id || !description) {
      return next(ApiError.badRequest("Ошибка запроса"))
    }
    const comment = await commentService.createComment(id, req.user, description);
    res.json(comment);
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.get("/:id", checkUserIsAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    let { limit, page } = req.query;
    limit = limit || 10;
    page = page || 1;
    offset = page * limit - limit;
    if (!id) {
      return next(ApiError.badRequest("Ошибка запроса"))
    }
    const comments = await commentService.getComments(id, req.user, limit, offset);
    res.json(comments);
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.delete("/:id", checkTokenValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(ApiError.badRequest("Ошибка запроса"));
    }
    const comment = await commentService.deleteComment(id, req.user);
    if (!comment) {
      return next(ApiError.badRequest("Ошибка запроса"));
    }
    res.json(comment);
  }
  catch (err) {
    console.log(err)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

// маршруты лайков
router.post("/likes/:id", checkTokenValidation, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { isLike } = req.body;

    if (isLike === undefined) {
      console.log("lol")
      return next(ApiError.badRequest("Ошибка запроса"))
    }

    const result = await commentService.likeDislike(id, isLike, req.user);
    if (!result) {
      return next(ApiError.badRequest("Ошибка запроса"))
    }
    return res.json({ message: "set rate" })
  }
  catch (err) {
    console.log(err)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})
router.get("/likes/remove/:id", checkTokenValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    await commentService.removeRate(id, req.user);

    return res.json({ message: "removed" })
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})


// маршрут просмотров
router.get("/views/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await commentService.setViews(id);
    return res.json({ message: "set view" })
  }
  catch (err) {
    console.log(err)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

module.exports = router