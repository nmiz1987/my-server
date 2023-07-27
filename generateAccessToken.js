const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
}

module.exports = generateAccessToken;
