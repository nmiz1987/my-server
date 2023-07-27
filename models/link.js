const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: true,
        },
        recommended: {
            type: Boolean,
            required: true,
        },
        tags: {
            type: Array,
            required: false,
        },
        imgSrc: {
            type: String,
            required: false,
        },
    }
    // { strict: false }
);

module.exports = mongoose.model("link", linkSchema);
