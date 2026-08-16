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
- Product search now resets pagination before issuing the query and displays a meaningful error/empty state instead of silently swallowing failed API requests.
- Removed unused client imports and inert checkout code so the configured linter completes without warnings.

## Dependency / installation checks

- The supplied archive contained `node_modules` artifacts with restrictive filesystem permissions. Those artifacts are excluded from the final ZIP.
- Existing `package.json` and lockfiles are preserved.
- The environment's global `npm` launcher is broken, so checks were run using the bundled Node runtime and the project's installed dependencies. `package.json` and lockfiles remain unchanged apart from the client test script.

## Testing performed

- Server startup completed successfully against the configured local MongoDB database.
- Verified `GET /`, public products/categories endpoints, unknown route handling, protected-route rejection, and invalid-ID validation responses.
- `node --test tests/products-page.contract.test.mjs` passed in `client/`.
- `oxlint` completed with no warnings after cleanup.
- `vite build` completed successfully in `client/`.
- Environment-example files, lockfiles, and public favicon/reference were inspected.
- Created and inspected `ShopSphere-corrected.zip` (206 entries); it excludes `.env` files, `.git`, `node_modules`, build output, logs, and temporary files.

## Remaining non-critical limitations

- Interactive browser automation could not start because the local browser runtime lacks permission to inspect a Windows profile path.
- Live Gmail SMTP, Google OAuth, Cloudinary, and Razorpay transactions were not executed against production/test accounts. The server's configured MongoDB connection was verified locally.

## Latest runtime fixes (2026-08-16)

- Fixed server-local environment loading so `server/.env` is loaded regardless of whether the server is started from `server/` or the project root.
- Fixed Razorpay boot behavior: missing `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` no longer crashes the entire Express process during route/controller import. Razorpay is initialized lazily and payment requests return a clear `503` configuration error when credentials are missing.
- Removed the unused Razorpay import from the order controller so ordinary order APIs do not initialize the payment provider.
- Kept server-side Razorpay signature verification and provider-side payment verification intact before an order can become paid.
- Normalized placeholder client environment values so `your-*` example values are treated as unconfigured instead of being sent to Google/Razorpay.
- The uploaded source ZIP intentionally contains no real `.env` credentials. Create `server/.env` and `client/.env` locally from the provided examples.

### Google Sign-In configuration

`client/.env` and `server/.env` must use the **same Google OAuth Web Client ID**:

- `client/.env`: `VITE_GOOGLE_CLIENT_ID=<same-web-client-id>`
- `server/.env`: `GOOGLE_CLIENT_ID=<same-web-client-id>`

For local development, the Google OAuth client must allow `http://localhost:5173` as an authorized JavaScript origin. The existing backend endpoint is `POST /api/auth/google`; a `401` from that endpoint means the request reached the backend and Google credential verification failed, rather than the route being missing.

### Razorpay configuration

For Razorpay checkout, configure both server secrets and the browser-safe key:

- `server/.env`: `RAZORPAY_KEY_ID=<key-id>` and `RAZORPAY_KEY_SECRET=<key-secret>`
- `client/.env`: `VITE_RAZORPAY_KEY_ID=<same-key-id>`

Never put `RAZORPAY_KEY_SECRET` in the client environment.
