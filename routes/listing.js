const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing");


//server side schema validation function (it is passed as middleware in the required route)
// For Listings
const validateListing = (req, res, next)=>{
    // using joi schema validation  
      let { error } = listingSchema.validate(req.body);
      // console.log(error);
    if(error){
      let errMsg = error.details.map((el)=> el.message).join(","); //it is used to extract the msg from the error
      throw new ExpressError(400, errMsg);
    }else{
      next();
    }
}


//index route
router.get("/", wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));
  
  //new route
  router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
  });
  
  //show route
  router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
  
    res.render("listings/show.ejs", { listing });
  }));

  
  // Create Route, adding new listing to the listings
router.post(
    "/",
    validateListing,
    wrapAsync(async (req, res, next) => {
      // let {title, description, image, price, country, location} = req.body;
      // //another way
      // let newlisting = req.body;
      // console.log(newlisting);
  
      // //by simple if condition validating the listing (but it is not recomended (in place of this we can use 'Joi' npm package))
      // if(!req.body.listing){
      //   throw new ExpressError(400, "Send Valid Data for Listing")
      // }
  
      const newlisting = new Listing(req.body.listing);
      await newlisting.save();
      res.redirect("/listings");
      }
  ));
  
  //edit route
  router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    // console.log(listing);
    res.render("listings/edit.ejs", { listing });
  }));

  
  //Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    if(!req.body.listing){
      throw new ExpressError(400, "Send Valid Data for Listing")
    };
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));
  
  //delete route
  router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  }));

  //exporting router to app.js file 
  module.exports = router;