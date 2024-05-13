const express = require("express");////////////
const app = express();///////////
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/travelingAgent";
const Listing = require("./models/listing");//////////
const path = require("path");
const methodOverride = require("method-override");///////////
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");///////////
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const listing = require("./routes/listing.js")


//meddle wares=====================================================
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

//making connection with DB======================================
main()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

//starting server==============================================
app.listen(8080, () => {
  console.log("server is running on port : 8080");
});

//server side schema validation function (it is passed as middleware in the required route)
//For Reviews
const validateReview = (req, res, next)=>{
  // using joi schema validation  
    let { error } = reviewSchema.validate(req.body);
    // console.log(error);
  if(error){
    let errMsg = error.details.map((el)=> el.message).join(","); //it is used to extract the msg from the error
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
}

//listing Routes middleware====================================================
app.use("/listings", listing);


//Routs========================================================

//root testing route
app.get("/", (req, res) => {
  res.send("root is working");
});

// testing route
app.get("/testlisting", wrapAsync ( async (req, res) => {
  let sampleListing = new Listing({
    title: "My new Villa",
    description: "by the beach",
    price: 12000,
    location: "calangute Goa",
    country: "India",
  });

  await sampleListing.save();
  console.log("sample was saved");

  res.send("testing successful");
}));



//REVIEW ROUTE----=======================================================================
//Post review route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req,res)=>{
  // let {id} = req.params;
  // console.log(id);

  let listing = await Listing.findById(req.params.id);
  
  let newReview = new Review(req.body.reviews);
  
  listing.reviews.push(newReview);
  
  await listing.save();
  await newReview.save();
  
  // console.log(newReview);
  // console.log(listing);

  res.redirect(`/listings/${listing._id}`);
}));


//Delete review route--------------
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
  let { id, reviewId} = req.params;
  
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});

  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);

}));


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
