const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/models");
require('dotenv').config();
const path = require('path')
const uuid = require('uuid')
const fs = require('fs')
const asyncDeleteFile = require("../files/removeAsync");


class UserService {
  async checkCandidate(email) {
    const candidate = await User.findOne({ where: { email } });
    return candidate;
  }

  compareCryptPassword(password, hashedPassword) {
    const validate = bcrypt.compareSync(password, hashedPassword);
    return validate;
  }

  async create(username, email, hashPassword, role, files) {
    let fileName = null;
    if (files) {
      fileName = uuid.v4() + ".jpg"
      const { imgAvatar } = files;
      imgAvatar.mv(path.resolve(__dirname, "..", "static", fileName))
    }

    const user = await User.create({ username, email, password: hashPassword, role, imgAvatar: fileName });
    return user;
  }

  async cryptPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 5);
    return hashedPassword;
  }

  generateToken(id, username, email, role, fileName) {
    const token = jwt.sign({ id, username, email, role, fileName }, process.env.SECRET_KEY, { expiresIn: "24h" });
    return token
  }

  async updateUser(username, email, password, delete_img, files) {
    let fileName = null;
    const user = await User.findOne({ where: { email } });

    if (delete_img) {
      if (!user.imgAvatar) {
        return null;
      }
      await asyncDeleteFile(user.imgAvatar);
      user.imgAvatar = null;
    }

    else if (files) {
      fileName = uuid.v4() + ".jpg"
      const { imgAvatar } = files;
      imgAvatar.mv(path.resolve(__dirname, "..", "static", fileName))
    };

    user.username = username || user.username;
    let hashedPassword;
    if (password) {
      hashedPassword = await this.cryptPassword(password)
    }
    user.password = password ? hashedPassword : user.password;


    if (fileName) {
      if (user.imgAvatar) {
        await asyncDeleteFile(user.imgAvatar);
      }
      user.imgAvatar = fileName;
    }

    await user.save();
    return user;
  }


}

module.exports = new UserService();