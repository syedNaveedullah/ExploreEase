const express = require("express");
const router = express.Router();
let User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usersController = require("../controllers/users.js");

// routes==================
//signup form rendering
router.get("/signup", usersController.renderSignupForm);

//signing-up
router.post("/signup", wrapAsync(usersController.signup));

//login form rendering
router.get("/login", usersController.renderLoginForm);

//login
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  usersController.login
);

//logout
router.get("/logout", usersController.logout);

module.exports = router;
