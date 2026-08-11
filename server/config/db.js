const mongoose = require("mongoose");

const mongo_uri =
  process.env.MONGO_URI || "mongodb://localhost:27017/ShopSphere";

const connectDB = async () => {
  try {
    // await mongoose.connect(mongo_uri);
    const conn = await mongoose.connect(mongo_uri);
    console.log("MongoDB Connected!");
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.log("Error in Server > config > db.js", error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
};
