const Router = require('express');
const ApiError = require('../error/ApiError');
const router = new Router();
const tagService = require("../services/tagService")
const checkRole = require("../middlewares/checkRoleMiddleware")

router.post("/", checkRole("ADMIN"), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return next(ApiError.badRequest("Имя не введено"));
    }
    const tag = await tagService.create(name);
    return res.json(tag);
  }
  catch (err) {
    next(ApiError.badRequest("дубликат имён"));
  }
})


router.get("/", async (req, res, next) => {
  try {
    const { title, limit } = req.query;
    const tags = await tagService.getAll(title, limit);
    res.json(tags);
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})


router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    let { title, limit, page, popular, now } = req.query;

    title = title || "",
      limit = limit || 8;
    page = page || 1;
    let offset = limit * page - limit;
    const tag = await tagService.getOne(id, limit, offset, title, popular, now);
    if (!tag) {
      return next(ApiError.badRequest("Ошибка запроса"))
    }
    res.json(tag);
  }
  catch (err) {
    console.log(err)
    return next(ApiError.badRequest("Ошибка запроса"))
  }
})

module.exports = router