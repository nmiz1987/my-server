const express = require("express");
const router = express.Router();
const workHoursModel = require("../models/workHours");
const auth = require("../authenticateToken");
const logAction = require("../logAction");

// Get all list of work hours
router.get("/", auth, getAllDaysByToken, async (req, res) => {
  try {
    res.json(res.work);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//get work hours by date
router.get("/getHoursByDate/", auth, getOneDayByToken, async (req, res) => {
  try {
    res.json(res.work);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//create new work hours
router.post("/new-entrance", auth, async (req, res) => {
  try {
    const newHours = new workHoursModel({
      email: req.email,
      date: req.body.date,
      startTime: req.body.startTime,
      startUpdate: new Date(),
    });
    const tmp = await newHours.save();
    logAction(req.body.email, `New work hours created: email: ${newHours.email}, date: ${newHours.date}, startTime: ${newHours.startTime}`);
    res.status(201).json({ message: `New work hours created` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/exit", auth, getOneDayByToken, async (req, res) => {
  try {
    if (req.body.endTime === undefined) {
      return res.status(400).json({ message: `End time is required` });
    }

    if (req.body.email != null) {
      res.work.email = req.body.email;
    }
    if (req.body.date != null) {
      res.work.date = req.body.date;
    }
    if (req.body.startTime != null) {
      res.work.startTime = req.body.startTime;
    }
    if (req.body.startUpdate != null) {
      res.work.startUpdate = req.body.startUpdate;
    }
    if (req.body.endTime != null) {
      res.work.endTime = req.body.endTime;
    }
    if (req.body.endUpdate != null) {
      res.work.endUpdate = new Date();
    }
    await res.work.save();
    logAction(req.body.email, `work hours updated: date: ${item.date}`);
    res.status(200).json({ message: "work hours updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Deleting all DB
router.delete("/superDeletion", auth, async (req, res) => {
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Admin email is required` });
    }
    if (req.email !== process.env.ADMIN_EMAIL || req.email !== req.body.email) {
      return res.status(400).json({ message: `You are not authorized to delete the DB.` });
    }
    console.log("deleting all DB...");
    await workHoursModel.deleteMany({});
    logAction(req.body.email, `Admin deleted all the online work hours DB`);
    res.json({ message: "All the DB deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getAllDaysByToken(req, res, next) {
  let work;
  try {
    work = await workHoursModel.find({ email: req.email });
    if (work == null) {
      return res.status(404).json({ message: `Cannot find work hours for email ${req.email}` });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.work = work;
  next();
}

async function getOneDayByToken(req, res, next) {
  if (req.body.date === undefined) {
    return res.status(400).json({ message: `Date is required` });
  }

  let work;
  try {
    work = await workHoursModel.findOne({ email: req.email, date: req.body.date });
    if (work == null) {
      return res.status(404).json({ message: `Cannot find work day for email ${req.email}, date ${req.body.date}` });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.work = work;
  next();
}

module.exports = router;
