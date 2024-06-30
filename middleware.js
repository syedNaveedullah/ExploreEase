const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

//middlewares
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    // console.log(req.session.redirectUrl);
    req.flash("error", "You must login before it");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "you are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//server side schema validation function (it is passed as middleware in the required route)
// For Listings
module.exports.validateListing = (req, res, next) => {
  // using joi schema validation
  let { error } = listingSchema.validate(req.body);
  // console.log(error);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //it is used to extract the msg from the error
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//server side schema validation function (it is passed as middleware in the required route)
//For Reviews
module.exports.validateReview = (req, res, next) => {
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
