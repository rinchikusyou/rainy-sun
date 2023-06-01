const { Op } = require("sequelize");
const { Tag, Article, ArticleImg, User } = require("../models/models");

class TagService {
  async create(name) {
    const tag = await Tag.create({ name });
    return tag;
  }

  async getAll() {
    const tags = await Tag.findAll();
    return tags
  }

  async getOne(id, limit, offset, title, popular, now) {
    const tag = await Tag.findOne({ where: { id } })

    let articles;

    if (popular && now) {
      articles = await Article.findAndCountAll({
        limit, offset,
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          tagId: id,
        },
        include: [{ model: ArticleImg, as: "article_imgs" },
        {
          model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        }],
        order: [['views', 'DESC'], ['createdAt', 'DESC']]
      })
    }
    else if (popular && !now) {
      articles = await Article.findAndCountAll({
        limit, offset,
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          tagId: id,
        },
        include: [{ model: ArticleImg, as: "article_imgs" },
        {
          model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt"] }
        }],
        order: [['views', 'DESC']]
      })
    }
    else if (!popular && now) {
      articles = await Article.findAndCountAll({
        limit, offset,
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          tagId: id,
        },
        include: [{ model: ArticleImg, as: "article_imgs" },
        {
          model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt"] }
        }],
        order: [['createdAt', 'DESC']]
      })
    }
    else {
      articles = await Article.findAndCountAll({
        limit, offset,
        where: {
          title: {
            [Op.like]: `%${title}%`
          },
          tagId: id,
        },
        include: [{ model: ArticleImg, as: "article_imgs" },
        {
          model: User, as: 'user', attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        }]
      })
    }
    articles.tagName = tag.name;
    articles.tagId = tag.id;
    return articles;
  }
}

module.exports = new TagService();