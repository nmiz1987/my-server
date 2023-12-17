const express = require("express");
const router = express.Router();
const messagesModel = require("../models/message");
const auth = require("../authenticateToken");
const logAction = require("../logAction");

// Get all messages
router.get("/", auth, async (req, res) => {
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Admin email is required` });
    }
    if (req.email !== `${process.env.ADMIN_EMAIL}` || req.email !== req.body.email) {
      return res.status(400).json({ message: `You are not authorized to see the messages.` });
    }
    const allMessages = await messagesModel.find();
    logAction(req.body.email, `Admin viewed all messages`);
    res.status(200).json(allMessages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//get one message
router.get("/:id", auth, getMessage, (req, res) => {
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Admin email is required` });
    }
    if (req.email !== `${process.env.ADMIN_EMAIL}` || req.email !== req.body.email) {
      return res.status(400).json({ message: `You are not authorized to see the message.` });
    }
    logAction(req.body.email, `Admin viewed message id ${res.message._id}`);

    res.status(200).json(res.message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//create new item
router.post("/new", async (req, res) => {
  try {
    const message = new messagesModel({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    });
    const newMessage = await message.save();
    logAction(req.body.email, `New message created by ${req.body.email}`);
    res.status(201).send(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//create new item
router.delete("/:id", auth, getMessage, async (req, res) => {
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Admin email is required` });
    }
    if (req.email !== `${process.env.ADMIN_EMAIL}` || req.email !== req.body.email) {
      return res.status(400).json({ message: `You are not authorized to delete the message.` });
    }
    const item = res.message;
    await item.remove();
    logAction(req.body.email, `Admin deleted message id ${item._id}`);
    res.status(200).send({ message: "Message deleted successfully", itemDeleted: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

async function getMessage(req, res, next) {
  let message;
  try {
    message = await messagesModel.findById(req.params.id);
    if (message == null) {
      return res.status(404).json({ message: "Cannot find message" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.message = message;
  next();
}

module.exports = router;
