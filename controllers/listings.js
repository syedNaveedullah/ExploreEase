const Listing = require("../models/listing");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

//index route
module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

//new route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

//show route
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you want to access does not exists!!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// Create Route, adding new listing to the listings=================================
module.exports.createListing = async (req, res, next) => {
  // let {title, description, image, price, country, location} = req.body;
  // //another way
  // let newlisting = req.body;
  // console.log(newlisting);

  // //by simple if condition validating the listing (but it is not recomended (in place of this we can use 'Joi' npm package))
  // if(!req.body.listing){
  //   throw new ExpressError(400, "Send Valid Data for Listing")
  // }

  // extracting map coordinates
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // console.log(response.body.features[0].geometry);

  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(url, "...", filename);
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  newlisting.geometry = response.body.features[0].geometry;
  let savedListing = await newlisting.save();
  // console.log(savedListing);
  req.flash("success", "New Listing Created!!!");
  res.redirect("/listings");
};

//edit route
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  // console.log(listing);
  if (!listing) {
    req.flash("error", "Listing you want to access does not exists!!");
    res.redirect("/listings");
  }
  // image preview using cloudinery height & width
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

//Update Route
module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send Valid Data for Listing");
  }
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated Successfully!!");
  res.redirect(`/listings/${id}`);
};

//delete route
module.exports.destoryListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  req.flash("success", "Listing Deleted Successfully!!");
  res.redirect("/listings");
};
