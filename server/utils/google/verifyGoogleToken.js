const crypto = require("crypto");
const https = require("https");

let cachedCerts = null;
let cachedExpiresAt = 0;

const fetchGoogleCerts = () =>
  new Promise((resolve, reject) => {
    https
      .get("https://www.googleapis.com/oauth2/v3/certs", (response) => {
        let data = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Google certificate request failed with status ${response.statusCode}`));
            return;
          }

          try {
            const parsed = JSON.parse(data);
            cachedCerts = parsed.keys || {};
            const maxAge = /max-age=(\d+)/i.exec(response.headers["cache-control"] || "");
            const ttl = maxAge ? Number(maxAge[1]) * 1000 : 60 * 60 * 1000;
            cachedExpiresAt = Date.now() + ttl;
            resolve(cachedCerts);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });

const getCertificates = async () => {
  if (cachedCerts && Date.now() < cachedExpiresAt) return cachedCerts;
  return fetchGoogleCerts();
};

const base64UrlToBuffer = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized + "=".repeat((4 - (normalized.length % 4)) % 4), "base64");
};

const verifyGoogleIdToken = async (idToken, audience) => {
  if (!idToken || !audience) throw new Error("Google authentication is not configured.");

  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid Google ID token.");

  const header = JSON.parse(base64UrlToBuffer(parts[0]).toString("utf8"));
  const payload = JSON.parse(base64UrlToBuffer(parts[1]).toString("utf8"));

  if (header.alg !== "RS256" || !header.kid) throw new Error("Invalid Google ID token algorithm.");
  if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)) {
    throw new Error("Invalid Google ID token issuer.");
  }
  if (payload.aud !== audience) throw new Error("Google ID token audience mismatch.");
  if (!payload.sub || !payload.email) throw new Error("Google account information is incomplete.");
  if (payload.email_verified !== true) throw new Error("Google email is not verified.");
  if (!payload.exp || Number(payload.exp) * 1000 <= Date.now()) throw new Error("Google ID token has expired.");
  if (payload.iat && Number(payload.iat) * 1000 > Date.now() + 5 * 60 * 1000) {
    throw new Error("Google ID token issue time is invalid.");
  }

  const certs = await getCertificates();
  const cert = certs[header.kid];
  if (!cert) {
    cachedCerts = null;
    const refreshedCerts = await getCertificates();
    const refreshedCert = refreshedCerts[header.kid];
    if (!refreshedCert) throw new Error("Google signing key not found.");
    return verifySignature(parts, refreshedCert, payload);
  }

  return verifySignature(parts, cert, payload);
};

const verifySignature = (parts, cert, payload) => {
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();

  if (!verifier.verify(cert, base64UrlToBuffer(parts[2]))) {
    throw new Error("Invalid Google ID token signature.");
  }

  return payload;
};

module.exports = { verifyGoogleIdToken };
