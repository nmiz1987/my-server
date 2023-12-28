const express = require("express");
const router = express.Router();
const linkModel = require("../models/link");
const categoriesModel = require("../models/categories");
const auth = require("../authenticateToken");
const logAction = require("../logAction");

// Get all links
router.get("/", async (req, res) => {
  try {
    const limitRecommended = req.query?.recommended && { recommended: req.query?.recommended };
    const searchParams = {
      category: { $regex: new RegExp("^" + (req.query?.category || ""), "i") },
      name: { $regex: new RegExp("^" + (req.query?.name || ""), "i") },
      description: { $regex: new RegExp("^" + (req.query?.description || ""), "i") },
      ...limitRecommended,
    };
    const links = await linkModel.find(searchParams).sort({ category: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//get one link
router.get("/:id", getLink, (req, res) => {
  res.json(res.item);
});

//create new link
router.post("/new-link", auth, async (req, res) => {
  try {
    const item = new linkModel({
      category: req.body.category,
      name: req.body.name,
      description: req.body.description,
      link: req.body.link,
      recommended: req.body.recommended,
      tags: req.body.tags.split(" "),
      imgSrc: req.body.imgSrc,
    });
    const newItem = await item.save();
    logAction(`${req.body.email} add new link`);
    updateCategories(); // update categories DB
    res.status(201).send(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/updateItem/:id", auth, getLink, async (req, res) => {
  try {
    const item = res.link;
    if (req.body.category != null) {
      item.category = req.body.category;
    }
    if (req.body.name != null) {
      item.name = req.body.name;
    }
    if (req.body.description != null) {
      item.description = req.body.description;
    }
    if (req.body.link != null) {
      item.link = req.body.link;
    }
    if (req.body.recommended != null) {
      item.recommended = req.body.recommended;
    }
    if (req.body.imgSrc != null) {
      item.imgSrc = req.body.imgSrc;
    }
    await item.save();
    logAction(req.body.email, `Link id ${res.link._id} updated`);
    res.status(200).json({ message: "Link updated successfully" });
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
    if (req.email !== `${process.env.ADMIN_EMAIL}` || req.email !== req.body.email) {
      return res.status(400).json({ message: `You are not authorized to delete the DB.` });
    }
    console.log("deleting all DB...");
    await linkModel.deleteMany({});
    logAction(req.body.email, `All the links DB deleted`);
    res.json({ message: "All the DB deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function updateCategories() {
  try {
    let tmp = [];
    const arr = await linkModel.find();
    arr.forEach((item) => tmp.push(item.category));
    tmp = Array.from(new Set(tmp)); // remove duplicate
    const item = new categoriesModel({ categories: tmp });
    console.log(item);
    await categoriesModel.deleteMany({}); //drop old data
    await item.save();
  } catch (err) {
    console.log({ title: "updateCategories failed", message: err });
  }
}

async function getLink(req, res, next) {
  let link;
  try {
    link = await linkModel.findById(req.params.id);
    if (link == null) {
      return res.status(404).json({ message: `Cannot find link id ${req.params.id}` });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.link = link;
  next();
}

module.exports = router;
