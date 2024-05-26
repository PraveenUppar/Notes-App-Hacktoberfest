require("dotenv").config();

const config = require("./config.json")
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/userModel");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticationToken } = require("./utilities");
const userModel = require("./models/userModel");

app.use(express.json());

app.use(
    cors({
        origin: "*"
    })
);

app.get("/", (req, res) => {
    res.json({ data: "hello" });
});

// create account 
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName) {
        return res
            .status(400)
            .json({ error: true, message: "Please enter your full name" });
    }

    if (!email) {
        return res.status(400).json({ error: true, message: "Please enter your email" });
    }

    if (!password) {
        return res.status(400).json({ error: true, message: "Please enter your password" });
    }

    const isUser = await User.findOne({ email: email });

    if (isUser) {
        return res.json({
            error: true,
            message: "User already exists",
        })
    }

    const user = new User({
        fullName,
        email,
        password
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "360000m"
    });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Account created successfully",
    })

})

// login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: true, message: "Please enter your email" });
    }

    if (!password) {
        return res.status(400).json({ error: true, message: "Please enter your password" });
    }

    const userInfo = await User.findOne({ email: email })

    if (!userInfo) {
        return res.status(400).json({ message: "User not found" })
    }

    if (userInfo.email == email && userInfo.password == password) {
        const user = { user: userInfo }
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m"
        });

        return res.json({
            error: false,
            message: "Login successful",
            email,
            accessToken
        });
    } else {
        return res.status(400).json({
            error: true,
            message: "Invalid credentials",
        })
    }

})

// add note

app.listen(8000);

module.exports = app;