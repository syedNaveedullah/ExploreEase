const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const { validateReview, isLoggedIn, isAuthor } = require("../middleware.js");

//REVIEW ROUTE----=======================================================================
//Post review route (creating)
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    // let {id} = req.params;
    // console.log(id);

    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.reviews);
    newReview.author = req.user._id;
    // console.log(newReview);

    listing.reviews.push(newReview);

    await listing.save();
    await newReview.save();

    req.flash("success", "New Review Added");
    // console.log(newReview);
    // console.log(listing);

    res.redirect(`/listings/${listing._id}`);
  })
);

//Delete review route--------------
router.delete(
  "/:reviewId",
  isLoggedIn,
  isAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    // console.log(id,reviewId);

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
  })
);

//exporting router to app.js file
module.exports = router;
