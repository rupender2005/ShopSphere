const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    // await mongoose.connect(mongo_uri);
    const conn = await mongoose.connect(
      "mongodb+srv://rupenders546_db_user:wYkaFifkdbrxvTGJ@shop.64hcwng.mongodb.net/",
    );
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
