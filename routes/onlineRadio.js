const express = require("express");
const router = express.Router();
const stationsModel = require("../models/onlineRadio");
const auth = require("../authenticateToken");
const logAction = require("../logAction");

// Get all lists
router.get("/", async (req, res) => {
    try {
        const searchParams = {
            name: { $regex: new RegExp("^" + (req.query?.name || ""), "i") },
            tags: { $regex: new RegExp("^" + (req.query?.tags || ""), "i") },
            country: { $regex: new RegExp("^" + (req.query?.country || ""), "i") },
            countrycode: { $regex: new RegExp("^" + (req.query?.countrycode || ""), "i") },
            language: { $regex: new RegExp("^" + (req.query?.language || ""), "i") },
            languagecodes: { $regex: new RegExp("^" + (req.query?.languagecodes || ""), "i") },
        };
        const allStations = await stationsModel.find(searchParams).limit(9999999).sort({ votes: -1 });
        res.json(allStations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all lists with pagination
router.get("/page/", async (req, res) => {
    try {
        const searchParams = {
            name: { $regex: new RegExp("^" + (req.query?.name || ""), "i") },
            tags: { $regex: new RegExp("^" + (req.query?.tags || ""), "i") },
            country: { $regex: new RegExp("^" + (req.query?.country || ""), "i") },
            countrycode: { $regex: new RegExp("^" + (req.query?.countrycode || ""), "i") },
            language: { $regex: new RegExp("^" + (req.query?.language || ""), "i") },
            languagecodes: { $regex: new RegExp("^" + (req.query?.languagecodes || ""), "i") },
        };
        const start = req.body.start | 0;
        const size = req.body.size || 20;
        const allData = await stationsModel.find(searchParams).limit(9999999).sort({ votes: -1 });
        chunk = allData.slice(start, start + size);
        res.json(chunk);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//create new station
router.post("/new-station", auth, async (req, res) => {
    try {
        let randomUUID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const newStation = new stationsModel({
            stationuuid: randomUUID,
            name: req.body.name,
            url_resolved: req.body.url_resolved,
            favicon: req.body.favicon,
            tags: req.body.tags,
            country: req.body.country,
            countrycode: req.body.countrycode,
            language: req.body.language,
            languagecodes: req.body.languagecodes,
        });
        const tmp = await newStation.save();
        logAction(req.body.email, `New Station Created: id: ${newStation.stationuuid}, name: ${newStation.name}`);
        res.status(201).json({ message: `New Station Created` });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//get all the stations props
router.get("/generateProps", async (req, res) => {
    try {
        const allStations = await stationsModel.find();
        let props = {
            countries: [],
            languages: [],
            country_codes: [],
            languages_codes: [],
        };
        allStations.forEach((station) => {
            if (!props.countries.includes(station.country) && station.country != "") {
                props.countries.push(station.country);
            }
            if (
                !props.languages.includes(station.language) &&
                station.language != "" &&
                station.language != "1" &&
                station.language.split(",").length == 1 &&
                station.language.split("/").length == 1
            ) {
                props.languages.push(station.language);
            }
            if (!props.country_codes.includes(station.countrycode) && station.countrycode != "") {
                props.country_codes.push(station.countrycode);
            }
            if (
                !props.languages_codes.includes(station.languagecodes) &&
                station.languagecodes != "" &&
                station.languagecodes.split(",").length == 1
            ) {
                props.languages_codes.push(station.languagecodes);
            }
        });
        props.countries.sort();
        props.languages.sort();
        props.country_codes.sort();
        props.languages_codes.sort();
        res.json(props);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/:id", auth, getStation, async (req, res) => {
    try {
        const item = res.station;
        if (req.body.name != null) {
            item.name = req.body.name;
        }
        if (req.body.url_resolved != null) {
            item.url_resolved = req.body.url_resolved;
        }
        if (req.body.favicon != null) {
            item.favicon = req.body.favicon;
        }
        if (req.body.tags != null) {
            item.tags = req.body.tags;
        }
        if (req.body.country != null) {
            item.country = req.body.country;
        }
        if (req.body.countrycode != null) {
            item.countrycode = req.body.countrycode;
        }
        if (req.body.language != null) {
            item.language = req.body.language;
        }
        if (req.body.languagecodes != null) {
            item.languagecodes = req.body.languagecodes;
        }
        await item.save();
        logAction(req.body.email, `Station updated: id: ${item.stationuuid}, name: ${item.name}`);
        res.status(200).json({ message: "Station updated successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post("/updateDB", auth, async (req, res) => {
    try {
        if (req.body.email === undefined) {
            return res.status(400).json({ message: `Admin email is required` });
        }
        if (res.email !== process.env.ADMIN_EMAIL || res.email !== req.body.email) {
            return res.status(400).json({ message: `You are not authorized to update the DB.` });
        }
        const apiRes = await fetch(
            "https://de1.api.radio-browser.info/json/stations/search?hidebroken=true&order=clickcount&reverse=true"
        );
        let counter = 0;
        const data = await apiRes.json();
        if (data.length == 0) throw new Error("No data received from radio-browser.info, update failed.");
        console.log("deleting all radio-browser.info DB...");
        await stationsModel.deleteMany({ source: "https://www.radio-browser.info/" });
        console.log("All the radio-browser.info DB deleted! Updating.");
        data.forEach(async (item) => {
            let station = new stationsModel({
                name: item.name,
                stationuuid: item.stationuuid,
                url_resolved: item.url_resolved,
                favicon: item.favicon,
                tags: item.tags,
                country: item.country,
                countrycode: item.countrycode,
                language: item.language,
                languagecodes: item.languagecodes,
                votes: item.votes,
                source: "https://www.radio-browser.info/",
            });
            await station.save();

            counter++;
            console.log(counter, data.length, data.length - counter);
        });
        logAction(req.body.email, `Admin updated the DB with ${data.length} stations`);
        res.status(201).json({ message: `DB updated with ${data.length} stations` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//delete item
router.delete("/:id", auth, getStation, async (req, res) => {
    try {
        if (req.body.email === undefined) {
            return res.status(400).json({ message: `Admin email is required` });
        }
        if (res.email !== process.env.ADMIN_EMAIL || res.email !== req.body.email) {
            return res.status(400).json({ message: `You are not authorized to delete the station.` });
        }
        const item = res.message;
        await item.remove();
        logAction(req.body.email, `Admin deleted station: id: ${item.stationuuid}, name: ${item.name}`);
        res.status(200).send({ message: "Message deleted successfully", itemDeleted: item });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Deleting all DB
router.delete("/superDeletion", auth, async (req, res) => {
    try {
        if (req.body.email === undefined) {
            return res.status(400).json({ message: `Admin email is required` });
        }
        if (res.email !== process.env.ADMIN_EMAIL || res.email !== req.body.email) {
            return res.status(400).json({ message: `You are not authorized to delete the DB.` });
        }
        console.log("deleting all DB...");
        await stationsModel.deleteMany({});
        logAction(req.body.email, `Admin deleted all the online radio DB`);
        res.json({ message: "All the DB deleted!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

async function getStation(req, res, next) {
    let station;
    try {
        station = await stationsModel.findById(req.params.id);
        if (message == null) {
            return res.status(404).json({ message: `Cannot find message id ${req.params.id}` });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.station = station;
    next();
}

module.exports = router;
