const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");

//server side schema validation function (it is passed as middleware in the required route)
//For Reviews
const validateReview = (req, res, next) => {
  // using joi schema validation
  let { error } = reviewSchema.validate(req.body);
  // console.log(error);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //it is used to extract the msg from the error
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//REVIEW ROUTE----=======================================================================
//Post review route (creating)
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    // let {id} = req.params;
    // console.log(id);

    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.reviews);
    // console.log(newReview);

    listing.reviews.push(newReview);

    await listing.save();
    await newReview.save();

    // console.log(newReview);
    // console.log(listing);

    res.redirect(`/listings/${listing._id}`);
  })
);

//Delete review route--------------
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    // console.log(id,reviewId);

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

//exporting router to app.js file
module.exports = router;
