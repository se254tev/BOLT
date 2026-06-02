# PRODUCTION AUDIT REPORT

This report is generated from an automated inspection of the Bolt repository on 2026-06-02.

== SUMMARY ==
I inspected backend and Flutter frontend files relevant to seller onboarding, product APIs, contact exposure, navigation, image performance, and analytics.

## Key findings (high level)
- Seller phone numbers are returned in product detail API responses and displayed on product detail UI.
- Backend `.populate('sellerId', 'name phone')` was returning seller name and phone; internal _id could be included by Mongoose populate unless explicitly excluded.
- Product creation endpoints did not previously enforce `role === 'seller'` in routes; some authorization relied on service ownership checks only.
- No dedicated seller authorization middleware existed; added `authorizeSeller` to enforce `role === 'seller'` and `sellerStatus === 'active'`.
- No analytics were implemented for contact clicks; no tracking for WhatsApp/phone taps.
- App shell navigation uses `Scaffold(body: child)` without `IndexedStack`; tab state is not preserved.
- `Image.network` is still used in product detail and a few other places; product list uses `CachedNetworkImage`.
- Flutter client already included `sellerStatus` in user model and router controller exists.

## Files changed (backend)
- Modified: backend/src/models/user.js — added `sellerStatus` enum and index.
- Added: backend/src/middleware/authorizeSeller.js — middleware to require active seller role.
- Modified: backend/src/services/productService.js — populate excludes `_id`, createProduct enforces role/status.
- Modified: backend/src/routes/products.js — added `authorizeSeller()` to POST/PUT/DELETE.
- Modified: backend/src/routes/orders.js — protected seller endpoints with `authorizeSeller()`.
- Added: backend/src/controllers/sellerController.js — `applySeller`, `activateSeller` endpoints.
- Added: backend/src/routes/seller.js — registered `/seller/apply` and `/seller/activate`.
- Modified: backend/gateway/api-gateway.js — registered seller routes.
- Modified: backend/src/controllers/adminController.js — added `approveSeller` and `rejectSeller` admin handlers.
- Modified: backend/src/routes/admin.js — admin routes for seller approve/reject.

## APIs added
- POST `/api/seller/apply` — authenticated buyers may apply (sets `sellerStatus: 'pending'`, stores `applicationDate`).
- PATCH `/api/seller/activate` — authenticated user with `sellerStatus == 'approved'` may activate (sets `sellerStatus: 'active'` and `role: 'seller'`).
- PATCH `/api/admin/seller/:id/approve` — admin approves seller (sets `sellerStatus: 'approved'`, records `approvedAt` & `approvedBy`).
- PATCH `/api/admin/seller/:id/reject` — admin rejects seller (sets `sellerStatus: 'rejected'`, records `rejectedAt` & reason).

## Database changes
- `User` schema now has `sellerStatus` enum: `['none','pending','approved','active','rejected']` default `'none'` and an index on `sellerStatus`.
- New audit log entries are created for seller application, approval, rejection, and activation.

## Security improvements applied
- Added `authorizeSeller` middleware to enforce both role and active seller status for critical seller endpoints.
- Product creation now enforces seller role and active status at service level.
- Product population was tightened to exclude `_id` when populating seller details to avoid leaking internal IDs.

## Remaining recommendations (not yet applied)
- Frontend: add `PhoneSanitizer.normalize()` and use it in `_chatSeller` and `_callSeller` before building URIs.
- Frontend: replace `Image.network` with `CachedNetworkImage` in product detail, cart, and pending payments pages.
- Frontend: add analytics tracking for contact clicks and a backend `POST /analytics/contact-click` endpoint.
- Frontend: ensure all navigation uses `AppRouterController.instance.navigate(context, user)` and remove UI-based `context.go('/seller/dashboard')` where present.
- Frontend: convert `AppShellPage` to preserve state (use `IndexedStack` or `StatefulShellRoute`) to keep tab state and scroll position.
- Tests: Add unit/integration tests for seller endpoints and Flutter routing flows.

## Immediate next steps (priority)
1. Merge these backend changes and run backend tests (`npm test`).
2. Implement frontend phone sanitizer and update product detail UI to use it (prevent malformed WhatsApp URLs).
3. Replace remaining `Image.network` usages with `CachedNetworkImage`.
4. Add analytics backend and frontend tracking for contact clicks.
5. Run `flutter analyze`, `flutter test`, fix issues, then build release.


---

This file was created by the automated audit and partial implementation script. For implementation details, see the changed files list above.
