const jwt = require("jsonwebtoken");

const generateJWTToken = (data) => {
  return jwt.sign(
    {
      userId: data._id,
      role: data.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

module.exports = {
  generateJWTToken,
};
