const { Article, UserArticleLikes, ArticleImg, User, Favorite, Comment, Tag, UserCommentLikes } = require("../models/models")
const { Op } = require("sequelize");
const uuid = require("uuid")
const imageService = require("./imageService")

class ArticleService {


  async create(title, description, tag_id, user_id, files, fileName) {
    const article = await Article.create({ title, description, tagId: tag_id, userId: user_id });
    if (files) {
      const { preview } = files;
      await ArticleImg.create({ articleId: article.id, imgName: fileName });
      await imageService.uploadToFirebase(fileName, preview.data);
    }
    return article;
  }

  async postArticle(articleId) {
    const article = await Article.findOne({
      where: {
        id: articleId,
        confirmed: false,
      }
    })
    if (!article) {
      return null;
    }
    article.confirmed = true;
    await article.save();
    return article;
  }


  async getAll(title, limit, page, popular, now, confirmed) {
    let result;
    let offset = limit * page - limit;
    if (popular && now) {
      result = await Article.findAndCountAll(
        {
          attributes: {
            exclude: ["description"]
          },
          where: {
            title: {
              [Op.like]: `%${title}%`
            },
            confirmed: confirmed,
          }, include: [{ model: ArticleImg, as: "article_imgs" },
          { model: Tag, as: "tag" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } },
          ], limit, offset, order: [['views', 'DESC'], ['createdAt', 'DESC']]
        })
    }
    else if (popular && !now) {
      result = await Article.findAndCountAll({
        attributes: {
          exclude: ["description"]
        },
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          confirmed: confirmed,
        }, include: [{ model: ArticleImg, as: "article_imgs" },
        { model: Tag, as: "tag" },
        { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
        ], limit, offset, order: [['views', 'DESC']]
      })
    }
    else if (!popular && now) {
      result = await Article.findAndCountAll({
        attributes: {
          exclude: ["description"]
        },
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          confirmed: confirmed,
        }, include:
          [{ model: ArticleImg, as: "article_imgs" },
          { model: Tag, as: "tag" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
          ], limit, offset, order: [['createdAt', 'DESC']]
      })
    }
    else {
      result = await Article.findAndCountAll({
        attributes: {
          exclude: ["description"]
        },
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          confirmed: confirmed,
        }, include: [{ model: ArticleImg, as: "article_imgs" },
        { model: Tag, as: "tag" },
        { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
        ], limit, offset
      })
    }



    return result;
  }



  async getAllByUserId(title, limit, page, popular, now, userId) {
    let result;
    let offset = limit * page - limit;
    if (popular && now) {
      result = await Article.findAndCountAll(
        {
          attributes: {
            exclude: ["description"]
          },
          where: {
            title: {
              [Op.like]: `%${title}%`
            },
            confirmed: true,
            userId
          }, include: [{ model: ArticleImg, as: "article_imgs" },
          { model: Tag, as: "tag" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } },
          ], limit, offset, order: [['views', 'DESC'], ['createdAt', 'DESC']]
        })
    }
    else if (popular && !now) {
      result = await Article.findAndCountAll({
        attributes: {
          exclude: ["description"]
        },
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          confirmed: true,
          userId
        }, include: [{ model: ArticleImg, as: "article_imgs" },
        { model: Tag, as: "tag" },
        { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
        ], limit, offset, order: [['views', 'DESC']]
      })
    }
    else if (!popular && now) {
      result = await Article.findAndCountAll({
        attributes: {
          exclude: ["description"]
        },
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          confirmed: true,
          userId
        }, include:
          [{ model: ArticleImg, as: "article_imgs" },
          { model: Tag, as: "tag" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
          ], limit, offset, order: [['createdAt', 'DESC']]
      })
    }
    else {
      result = await Article.findAndCountAll({
        attributes: {
          exclude: ["description"]
        },
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          confirmed: true,
          userId
        }, include: [{ model: ArticleImg, as: "article_imgs" },
        { model: Tag, as: "tag" },
        { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
        ], limit, offset
      })
    }

    return result;
  }




  async getOne(id, user, confirmed) {
    let article;
    if (user) {
      article = await Article.findOne(
        {
          where: { id, confirmed: confirmed }, include: [{ model: ArticleImg, as: "article_imgs" },
          { model: Tag, as: "tag" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } },
          { model: UserArticleLikes, as: "user_article_likes", where: { articleId: id, userId: user.id }, required: false },
          { model: Favorite, as: "article_favorite", where: { articleId: id, userId: user.id }, required: false }
          ],
        })

    }
    else {
      article = await Article.findOne(
        {
          where: { id, confirmed: confirmed }, include: [{ model: ArticleImg, as: "article_imgs" },
          { model: Tag, as: "tag" },
          { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } },
          ]
        })
    }
    return article;
  }



  async deleteOne(id, user, confirmed) {
    const article = await Article.findOne(
      {
        where: { id, confirmed }
      },
      { model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt"] } })
    if (article.userId !== user.id && user.role !== "ADMIN") {
      return null;
    }
    const articleImg = await ArticleImg.findOne({
      where: { articleId: article.id }
    })
    if (articleImg) {
      await imageService.deleteFromFirebase(articleImg.imgName);
      await articleImg.destroy();
    }
    const articleId = article.id;
    const comments = await Comment.findAll({ where: { articleId } });
    const article_likes = await UserArticleLikes.findAll({ where: { articleId } });
    article_likes.forEach(article_like => {
      article_like.destroy();
    })
    comments.forEach(async (comment) => {
      const comment_likes = await UserCommentLikes.findAll({ where: { commentId: comment.id } })
      comment_likes.forEach(comment_like => {
        comment_like.destroy();
      })
      comment.destroy();
    })
    return article;
  }



  async update(id, title, description, tag_id, delete_img, files) {
    const article = await Article.findOne(
      {
        where: { id, confirmed: true }
      })
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
      await imageService.deleteFromFirebase(articleImg.imgName);
      articleImg.destroy();
    }
    else if (files) {
      fileName = uuid.v4() + ".jpg";

      articleImg = await ArticleImg.findOne({
        where: { articleId: article.id }
      })

      const { preview } = files;

      if (articleImg) {

        await imageService.deleteFromFirebase(articleImg.imgName);
        articleImg.imgName = fileName;
        await articleImg.save();
      }

      else {
        await ArticleImg.create({ articleId: article.id, imgName: fileName });
      }
      // preview.mv(path.resolve(__dirname, "..", "static", fileName));
      await imageService.uploadToFirebase(fileName, preview.data)
    }

    await article.save();
    return article;
  }

  async setViews(id) {
    const article = await Article.findOne(
      {
        where: { id, confirmed: true }
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
        where: { id, confirmed: true }
      });
    await UserArticleLikes.create({ articleId: id, userId: user.id, isLike: type });
    type ? article.likes += 1 : article.dislikes += 1;
    await article.save();
    return article;
  }

  async removeRate(id, user) {
    const article = await Article.findOne(
      {
        where: { id, confirmed: true }
      });
    const userRate = await UserArticleLikes.findOne({ where: { articleId: id, userId: user.id } })
    userRate.isLike ? article.likes -= 1 : article.dislikes -= 1;
    await article.save();
    await userRate.destroy();
  }


  async getFavorites(user, limit, offset, title) {
    const articles = await Favorite.findAndCountAll({
      where: {
        userId: user.id
      },
      include: [{
        model: Article, where: {
          title: {
            [Op.like]: `%${title}%`
          }
        }, as: "article", include: [
          { model: Tag, as: "tag" },
          { model: ArticleImg, as: "article_imgs" },
          { model: User, as: "user", attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] } }
        ],
        attributes: { exclude: ["description"] }
      }]
      , limit, offset
    })

    return articles;
  }

  async postFavorite(articleId, user) {
    const checkFav = await Favorite.findOne({ where: { articleId, userId: user.id } });
    if (checkFav) {
      return null;
    }
    const newFavorite = await Favorite.create({ articleId, userId: user.id });
    console.log(newFavorite)
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