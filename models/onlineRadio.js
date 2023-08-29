const mongoose = require("mongoose");

const onlineRadioSchema = new mongoose.Schema({
    stationuuid: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    url_resolved: {
        type: String,
        required: false,
    },
    favicon: {
        type: String,
        required: false,
    },
    tags: {
        type: String,
        required: false,
    },
    country: {
        type: String,
        required: false,
    },
    countrycode: {
        type: String,
        required: false,
    },
    language: {
        type: String,
        required: false,
    },
    languagecodes: {
        type: String,
        required: false,
    },
    source: {
        type: String,
        required: true,
        default: "manual",
    },
    votes: {
        type: Number,
        required: false,
    },
});

module.exports = mongoose.model("onlineRadio", onlineRadioSchema);
