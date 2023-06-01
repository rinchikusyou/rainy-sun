const sequelize = require("../db.js");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: "USER" },
  imgAvatar: { type: DataTypes.STRING, allowNull: true }
})


const Favorite = sequelize.define("favorite", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

const Article = sequelize.define("article", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  dislikes: { type: DataTypes.INTEGER, defaultValue: 0 },
})

const ArticleImg = sequelize.define("article_img", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  imgName: { type: DataTypes.STRING, unique: true, allowNull: false }
})

const UserArticleLikes = sequelize.define("user_article_likes", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  isLike: { type: DataTypes.BOOLEAN, allowNull: false }
})

const Tag = sequelize.define("tag", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false }
})

const Comment = sequelize.define("comment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  description: { type: DataTypes.STRING, allowNull: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  dislikes: { type: DataTypes.INTEGER, defaultValue: 0 },
})

const UserCommentLikes = sequelize.define("user_comment_likes", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  isLike: { type: DataTypes.BOOLEAN, allowNull: false }
})


User.hasMany(UserArticleLikes);
UserArticleLikes.belongsTo(User);

User.hasMany(Favorite, { as: "user_favorite" });
Favorite.belongsTo(User);


User.hasMany(Article, { as: "user_article" });
Article.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserCommentLikes);
UserCommentLikes.belongsTo(User);

User.hasMany(Comment, { as: "user_comment" });
Comment.belongsTo(User);


Tag.hasMany(Article, { as: "tag_article" });
Article.belongsTo(Tag);


Article.hasMany(UserArticleLikes);
UserArticleLikes.belongsTo(Article);

Article.hasMany(ArticleImg, { as: "article_imgs" });
ArticleImg.belongsTo(Article);

Article.hasMany(Favorite, { as: "article_favorite" });
Favorite.belongsTo(Article);

Article.hasMany(Comment, { as: "article_comment" });
Comment.belongsTo(Article);

Comment.hasMany(UserCommentLikes);
UserCommentLikes.belongsTo(Comment);

module.exports = {
  User,
  Article,
  Tag,
  Comment,
  UserArticleLikes,
  UserCommentLikes,
  ArticleImg,
  Favorite,
}


