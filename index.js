require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");
const bcrypt = require("bcrypt");
const usersModel = require("./models/users");
const app = express();
const port = process.env.PORT || 5000;
const auth = require("./authenticateToken");
const jwt = require("jsonwebtoken");

const { generateAccessToken, generateRefreshToken } = require("./generateAccessToken.js");

const logAction = require("./logAction.js");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(`${process.env.DATABASE_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to DataBase"));

app.get("/login-with-token", auth, async (req, res) => {
  try {
    const user = await usersModel.findOne({ email: req.email });
    if (user === null) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "success login", accessToken: user.accessToken, refreshToken: user.refreshToken, email: user.email });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
});

app.get("/refresh-token", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const refreshTkn = authHeader && authHeader.split(" ")[1];
    if (refreshTkn === undefined) {
      return res.status(400).json({ message: `Refresh token is required` });
    }
    const user = await usersModel.findOne({ refreshToken: refreshTkn });
    if (user === null) {
      return res.status(400).json({ message: "User not found" });
    }

    jwt.verify(refreshTkn, `${process.env.REFRESH_TOKEN_SECRET}`, async (err, _) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
      } else {
        const accessToken = generateAccessToken({ email: user.email.toLowerCase() });
        user.accessToken = accessToken;
        user.tokenCreation = new Date();
        await user.save();
        logAction(user.email.toLowerCase(), "Token refreshed");
        res.status(200).json({ message: "generate new token", accessToken: accessToken });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//create new user
app.post("/signup", async (req, res) => {
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
    const user = await usersModel.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: `Email ${req.body.email.toLowerCase()} is already been used` });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const accessToken = generateAccessToken({ email: req.body.email.toLowerCase() });
    const refreshToken = generateRefreshToken({ email: req.body.email.toLowerCase() });

    const newUser = new usersModel({
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenCreation: new Date(),
    });
    await newUser.save();
    logAction(req.body.email.toLowerCase(), "User created");
    res.status(201).json({ message: "User created", accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("!!!");
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Email is required` });
    }
    if (req.body.password === undefined) {
      return res.status(400).json({ message: `Password is required` });
    }
    if (req.body.password.length < 8) {
      return res.status(400).json({ message: `Password must be at least 8 characters` });
    }
    const user = await usersModel.findOne({ email: req.body.email.toLowerCase() });
    if (user == null) {
      return res.status(400).json({ message: "User or password is incorrect" });
    }
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken({ email: req.body.email.toLowerCase() });
      const refreshToken = generateRefreshToken({ email: req.body.email.toLowerCase() });
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.tokenCreation = new Date();
      await user.save();
      logAction(req.body.email.toLowerCase(), "User logged in");
      res.status(200).json({ message: "success login", accessToken: accessToken, refreshToken: refreshToken });
    } else {
      res.status(400).json({ message: "Wrong password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/logout", auth, async (req, res) => {
  try {
    if (req.body.email === undefined) {
      return res.status(400).json({ message: `Email is required` });
    }
    const user = await usersModel.findOne({ email: req.body.email.toLowerCase() });
    if (user == null) {
      return res.status(400).json({ message: "User not found" });
    }
    if (req.email !== req.body.email) {
      return res.status(400).json({ message: `You are not who I thought you are.` });
    }
    user.accessToken = undefined;
    user.tokenCreation = undefined;
    user.refreshToken = undefined;
    await user.save();
    logAction(req.body.email.toLowerCase(), "User logged out");
    res.status(204).json({ message: "User logged out successfully" });
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

const fakerRouter = require("./routes/faker");
app.use("/faker", fakerRouter);

app.listen(port, () => {
  console.log(`Server Started at port ${port}`);
});
