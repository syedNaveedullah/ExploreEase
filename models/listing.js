const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");
const { string } = require("joi");

//this default img is used for demo at dev stage
// const default_img =
//   "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// schema
const listingSchema = new Schema({
  //for title
  title: {
    type: String,
    required: true,
  },
  //for description
  description: String,
  // for image
  image: {
    //this default img logic is used for demo at dev stage
    // type: String,
    // default: default_img,
    // set: (v) => (v === "" ? default_img : v),
    url: String,
    filename: String,
  },

  // for price
  price: Number,
  // for location
  location: String,
  // for country
  country: String,
  // for reviews
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  // for owner
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // for coordinates
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

//middleware
//handling Deletion
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

// defining model
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
