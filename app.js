if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// local mongoDB connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/travelingAgent";
// mongoDB Atlas Cloud DB
const atlasDB_url = process.env.ATLASDB_URL;
// connecting views path
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//requiring routes files
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//========================middle wares=====================================================
//setting view engine
app.set("view engine", "ejs");
//joining to path for views folder
app.set("views", path.join(__dirname, "views"));
//for parsing req body
app.use(express.urlencoded({ extended: true }));
//mehtod override
app.use(methodOverride("_method"));
// use ejs-locals for all ejs templates:
app.engine("ejs", ejsMate);
//public folder
app.use(express.static(path.join(__dirname, "/public")));

// MongoDB session store
const store = MongoStore.create({
  mongoUrl: atlasDB_url,
  crypto: {
    secret: "mysupersecretkey",
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("error in mongo session store", err);
});
//express sessions
let sessionOptions = {
  store,
  secret: "mysupersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 + 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
// connect-flash
app.use(flash());

// for passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// it save data in session and delete
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash local variabls
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//=====================making connection with DB======================================
main()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

//calling main to connect with DB
async function main() {
  await mongoose.connect(atlasDB_url);
}

//=========================starting server==============================================
const port = 8080;
app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
  console.log(`http://localhost:${port}/`);
});

// =========Testing Routes=====================================================
app.get("/register", async (req, res) => {
  // creating demo user
  let fakeuser = new User({
    email: "student@gmail.com",
    username: "WebBees-student",
  });

  let newuser = await User.register(fakeuser, "hello123");
  res.send(newuser);
});

// root route
app.get("/", (req, res) => {
  res.render("listings/rootPage.ejs");
});

//===============Routes middleware====================================================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

//route for all incorrect route request------------------------------
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// error handling middlewares----------------------------------------
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listings/error.ejs", { message });
});
