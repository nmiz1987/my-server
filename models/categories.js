const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema(
    {
        categories: {
            type: Array,
            required: true,
        },
        lastUpdate: {
            type: Date,
            default: new Date(),
        },
    }
    // { strict: false }
);

module.exports = mongoose.model("category", categoriesSchema);
