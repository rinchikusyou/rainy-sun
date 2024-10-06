const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/models");
require("dotenv").config();

class UserService {
  async checkCandidate(email) {
    const candidate = await User.findOne({ where: { email } });
    return candidate;
  }

  async getUser(id) {
    const user = await User.findOne({
      where: { id },
      attributes: { exclude: ["password", "createdAt", "updatedAt", "role"] },
    });
    return user;
  }

  compareCryptPassword(password, hashedPassword) {
    const validate = bcrypt.compareSync(password, hashedPassword);
    return validate;
  }

  async create(username, email, hashPassword, role) {
    const user = await User.create({
      username,
      email,
      password: hashPassword,
    });
    return user;
  }

  async cryptPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 5);
    return hashedPassword;
  }

  generateToken(id, username, email, role, fileName) {
    const token = jwt.sign(
      { id, username, email, role, fileName },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    return token;
  }
}

module.exports = new UserService();
