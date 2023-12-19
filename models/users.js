const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: false,
  },
  refreshToken: {
    type: String,
    required: false,
  },
  tokenCreation: {
    type: Date,
    required: false,
  },
  userRole: {
    type: Number,
    default: 1, // 1 - guest, 2 - user, 3 - admin
  },
});

module.exports = mongoose.model("users", usersSchema);
