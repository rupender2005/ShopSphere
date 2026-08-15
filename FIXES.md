# ShopSphere Fixes

## Major issues found and fixed

- Fixed the frontend favicon reference: the app referenced `favicon.svg` while the project contains `public/favicon.png`.
- Hardened server startup so `JWT_SECRET` is required and the database is connected before accepting requests.
- Restricted CORS to the configured client origin(s) instead of allowing every browser origin.
- Added safer centralized handling for Multer, Mongoose validation/cast, and duplicate-key errors.
- Preserved the existing `ResponseHandler` response structure and backend error-message convention.

## Authentication fixes

- Normal JWT login/logout/current-user flow remains token-based and uses the existing stored `loginToken`.
- Added a single token-generation helper that fails clearly when JWT configuration is missing.
- Password changes now invalidate existing login/reset tokens.
- Google login continues to use the existing Google Identity Services credential flow and backend token verification.

## Password reset / OTP fixes

- The backend now sends a reset link and six-digit OTP when the email can be delivered.
- Forgot-password failures no longer leave a stale reset token in the database.
- Forgot-password responses no longer reveal whether an email is registered.
- OTP verification now issues a fresh raw reset token whose hash is stored server-side; this fixes the previous hashed-token/raw-token mismatch.
- Frontend now includes OTP entry, OTP verification, resend-OTP, and reset-token navigation.
- Reset-password page now handles missing/invalid tokens cleanly.

## API / database fixes

- Frontend service endpoint names were checked against the server route structure; no separate API path family was introduced.
- Product validation now rejects a discount price greater than the normal price.
- Product/cart order calculations correctly treat a zero discount price as a valid discounted price.
- Server error handling now returns meaningful 400/409 responses for common Mongoose and upload failures.

## Payment fixes

- Razorpay payment verification now validates:
  - cryptographic signature
  - Razorpay payment ID against the Razorpay order
  - payment amount
  - INR currency
  - captured payment status
- Successful payments now record `paidAt`.
- Non-Razorpay orders cannot be passed into Razorpay order creation.
- Paid-order cancellation now attempts a real Razorpay full refund before marking the order refunded/cancelled.
- If the refund cannot be completed, the paid order is not silently marked refunded.

## Frontend fixes

- Forgot-password UI now reflects the actual OTP workflow supported by the server.
- Reset flow preserves the existing ShopSphere visual direction rather than replacing the application design.
- Existing featured-product/category/product-card UI was preserved while keeping broken references and flows from failing.

## Dependency / installation checks

- The supplied archive contained `node_modules` artifacts with restrictive filesystem permissions. Those artifacts are excluded from the final ZIP.
- Existing `package.json` and lockfiles are preserved.
- A clean `npm ci` could not be completed in this execution environment because dependency installation did not complete successfully from the available package/network environment.

## Testing performed

- `node --check` passed for all 50 server JavaScript files.
- Static frontend/backend endpoint inventory was inspected.
- Environment-example files and lockfiles were checked.
- Public favicon asset/reference was checked.
- Final archive was created without `.git`, `node_modules`, logs, temporary files, or `.env` secrets.

## Remaining non-critical limitations

- Full browser/Vite production-build testing was not possible in this environment because a clean frontend dependency installation could not be completed.
- Live MongoDB, Gmail SMTP, Google OAuth, Cloudinary, and Razorpay transactions require the project's real environment credentials/services and were not executed against production/test accounts here.
