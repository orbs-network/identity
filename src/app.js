const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const CALLBACK_URL = process.env.CALLBACK_URL || "http://localhost:8000/auth/google/callback";
const PASSPORT_SESSION_SECRET = process.env.PASSPORT_SESSION_SECRET || "keyboard cat";

const { getOrCreateUser } = require("./users");

passport.serializeUser(function (user, done) {
    // only display minimal amount of information
    const { identity, name, email } = user;

    done(null, { identity, name, email });
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
}, async (accessToken, refreshToken, profile, cb) => {
    const user = await getOrCreateUser(profile._json);
    console.log(user);

    cb(undefined, user);
}));

function setup(app) {
    // Configure view engine to render EJS templates.
    app.set("views", __dirname + "/../views");
    app.use(express.static(__dirname + "/../public"));

    app.use(require("cookie-parser")());
    app.use(require("body-parser").urlencoded({ extended: true }));
    app.use(require("express-session")({ secret: PASSPORT_SESSION_SECRET, resave: true, saveUninitialized: true }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.get("/auth/user", (req, res) => {
        const user = req.user || {
            status: "user not found",
        };
        res.send(user);
    });

    app.get("/auth/google",
        passport.authenticate("google", { scope: ["profile", "email"] }));

    app.get("/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/login" }),
        (req, res) => {
            // Successful authentication, redirect home.
            res.redirect("/");
        });

    return app;
}
module.exports = setup;