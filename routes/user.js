const express = require("express");
const router = express.Router();
let User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// routes==================
//signup form rendering
router.get("/signup", (re, res) => {
  res.render("users/signup.ejs");
});

//signing-up
router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      let { username, email, password } = req.body;
      // console.log(username, email, password);
      let newUser = new User({ email, username });
      let registeredUser = await User.register(newUser, password);
      // console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Traveling Agent");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash(
        "error",
        "A user with the given username is already registered"
      );
      res.redirect("/signup");
    }
  })
);

//login form rendering
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

//login
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back to Traveling Agent");
    let redirectURL = res.locals.redirectUrl || "/listings";
    res.redirect(redirectURL);
  }
);

//logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you logout successfully");
    res.redirect("/listings");
  });
});

module.exports = router;
