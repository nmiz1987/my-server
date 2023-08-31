require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");
const bcrypt = require("bcrypt");
const usersModel = require("./models/users");
const app = express();
const port = process.env.PORT || 5000;

const generateAccessToken = require("./generateAccessToken.js");
const logAction = require("./logAction.js");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to DataBase"));

//create new user
app.post("/singup", async (req, res) => {
  console.log(req);
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Email is required` });
    }
    if (req.body.password === undefined) {
      return res.status(400).json({ message: `Password is required` });
    }
    if (req.body.password.length < 8) {
      return res.status(400).json({ message: `Password must be at least 8 characters` });
    }
    const user = await usersModel.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: `Email ${req.body.email} is already been used` });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const accessToken = generateAccessToken({ email: req.body.email });
    const newUser = new usersModel({
      email: req.body.email,
      password: hashedPassword,
      accessToken: accessToken,
      tokenCreation: new Date(),
    });
    await newUser.save();
    logAction(req.body.email, "User created");
    res.status(201).json({ message: "User created", token: accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Email is required` });
    }
    if (req.body.password === undefined) {
      return res.status(400).json({ message: `Password is required` });
    }
    if (req.body.password.length < 8) {
      return res.status(400).json({ message: `Password must be at least 8 characters` });
    }
    const user = await usersModel.findOne({ email: req.body.email });
    if (user == null) {
      return res.status(400).json({ message: "User not found" });
    }
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken({ email: req.body.email });
      user.accessToken = accessToken;
      user.tokenCreation = new Date();
      await user.save();
      logAction(req.body.email, "User logged in");
      res.json({ accessToken: accessToken });
    } else {
      res.status(400).json({ message: "Wrong password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/logout", async (req, res) => {
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Email is required` });
    }
    if (req.body.password === undefined) {
      return res.status(400).json({ message: `Password is required` });
    }
    const user = await usersModel.findOne({ email: req.body.email });
    if (user == null) {
      return res.status(400).json({ message: "User not found" });
    }
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.accessToken = undefined;
      user.tokenCreation = undefined;
      await user.save();
      logAction(req.body.email, "User logged out");

      res.status(200).json({ message: "User logged out successfully" });
    } else {
      res.status(400).json({ message: "Wrong password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/", async (req, res) => {
  try {
    res.json({ message: "Welcome to My Links API 😀" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const messagesRouter = require("./routes/messages");
app.use("/messages", messagesRouter);

const categoriesRouter = require("./routes/categories");
app.use("/useful-links/categories", categoriesRouter);

const linksRouter = require("./routes/links");
app.use("/useful-links", linksRouter);

const radioRouter = require("./routes/onlineRadio");
app.use("/online-radio", radioRouter);

app.listen(port, () => {
  console.log(`Server Started at port ${port}`);
});
