# ShopSphere Repair Design

## Goal

Repair and complete the committed ShopSphere MERN application without replacing its existing architecture, then package a reproducible, sanitized source ZIP.

## Scope

The work covers the React/Vite client and Express/Mongoose server: API contracts, authentication and authorization, product/catalog/cart/order/review/admin flows, validation and errors, client resilience, uploads, email/OTP reset, Google Identity Services, Razorpay verification, configuration, public assets, and delivery documentation.

## Architecture

Use a contract-first repair sequence. The Express route/controller/model layer remains the source of truth and returns the project-standard `{ success, message, data }` envelope through `ResponseHandler`. React services and stores consume those corrected endpoints and keep token/session state in the existing Zustand/local-storage approach.

External providers remain optional at boot. Their configured paths must perform real provider calls and return clear failures when credentials or provider connectivity are unavailable. Credentials stay only in local `.env` files; `.env.example` documents every required variable.

## Repair Approach

1. Audit the repository and its installed dependency graph, then execute build and focused runtime/contract checks.
2. Correct backend routes, middleware, controllers, models, validators, and utilities in place. Every controller failure logs the prescribed `Error in server > controllers > <filename>` prefix and returns a safe standardized response.
3. Reconcile client routes, API services, state stores, forms, checkout, role guards, UI error/loading/empty states, and assets to the repaired backend contracts.
4. Exercise local integrations using non-production `.env` configuration when available. A provider that cannot be contacted must fail gracefully rather than simulate success.
5. Produce `FIXES.md`, accurate env examples, and a ZIP containing source/configuration only—excluding secrets, Git metadata, dependencies, caches, build outputs, logs, and temporary files.

## Validation

Run server startup/configuration checks, API-level validation/auth/error-path checks that do not require destructive external activity, and client lint/build checks. Validate live MongoDB, SMTP, Google, Cloudinary, and Razorpay only when local non-production credentials and connectivity are available. Record any unavailable external verification as a non-critical limitation in `FIXES.md`.

## Constraints

- Preserve working API behavior, database design, naming, and visual direction unless a correction requires change.
- Never include real credentials in tracked files or the final archive.
- Do not mark payment as paid without verified server-side Razorpay signature validation.
- Do not claim live third-party integration verification without an actual successful, configured test.
