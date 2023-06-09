const Router = require('express');
const router = new Router();
const uuid = require("uuid");
const ApiError = require('../error/ApiError');
const articleService = require('../services/articleService');
const checkRole = require("../middlewares/checkRoleMiddleware")
const checkTokenValidation = require("../middlewares/checkTokenValidationMiddleware");
const checkUserIsAuth = require("../middlewares/checkUserIsAuthMiddleware")


router.post("/", checkRole("ADMIN"), async (req, res, next) => {
  try {
    const { title, description, tag_id, user_id } = req.body;
    const filename = uuid.v4() + ".jpg";
    const article = await articleService.create(title, description, tag_id, user_id, req.files, filename)
    return res.json(article);
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.post("/add", checkTokenValidation, async (req, res, next) => {
  try {
    const { title, description, tag_id } = req.body;
    const filename = uuid.v4() + ".jpg";
    const article = await articleService.create(title, description, tag_id, req.user.id, req.files, filename)
    return res.json(article);
  }
  catch (err) {
    console.log(err)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.get("/", async (req, res, next) => {
  try {
    let { title, limit, page, popular, now } = req.query;
    title = title || "";
    limit = limit || 8;
    page = page || 1;
    const result = await articleService.getAll(title, limit, page, popular, now)
    return res.json(result)
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})



router.get("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(ApiError.badRequest("Ошибка запроса"));
    }
    let { title, limit, page, popular, now } = req.query;
    title = title || "";
    limit = limit || 8;
    page = page || 1;
    const result = await articleService.getAllByUserId(title, limit, page, popular, now, id)
    return res.json(result)
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})



router.get("/:id", checkUserIsAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(req.user)
    const article = await articleService.getOne(id, req.user);
    if (!article) {
      return next(ApiError.badRequest("Статьи по данному идентификатору не существует"))
    }
    res.json(article);
  }
  catch (error) {
    console.log(error)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})



router.put("/:id", checkTokenValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(ApiError.badRequest("Ошибка запроса"));
    }
    const { title, description, tag_id, delete_img } = req.body;
    const article = await articleService.update(id, req.user.id, title, description, tag_id, delete_img, req.files);
    if (!article) {
      return next(ApiError.badRequest("Ошибка доступа"));
    }
    res.json(article);

  }
  catch (error) {
    console.log(error)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})


router.delete("/:id", checkTokenValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await articleService.deleteOne(id, req.user.id);
    if (!article) {
      return next(ApiError.badRequest("Ошибка доступа"));
    }
    await article.destroy();
    res.json({ message: "deleted" });

  }
  catch (error) {
    console.log(error)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

// маршрут для просмотров

router.get("/views/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await articleService.setViews(id);
    return res.json({ message: "set view" })
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }

})

// маршруты для лайков

router.post("/likes/:id", checkTokenValidation, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { isLike } = req.body;

    if (isLike === undefined) {
      return next(ApiError.badRequest("Ошибка запроса"))
    }

    const result = await articleService.likeDislike(id, isLike, req.user);
    if (!result) {
      return next(ApiError.badRequest("Ошибка запроса"))
    }
    return res.json({ message: "set rate" })
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})


router.get("/likes/remove/:id", checkTokenValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    await articleService.removeRate(id, req.user);

    return res.json({ message: "removed" })
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

// избранные статьи

router.get("/favorite/get", checkTokenValidation, async (req, res, next) => {
  try {
    let { page, limit, title } = req.query;
    limit = limit || 8;
    page = page || 1;
    let offset = page * limit - limit;
    const articles = await articleService.getFavorites(req.user, limit, offset, title);
    res.json(articles)
  }
  catch (err) {
    console.log(err)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.post("/favorite/add", checkTokenValidation, async (req, res, next) => {
  try {
    const { articleId } = req.body;
    if (!articleId) {
      return next(ApiError.badRequest("Ошибка запроса"))
    };
    const favorite = await articleService.postFavorite(articleId, req.user);
    if (!favorite) {
      return next(ApiError.internal("Ошибка запроса"))
    }
    res.json(favorite)
  }
  catch (err) {
    console.log(err)
    next(ApiError.badRequest("Ошибка запроса"))
  }
})

router.delete("/favorite/delete", checkTokenValidation, async (req, res, next) => {
  try {
    const { articleId } = req.body;
    if (!articleId) {
      return next(ApiError.badRequest("Ошибка запроса"))
    };
    const deletedFav = await articleService.deleteFavorite(articleId, req.user);
    if (!deletedFav) {
      return next(ApiError.internal("Ошибка запроса"))
    }
    res.json({ message: deletedFav });
  }
  catch (err) {
    next(ApiError.badRequest("Ошибка запроса"))
  }
})





module.exports = router