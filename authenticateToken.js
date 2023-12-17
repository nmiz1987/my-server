const jwt = require("jsonwebtoken");
const usersModel = require("./models/users");

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token === undefined) {
      return res.status(401).json({ message: "Token is required" });
    }
    jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, async (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      } else {
        const user = await usersModel.findOne({ accessToken: token });
        if (user === null) {
          return res.status(403).json({ message: "Access denied" });
        }
        req.email = user.email;
        next();
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = authenticateToken;
