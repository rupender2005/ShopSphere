const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleIdToken = async (
  idToken,
  audience = process.env.GOOGLE_CLIENT_ID,
) => {
  try {
    if (!idToken) {
      throw new Error("Google ID token is required.");
    }

    if (!audience) {
      throw new Error("GOOGLE_CLIENT_ID is missing from server/.env.");
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Google token payload is missing.");
    }

    if (!payload.sub) {
      throw new Error("Google account ID is missing.");
    }

    if (!payload.email) {
      throw new Error("Google email is missing.");
    }

    if (payload.email_verified !== true) {
      throw new Error("Google email is not verified.");
    }

    return payload;
  } catch (error) {
    console.error(
      "Error in server > utils > google > verifyGoogleToken:",
      error.message,
    );

    throw new Error(error.message || "Google token verification failed.");
  }
};

module.exports = {
  verifyGoogleIdToken,
};
