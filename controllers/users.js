const User = require("../models/user");

module.exports.renderSignupForm = (re, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
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
    req.flash("error", "A user with the given username is already registered");
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Traveling Agent");
  let redirectURL = res.locals.redirectUrl || "/listings";
  res.redirect(redirectURL);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you logout successfully");
    res.redirect("/listings");
  });
};
