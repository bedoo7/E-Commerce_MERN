# Remaining Features - Implementation Tracker

## Feature 1: Product Reviews & Ratings

- [ ] Backend: Review Model (productId, userId, rating, comment, verified)
- [ ] Backend: Review Service (create, getByProduct, getByUser, average rating)
- [ ] Backend: Review Routes (POST /review, GET /review/product/:id)
- [ ] Frontend: Review display on ProductDetail
- [ ] Frontend: Star rating input component
- [ ] Frontend: Review list with user info & verified badge

## Feature 2: Product Detail Enhancements

- [ ] Backend: Add `images` (string[]), `specs` (Record<string,string>) to product model
- [ ] Backend: Related products query by category
- [ ] Frontend: Image gallery with thumbnails
- [ ] Frontend: Specifications table
- [ ] Frontend: Related products section

## Feature 3: Order Tracking Timeline

- [ ] Frontend: StatusTimeline component with visual steps
- [ ] Frontend: Integrate into OrderDetail page

## Feature 4: Coupon/Discount System

- [ ] Backend: Coupon Model (code, discount%, expiresAt, usageLimit)
- [ ] Backend: Coupon Service (validate, apply)
- [ ] Backend: Coupon Routes (admin CRUD, user validate)
- [ ] Frontend: Coupon input on Cart page
- [ ] Frontend: Admin coupon management in dashboard

## Feature 5: Order Confirmation & Status Emails

- [ ] Backend: Email service integration for order confirmation
- [ ] Backend: Email on status change

## Feature 6: Admin Analytics

- [ ] Backend: Analytics service (revenue, top selling, orders by status)
- [ ] Frontend: Analytics dashboard with charts

## Feature 7: Admin Table Search/Filters

- [ ] Frontend: Search inputs for Products, Orders, Users tables

## Feature 8: Low Stock Warning Badge

- [ ] Frontend: Badge on admin product table rows with low stock

## Feature 9: Security - Email Verification

- [ ] Backend: Verification token on user model
- [ ] Backend: Send verification email
- [ ] Backend: Verify endpoint

## Feature 10: Security - Rate Limiting

- [ ] Backend: express-rate-limit on auth routes

## Feature 11: UX - Breadcrumb Navigation

- [ ] Frontend: Breadcrumb component
- [ ] Frontend: Integrate across pages
