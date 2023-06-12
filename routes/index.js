const Router = require('express');
const router = new Router();
const articleController = require('../controllers/articleController')
const userController = require('../controllers/userController')
const tagController = require('../controllers/tagController')
const commentController = require('../controllers/commentController')
const imageController = require("../controllers/imageController")

router.use("/comment", commentController)
router.use("/article", articleController)
router.use("/user", userController)
router.use("/tag", tagController)
router.use('/images', imageController)


module.exports = router