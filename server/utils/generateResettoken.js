const crypto = require("crypto");

// Generates a random token to email/return to the user (rawToken),
// and a hashed version to store in the DB (hashedToken).
// We never store the raw token — same principle as never storing a plain password.
const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  return { rawToken, hashedToken, expiry };
};

module.exports = {
  generateResetToken,
};
