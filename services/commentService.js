const { Comment, UserCommentLikes, User } = require("../models/models");


class CommentService {
  async createComment(articleId, user, description) {
    const comment = await Comment.create({ articleId, userId: user.id, description });
    return comment;
  }

  async getComments(articleId, user, limit, offset) {
    let comments;
    if (user) {
      comments = await Comment.findAndCountAll({
        where: { articleId },
        include: [{ model: User, as: "user", attributes: { exclude: ["password", "role", "createdAt", "updatedAt"] } }, {
          model: UserCommentLikes, as: "user_comment_likes",
          where: { userId: user.id }, required: false
        }], limit, offset, order: [["createdAt", "DESC"]]
      })
    }
    else {
      comments = await Comment.findAndCountAll({ where: { articleId }, include: [{ model: User, as: "user", attributes: { exclude: ["password", "role", "createdAt", "updatedAt"] } }], limit, offset })
    }
    return comments;
  }


  async deleteComment(commentId, user) {
    const commentCheck = await Comment.findOne({ where: { id: commentId } });
    if (!commentCheck || commentCheck.userId !== user.id) {
      return null;
    }
    const commentLikesDislikes = await UserCommentLikes.findAll({
      where: {
        commentId: commentId,
      }
    })
    commentLikesDislikes.forEach(async (item) => {
      { await item.destroy(); }
    })
    await commentCheck.destroy();
    return { message: "deleted" };
  }

  async setViews(id) {
    const comment = await Comment.findOne(
      {
        where: { id }
      });
    comment.views += 1;
    await comment.save();
    return comment;
  }

  async likeDislike(id, type, user) {
    const userRate = await UserCommentLikes.findOne({ where: { commentId: id, userId: user.id } })
    if (userRate) {
      return null;
    }
    const comment = await Comment.findOne({
      where: { id }
    })
    await UserCommentLikes.create({ commentId: id, userId: user.id, isLike: type })
    type ? comment.likes += 1 : comment.dislikes += 1;
    await comment.save();
    return comment;
  }

  async removeRate(id, user) {
    const comment = await Comment.findOne(
      {
        where: { id }
      });
    const userRate = await UserCommentLikes.findOne({ where: { commentId: id, userId: user.id } })
    userRate.isLike ? comment.likes -= 1 : comment.dislikes -= 1;
    await comment.save();
    await userRate.destroy();
  }
}

module.exports = new CommentService();