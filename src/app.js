const express = require("express");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const CALLBACK_URL = process.env.CALLBACK_URL || "http://localhost:8000/auth/google/callback";
const PASSPORT_SESSION_SECRET = process.env.PASSPORT_SESSION_SECRET || "keyboard cat";

const { getOrCreateUser } = require("./users");
const { Identity } = require("./identity");
const { getClient, getLocalSigner, getContractName } = require("./deploy_identity");
const { decodeHex } = require("orbs-client-sdk");
const { verifyIdOwnership } = require("./crypto");
const identity = new Identity(getClient(getLocalSigner()), getContractName());

function setup(app, passportStrategy) {
    let passportStrategyName = "google";
    const passport = require("passport");

    if (passportStrategy) {
        passport.use(passportStrategy);
        passportStrategyName = passportStrategy.name;
    } else {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
        }, async (accessToken, refreshToken, profile, cb) => {
            const user = await getOrCreateUser(profile._json);
            cb(undefined, user);
        }));
    }

    passport.serializeUser(function (user, done) {
        // only display minimal amount of information
        const { identity, name, email } = user;
        done(null, { identity, name, email });
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    // Configure view engine to render EJS templates.
    app.set("views", __dirname + "/../views");
    app.use(express.static(__dirname + "/../public"));

    app.use(require("cookie-parser")());
    app.use(require("body-parser").urlencoded({ extended: true }));
    app.use(require("body-parser").json());
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
        passport.authenticate(passportStrategyName, { scope: ["profile", "email"] }));

    app.get("/auth/google/callback",
        passport.authenticate(passportStrategyName, { failureRedirect: "/" }),
        (req, res) => {
            // Successful authentication, redirect home.
            res.redirect("/");
        });

    app.post("/identity/create",  passport.authenticate(passportStrategyName), async (req, res) => {
        try {
            if (!(req.user && req.user.identity !== "")) {
                throw new Error("user not found");
            }

            const { address, signature, publicKey } = req.body;
            const id = req.user.identity;

            if (!verifyIdOwnership(id, address, decodeHex(publicKey), decodeHex(signature))) {
                throw new Error("could not establish id ownership by the address");
            }
            await identity.registerAddress(decodeHex(address), id);
            res.send({
                status: "ok"
            });
        } catch (e) {
            res.status(500).send({
                status: e.message
            });
        }
    })

    return app;
}
module.exports = setup;