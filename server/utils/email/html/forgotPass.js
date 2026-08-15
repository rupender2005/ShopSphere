/**
 * Generates an HTML email template for password resets.
 * @param {string} resetLink - The URL for resetting the password.
 * @param {string} [appName='ShopSphere'] - The name of the application.
 * @returns {string} The HTML email content.
 */
const forgotHtml = (resetLink, appName = "ShopSphere", resetOtp = "") => {
  // The opening backtick MUST be on the same line as `return`
  // to prevent JavaScript's Automatic Semicolon Insertion (ASI) from returning `undefined`.
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Password Reset - ${appName}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
      <!-- Added role="presentation" to tables for screen reader accessibility -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
          <tr>
              <td align="center">
                  <!-- Added max-width for better mobile responsiveness -->
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);max-width:100%;">
                      
                      <tr>
                          <td style="background:#1976d2;padding:25px;text-align:center;">
                              <h1 style="color:#ffffff;margin:0;font-size:24px;">
                                  ${appName}
                              </h1>
                          </td>
                      </tr>

                      <tr>
                          <td style="padding:40px;">
                              <h2 style="color:#333333;margin-top:0;font-size:20px;">
                                  Password Reset Request
                              </h2>

                              <p style="font-size:16px;color:#555555;line-height:1.6;">
                                  We received a request to reset the password for your
                                  <strong>${appName}</strong> account.
                              </p>

                              <p style="font-size:16px;color:#555555;line-height:1.6;">
                                  Click the button below to create a new password:
                              </p>

                              ${resetOtp ? `
                              <div style="margin:25px 0;padding:20px;background:#f4f7fb;border-radius:8px;text-align:center;">
                                  <div style="font-size:13px;color:#777777;margin-bottom:8px;">Your password reset code</div>
                                  <div style="font-size:30px;letter-spacing:8px;font-weight:700;color:#1976d2;">${resetOtp}</div>
                                  <div style="font-size:13px;color:#777777;margin-top:8px;">This code expires in 15 minutes.</div>
                              </div>
                              ` : ""}

                              <div style="text-align:center;margin:35px 0;">
                                  <a
                                      href="${resetLink}"
                                      style="
                                          background:#1976d2;
                                          color:#ffffff;
                                          text-decoration:none;
                                          padding:14px 30px;
                                          border-radius:6px;
                                          font-size:16px;
                                          font-weight:bold;
                                          display:inline-block;
                                      "
                                  >
                                      Reset Password
                                  </a>
                              </div>

                              <p style="font-size:14px;color:#777777;line-height:1.6;">
                                  If the button above doesn't work, copy and paste the following link into your browser:
                              </p>

                              <p style="word-break:break-all;font-size:14px;">
                                  <a href="${resetLink}" style="color:#1976d2;">
                                      ${resetLink}
                                  </a>
                              </p>

                              <p style="font-size:14px;color:#777777;line-height:1.6;">
                                  If you did not request a password reset, you can safely ignore this email.
                                  Your password will remain unchanged.
                              </p>

                              <p style="font-size:14px;color:#777777;line-height:1.6;">
                                  This link may expire after a limited time for security reasons.
                              </p>
                          </td>
                      </tr>

                      <tr>
                          <td style="background:#f8f9fa;padding:20px;text-align:center;color:#888888;font-size:13px;">
                              &copy; ${new Date().getFullYear()}${appName}. All rights reserved.
                          </td>
                      </tr>

                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `;
};

module.exports = { forgotHtml };
