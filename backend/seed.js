// Run once:  npm run seed
// Creates the first Warden and Mess Admin accounts
const mongoose = require("mongoose");
require("dotenv").config();
const { User } = require("./models");

const users = [
  { name: "Warden", email: "warden@hostel.com", password: "123456", role: "warden", mobile: "9999999999" },
  { name: "Mess Admin", email: "mess@hostel.com", password: "123456", role: "messadmin", mobile: "8888888888" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(u.email + " already exists");
      } else {
        await User.create(u);
        console.log(u.email + " created");
      }
    }
  } catch (error) {
    console.log("Seed failed: " + error.message);
  }
  process.exit();
};

seed();
