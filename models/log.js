const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    time: {
        type: Date,
        default: new Date(),
    },
    email: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("log", logSchema);
