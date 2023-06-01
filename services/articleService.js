const { Article, UserArticleLikes, Comment, ArticleImg, User, Favorite, UserCommentLikes } = require("../models/models")
const fs = require('fs')
const { Op, or } = require("sequelize");
const path = require('path')
const uuid = require("uuid")
const asyncDeleteFile = require("../files/removeAsync")


class ArticleService {


  async create(title, description, tag_id, user_id, files, fileName) {
    const article = await Article.create({ title, description, tagId: tag_id, userId: user_id });
    if (files) {
      const { preview } = files;
      await ArticleImg.create({ articleId: article.id, imgName: fileName });
      preview.mv(path.resolve(__dirname, "..", "static", fileName));
    }
    return article;
  }


  async getAll(title, limit, page, popular, now) {
    let result;
    let offset = limit * page - limit;
    if (popular && now) {
      result = await Article.findAndCountAll(
        {
          where: {
            title: {
              [Op.like]: `%${title}%`
            }
          }, include: [{ model: ArticleImg, as: "article_imgs" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } },
          ], limit, offset, order: [['views', 'DESC'], ['createdAt', 'DESC']]
        })
    }
    else if (popular && !now) {
      result = await Article.findAndCountAll({
        where: {
          title: {
            [Op.like]: `%${title}%`
          }
        }, include: [{ model: ArticleImg, as: "article_imgs" },
        { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
        ], limit, offset, order: [['views', 'DESC']]
      })
    }
    else if (!popular && now) {
      result = await Article.findAndCountAll({
        where: {
          title: {
            [Op.like]: `%${title}%`
          }
        }, include:
          [{ model: ArticleImg, as: "article_imgs" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
          ], limit, offset, order: [['createdAt', 'DESC']]
      })
    }
    else {
      result = await Article.findAndCountAll({
        where: {
          title: {
            [Op.like]: `%${title}%`
          }
        }, include: [{ model: ArticleImg, as: "article_imgs" },
        { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
        ], limit, offset
      })
    }



    return result;
  }



  async getOne(id, user) {
    let article;
    if (user) {
      article = await Article.findOne(
        {
          where: { id }, include: [{ model: ArticleImg, as: "article_imgs" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } },
          { model: UserArticleLikes, as: "user_article_likes", where: { articleId: id, userId: user.id }, required: false }
          ],
        })

    }
    else {
      article = await Article.findOne(
        {
          where: { id }, include: [{ model: ArticleImg, as: "article_imgs" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } },
          ]
        })
    }
    return article;
  }



  async deleteOne(id, userId) {
    const article = await Article.findOne(
      {
        where: { id }
      },
      { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt"] } })
    if (article.userId !== userId) {
      return null;
    }
    const articleImg = await ArticleImg.findOne({
      where: { articleId: article.id }
    })
    if (articleImg) {
      await asyncDeleteFile(articleImg.imgName);
      await articleImg.destroy();
    }
    return article;
  }



  async update(id, userId, title, description, tag_id, delete_img, files) {
    const article = await Article.findOne(
      {
        where: { id }
      })
    if (article.userId !== userId) {
      return null;
    }
    article.title = title || article.title;
    article.description = description || article.description;
    article.tagId = tag_id || article.tagId;
    let fileName, articleImg;
    if (delete_img) {
      articleImg = await ArticleImg.findOne({
        where: { articleId: article.id }
      })
      if (!articleImg) {
        return null;
      }
      await asyncDeleteFile(articleImg.imgName);
      articleImg.destroy();
    }
    else if (files) {
      fileName = uuid.v4() + ".jpg";

      articleImg = await ArticleImg.findOne({
        where: { articleId: article.id }
      })

      const { preview } = files;

      if (articleImg) {

        await asyncDeleteFile(articleImg.imgName);
        articleImg.imgName = fileName;
        await articleImg.save();
      }

      else {
        await ArticleImg.create({ articleId: article.id, imgName: fileName });
      }

      preview.mv(path.resolve(__dirname, "..", "static", fileName));
    }

    await article.save();
    return article;
  }

  async setViews(id) {
    const article = await Article.findOne(
      {
        where: { id }
      });
    article.views += 1;
    await article.save();
    return article;
  }

  async likeDislike(id, type, user) {
    const userRate = await UserArticleLikes.findOne({ where: { articleId: id, userId: user.id } })
    if (userRate) {
      return null;
    }
    const article = await Article.findOne(
      {
        where: { id }
      });
    await UserArticleLikes.create({ articleId: id, userId: user.id, isLike: type });
    type ? article.likes += 1 : article.dislikes += 1;
    await article.save();
    return article;
  }

  async removeRate(id, user) {
    const article = await Article.findOne(
      {
        where: { id }
      });
    const userRate = await UserArticleLikes.findOne({ where: { articleId: id, userId: user.id } })
    userRate.isLike ? article.likes -= 1 : article.dislikes -= 1;
    await article.save();
    await userRate.destroy();
  }


  async getFavorites(user) {
    const articles = await Favorite.findAndCountAll({
      where: {
        userId: user.id
      },
      include: [{
        model: Article, as: "article", include: [
          { model: ArticleImg, as: "article_imgs" },
          { model: User, as: "user" }
        ]
      }]
    })

    return articles;
  }

  async postFavorite(articleId, user) {
    const checkFav = await Favorite.findOne({ where: { articleId, userId: user.id } });
    if (checkFav) {
      return null;
    }
    const newFavorite = await Favorite.create({ articleId, userId: user.id });
    return newFavorite;
  }


  async deleteFavorite(articleId, user) {
    const checkFav = await Favorite.findOne({ where: { articleId, userId: user.id } });
    if (!checkFav) {
      return null;
    }
    await checkFav.destroy();
    return "deleted"
  }



}


module.exports = new ArticleService();