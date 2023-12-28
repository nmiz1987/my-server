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
            //array of string
            type: Array,
            required: true,
        },
        recommended: {
            type: Boolean,
            required: true,
        },
        tags: {
            type: Array,
            required: true,
        },
        imgSrc: {
            type: String,
            required: true,
        },
    }
    // { strict: false }
);

module.exports = mongoose.model("link", linkSchema);
