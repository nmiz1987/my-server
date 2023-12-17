const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(user, `${process.env.ACCESS_TOKEN_SECRET}`, `${process.env.TOKEN_EXPIRES_IN}`, { expiresIn: process.env.TOKEN_EXPIRES_IN });
}

function generateRefreshToken(user) {
  return jwt.sign(user, `${process.env.REFRESH_TOKEN_SECRET}`);
}

module.exports = {
  generateAccessToken: generateAccessToken,
  generateRefreshToken: generateRefreshToken,
};
