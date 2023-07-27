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
    tokenCreation: {
        type: Date,
        required: false,
    },
});

module.exports = mongoose.model("users", usersSchema);
