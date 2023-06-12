const Router = require('express');
const ApiError = require('../error/ApiError');
const router = new Router();
const storage = require("../firebase")
const { ref, getDownloadURL } = require('firebase/storage')

router.get("/:image", async (req, res, next) => {
  try {
    const { image } = req.params;
    const storageRef = ref(storage, `images/${image}`);
    await getDownloadURL(storageRef).then(
      url => {
        res.redirect(url);
      }
    )
  }
  catch (err) {
    console.log(err)
    next(ApiError.badRequest("Произошла ошибка"));
  }
})

module.exports = router