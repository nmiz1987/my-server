const mongoose = require("mongoose");

const workHoursSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    startUpdate: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: false,
    },
    endUpdate: {
        type: Date,
        required: false,
    },
});

module.exports = mongoose.model("workHours", workHoursSchema);
