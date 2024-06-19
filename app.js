const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/travelingAgent";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

//requiring routes files
const listing = require("./routes/listing.js");
const reviews = require("./routes/review.js");


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

//=====================making connection with DB======================================
main()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

//calling main to connect with DB
async function main() {
  await mongoose.connect(MONGO_URL);
}

//=========================starting server==============================================
app.listen(8080, () => {
  console.log("server is running on port : 8080");
});


//===============Routes middleware====================================================
app.use("/listings", listing);
app.use("/listings/:id/reviews", reviews);


//route for all incorrect route request------------------------------
app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "Page Not Found"));
});


// error handling middlewares----------------------------------------
app.use((err, req, res, next) => {
    let { statusCode=500, message="Something went wrong" } = err;
  // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs", { message });
});
