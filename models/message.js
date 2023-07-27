const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        message: {
            type: String,
        },
        createdDate: {
            type: Date,
            default: new Date(),
        },
    }
    // { strict: false }
);

module.exports = mongoose.model("message", messageSchema);
