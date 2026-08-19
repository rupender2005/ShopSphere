const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected!");
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("Error in server > config > db:", error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
};
