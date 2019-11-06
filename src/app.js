const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const CALLBACK_URL = process.env.CALLBACK_URL || "http://localhost:8000/auth/google/callback";
const PASSPORT_SESSION_SECRET = process.env.PASSPORT_SESSION_SECRET || "keyboard cat";

const { getOrCreateUser } = require("./users");

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
}, async (accessToken, refreshToken, profile, cb) => {
    console.log(profile._json)
    const user = await getOrCreateUser(profile._json)
    cb(undefined, user);
}));

const app = express();

app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("express-session")({ secret: PASSPORT_SESSION_SECRET, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect("/");
    });

app.get("/", (req, res) => {
    res.send(req.user);
});

module.exports = () => {
    return app;
};