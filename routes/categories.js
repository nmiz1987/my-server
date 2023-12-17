const express = require("express");
const router = express.Router();
const categoriesModel = require("../models/categories");
const auth = require("../authenticateToken");

// Get all lists
router.get("/", async (req, res) => {
  try {
    const items = await categoriesModel.find();
    res.json(items);
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
    if (req.email !== `${process.env.ADMIN_EMAIL}` || req.email !== req.body.email) {
      return res.status(400).json({ message: `You are not authorized to delete the DB.` });
    }
    console.log("deleting all DB...");
    await categoriesModel.deleteMany({});
    logAction(req.body.email, "All the catagories DB deleted");
    res.json({ message: "All the DB deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
