const express = require("express");
const { getFirestore } = require("firebase/firestore");
const { initializeApp } = require("firebase/app");
const { auth } = require("./auth");
const { cmd } = require("./commands");
const bodyParser = require("body-parser");
const { firebaseConfig } = require("./config");

initializeApp(firebaseConfig);

const db = getFirestore();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/auth", function(req, res) {
    return auth(req, res, db);
});

app.post("/cmd", function(req, res) {
    return cmd(req, res, db);
});

app.get("/*", function(req, res) {
    return res.send("Hello <3");
});

app.get("/install", function(req, res) {
    return res.send("installation page");
});

app.get("/privacy-policy", function(req, res) {
    return res.send("privacy-policy");
});

app.get("/support", function(req, res) {
    return res.send("support");
});

app.listen(process.env.PORT, () => {});