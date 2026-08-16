# ShopSphere Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the committed ShopSphere client and server build, start, honor one secure API contract, and ship as a sanitized source ZIP.

**Architecture:** Preserve Express/Mongoose controllers and the React/Zustand client. Repair server contracts first, then make services, stores, components, and pages consume the same response envelope. Add focused executable checks around the highest-risk validation, auth, and payment behavior before packaging.

**Tech Stack:** Node.js, Express 5, Mongoose, Zod, JWT, Nodemailer, Razorpay, Cloudinary, React 19, Vite, React Router, Zustand, Axios, Material UI.

**Spec:** `docs/superpowers/specs/2026-08-15-shopsphere-repair-design.md`

## Global Constraints

- Keep the API response envelope exactly `{ success, message, data }`.
- Preserve existing endpoint paths and UI direction unless a route/client mismatch requires a compatible correction.
- Never store or archive `.env` credentials.
- Never set an order to paid unless Razorpay signature validation succeeds server-side.
- Record unavailable live-provider tests honestly in `FIXES.md`.

---

### Task 1: Establish reproducible validation and configuration boundaries

**Files:**
- Modify: `README.md`, `client/.env.example`, `server/.env.example`, `client/package.json`, `server/package.json`
- Create: `server/tests/health.test.js`, `server/tests/validation.test.js`

**Interfaces:**
- Consumes: exported `{ app }` from `server/server.js`.
- Produces: `npm test` in `server/` and documented environment requirements.

- [ ] **Step 1: Write failing health and invalid-route tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../server');

test('unknown API routes return the standard response envelope', async () => {
  const response = await request(app).get('/api/missing');
  assert.equal(response.status, 404);
  assert.deepEqual(Object.keys(response.body).sort(), ['data', 'message', 'success']);
  assert.equal(response.body.success, false);
});
```

- [ ] **Step 2: Run tests to verify the current behavior and test wiring**

Run: `npm test --prefix server`

Expected: a failing test or missing test-script/dependency failure that identifies the setup needed.

- [ ] **Step 3: Add the minimal Node test script and test dependency, then document every env variable**

```json
{ "scripts": { "test": "node --test" } }
```

Ensure `.env.example` names match code, use `VITE_` variables only for browser-exposed client settings, and contain no usable secret values.

- [ ] **Step 4: Run focused tests and package checks**

Run: `npm test --prefix server`

Expected: PASS for deterministic no-database health/validation tests.

### Task 2: Make server boot, middleware, routes, and errors safe and consistent

**Files:**
- Modify: `server/server.js`, `server/config/db.js`, `server/middleware/auth.middleware.js`, `server/middleware/admin.middleware.js`, `server/middleware/error.middleware.js`, `server/middleware/validate.middleware.js`, `server/middleware/upload.middleware.js`, `server/utils/responseHandler.js`
- Test: `server/tests/health.test.js`, `server/tests/validation.test.js`

**Interfaces:**
- Consumes: standardized `ResponseHandler(res, code, success, message, data)`.
- Produces: no uncaught bad-ID, validation, CORS, upload, JWT, or unknown-route error; all use the response envelope.

- [ ] **Step 1: Add failing tests for bad JSON, Zod errors, invalid bearer tokens, and disallowed origins.**
- [ ] **Step 2: Run the targeted tests and capture the existing response shape/status.**
- [ ] **Step 3: Normalize middleware behavior:** return after each response, validate ObjectIds before database calls, map Multer/JWT/Mongoose/Zod errors to safe messages, use allow-listed CORS origins, and expose `app` without opening a listener on import.
- [ ] **Step 4: Re-run targeted middleware tests and run `npm start --prefix server` with a configured local environment.**

### Task 3: Repair identity, password-reset OTP, Google, and user account flows

**Files:**
- Modify: `server/controllers/auth.controller.js`, `server/controllers/user.controller.js`, `server/models/user.model.js`, `server/routes/auth.route.js`, `server/routes/user.route.js`, `server/validators/auth.validator.js`, `server/validators/user.validator.js`, `server/utils/generateJWTToken.js`, `server/utils/generateResettoken.js`, `server/utils/email/sendEmail.js`, `server/utils/email/html/forgotPass.js`, `server/utils/google/verifyGoogleToken.js`
- Modify: `client/src/services/authService.js`, `client/src/services/api.js`, `client/src/store/authStore.js`, `client/src/hooks/useAuth.js`, `client/src/components/auth/*.jsx`, `client/src/pages/auth/*.jsx`, `client/src/components/common/ProtectedRoute.jsx`, `client/src/components/common/AdminRoute.jsx`
- Test: `server/tests/auth.test.js`

**Interfaces:**
- Consumes: `/api/auth/register`, `/login`, `/google`, `/me`, `/forgot-password`, `/verify-reset-otp`, `/reset-password/:token` and `/api/users/*`.
- Produces: token-backed client session, generic safe reset request response, expiring one-time reset token after OTP verification, and role-aware route guards.

- [ ] **Step 1: Write failing tests for duplicate registration, malformed/expired JWT, OTP expiry/attempts, reset-token invalidation, and Google credential rejection.**
- [ ] **Step 2: Run the auth tests against an isolated test database or model stubs.**
- [ ] **Step 3: Implement the minimal corrections:** hash passwords through model hooks, issue/verify signed JWTs, clear client storage on 401, hash OTP/reset values at rest, send mail before reporting reset delivery, verify Google ID tokens against configured audience, and use `Error in server > controllers > auth` / `user` logs with safe responses.
- [ ] **Step 4: Re-run auth tests and manually exercise login, logout, reset error paths, and route-guard redirects in the local client.**

### Task 4: Reconcile catalog, upload, cart, review, order, and admin data contracts

**Files:**
- Modify: `server/models/product.model.js`, `server/models/category.model.js`, `server/models/cart.model.js`, `server/models/order.model.js`, `server/models/review.model.js`
- Modify: `server/controllers/product.controller.js`, `server/controllers/category.controller.js`, `server/controllers/cart.controller.js`, `server/controllers/order.controller.js`, `server/controllers/review.controller.js`, `server/controllers/admin.controller.js`
- Modify: matching `server/routes/*.route.js` and `server/validators/*.validator.js`
- Modify: `client/src/services/{product,category,cart,order,review,admin}Service.js`, `client/src/store/cartStore.js`, `client/src/hooks/useCart.js`
- Test: `server/tests/catalog.test.js`, `server/tests/cart-order.test.js`

**Interfaces:**
- Consumes: documented existing `/api/products`, `/categories`, `/cart`, `/orders`, `/reviews`, `/admin` routes.
- Produces: schema-aligned, ownership-protected CRUD with populated data that client pages can render safely.

- [ ] **Step 1: Write failing tests for invalid IDs, product/category deletion constraints, cart quantities/stock, duplicate reviews, ownership checks, and admin-only mutations.**
- [ ] **Step 2: Run the focused data-contract tests.**
- [ ] **Step 3: Correct query population, fields, validation, totals, stock checks, ObjectId handling, upload limits/type handling, image fallback data, and controller error prefixes.**
- [ ] **Step 4: Re-run data-contract tests and client build; verify each service method’s endpoint, method, body, authorization header, and `data` consumption against its route.**

### Task 5: Secure payment state transitions and client checkout behavior

**Files:**
- Modify: `server/config/razorpay.js`, `server/controllers/payment.controller.js`, `server/routes/payment.route.js`, `server/validators/payment.validator.js`, `server/models/order.model.js`
- Modify: `client/src/services/paymentService.js`, `client/src/components/checkout/PaymentButton.jsx`, `client/src/components/checkout/PaymentMethod.jsx`, `client/src/pages/checkout/Checkout.jsx`, `client/src/pages/checkout/OrderSuccess.jsx`
- Test: `server/tests/payment.test.js`

**Interfaces:**
- Consumes: order owned by `req.user`, Razorpay order receipt, and Razorpay’s `order_id|payment_id` signature.
- Produces: `/api/payments/create-order`, `/verify`, and `/status/:orderId` that cannot be used to mark another user’s order as paid.

- [ ] **Step 1: Write failing tests for missing credentials, foreign order access, invalid signature, duplicate verification, and cancelled checkout.**
- [ ] **Step 2: Run payment tests with Razorpay client calls mocked.**
- [ ] **Step 3: Implement server-side amount/currency derivation from the stored order, HMAC verification with `RAZORPAY_KEY_SECRET`, idempotent paid status update only after success, and clear client cancellation/failure state.**
- [ ] **Step 4: Re-run payment tests and, if non-production credentials are configured, perform a provider-safe checkout verification without claiming payment on failure.**

### Task 6: Repair client pages, accessibility, responsive behavior, and public assets

**Files:**
- Modify: `client/src/App.jsx`, `client/src/layouts/*.jsx`, `client/src/pages/**/*.jsx`, `client/src/components/**/*.jsx`, `client/src/index.css`, `client/src/App.css`, `client/index.html`
- Modify/Create: `client/public/*` only for referenced project assets.

**Interfaces:**
- Consumes: fixed client services and stores.
- Produces: navigable public/customer/admin UI that never dereferences unavailable API data and gives visible loading, empty, validation, and error feedback.

- [ ] **Step 1: Run `npm run build --prefix client` and record every import, route, or dependency failure.**
- [ ] **Step 2: Repair only demonstrated UI defects:** invalid imports/exports, route fallbacks, image fallbacks, stale token behavior, form submit handling, dialog accessibility, mobile overflow, and duplicate components that obscure the active implementation.
- [ ] **Step 3: Re-run the production build and inspect key responsive paths (home, catalog, detail, cart, checkout, auth, profile, and admin).**

### Task 7: Document, clean, verify, and package the corrected project

**Files:**
- Modify: `FIXES.md`, `README.md`, `.gitignore`, `client/.env.example`, `server/.env.example`
- Create: `ShopSphere-corrected.zip` outside included project contents.

**Interfaces:**
- Consumes: completed verification output and final source tree.
- Produces: source-only archive containing client/server/package lockfiles/env examples/FIXES.md and excluding secrets/artifacts.

- [ ] **Step 1: Write `FIXES.md` with found/fixed issues, auth/API/database/client/email/Google/payment/dependency work, exact commands run, and provider limitations.**
- [ ] **Step 2: Run server tests, client lint/build, and a source-tree artifact scan.**
- [ ] **Step 3: Create the ZIP from an explicit allow-list/exclude-list, then list its contents to verify it contains no `.env`, `node_modules`, `.git`, logs, caches, or build output.**
- [ ] **Step 4: Report the archive path and verification results.**
