const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const default_img =
  "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // schema
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default: default_img,
    set: (v) => (v === "" ? default_img : v),
  },

  price: Number,
  location: String,
  country: String,

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ]
});

//middleware
//handling Deletion
listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews }});
  }
})

// defining model
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;