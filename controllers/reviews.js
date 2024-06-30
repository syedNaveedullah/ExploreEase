const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
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
};

module.exports.destoryReview = async (req, res) => {
  let { id, reviewId } = req.params;
  // console.log(id,reviewId);

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted");
  res.redirect(`/listings/${id}`);
};
