# Implementation Tasks

## Issue 1: Remove maxDiscountAmount (Dead Code)

- [ ] Remove `maxDiscountAmount` from `backend/src/models/couponModel.ts`
- [ ] Remove `maxDiscountAmount` check from `backend/src/services/cartService.ts`
- [ ] Remove `maxDiscountAmount` from `frontend/src/types/index.ts` (ICoupon)

## Issue 2: Production Order Number

- [ ] Add `orderNumber` field to `backend/src/models/orderModel.ts`
- [ ] Generate orderNumber in checkout (`backend/src/services/cartService.ts`) using counter pattern
- [ ] Add auto-migration script for existing orders without orderNumber
- [ ] Update `frontend/src/pages/Cart.tsx` to display `order.orderNumber`
- [ ] Update `frontend/src/pages/OrderDetail.tsx` to display `order.orderNumber`
- [ ] Update `frontend/src/pages/MyOrders.tsx` to display `order.orderNumber`
- [ ] Update `frontend/src/pages/AdminDashboard.tsx` to display `order.orderNumber`

## Issue 3: Coupon Usage Per User

- [ ] Add `usedBy` array to `backend/src/models/couponModel.ts`
- [ ] Update `backend/src/services/couponService.ts` validateCoupon to check per-user limit
- [ ] Update `backend/src/services/cartService.ts` checkout to increment per-user usage after order created

## Issue 4: Cart UX - Hide Discount -0

- [ ] In `frontend/src/pages/Cart.tsx`, wrap Order Summary Discount row with `{discountAmount > 0 && (...)}`

## Issue 5: Verification

- [ ] TypeScript compilation check (backend + frontend)
- [ ] Verify coupon validation flow
- [ ] Verify checkout (with and without coupon)
- [ ] Verify order success screen
- [ ] Verify order details
- [ ] Verify my orders list
- [ ] Verify admin orders
