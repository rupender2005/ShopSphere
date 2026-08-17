const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client();

const verifyGoogleToken = async (credential) => {
  try {
    if (!credential) {
      throw new Error("Google credential is required");
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured on the server");
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Google token payload is missing");
    }

    if (!payload.sub || !payload.email) {
      throw new Error("Google account information is incomplete");
    }

    if (payload.email_verified !== true) {
      throw new Error("Google email is not verified");
    }

    return {
      googleId: payload.sub,
      email: payload.email.trim().toLowerCase(),
      name: payload.name || payload.email.split("@")[0],
      avatar: payload.picture || "",
    };
  } catch (error) {
    console.error(
      "Error in server > utils > google > verifyGoogleToken:",
      error,
    );

    throw new Error(error.message || "Google authentication failed");
  }
};

module.exports = {
  verifyGoogleToken,
};
