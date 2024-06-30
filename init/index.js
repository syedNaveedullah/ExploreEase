//requring mongoose
const mongoose = require("mongoose");
//requring data for initializing from data.js file
const initdata = require("./data.js");
//requring modele named Listing in listing.js file
const Listing = require("../models/listing.js");

//connecting to data base
const MONGO_URL = "mongodb://127.0.0.1:27017/travelingAgent";
main()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

//function to insert data
const initDB = async () => {
  //empty the random data from DB
  await Listing.deleteMany({});
  //inserting data
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "667af592f5c067987acc81ad",
  }));
  await Listing.insertMany(initdata.data);
  console.log("data was initialize");
};

//calling the initdata function
initDB();
