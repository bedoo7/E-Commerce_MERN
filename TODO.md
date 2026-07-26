# Remaining Tasks - Implementation Plan

## Task 1: Admin Forms Alignment (HIGH)

- **AdminDashboard.tsx**: Polish Product Dialog (autocomplete, 2-column, consistent spacing)
- **AdminDashboard.tsx**: Polish User Dialog (consistent spacing, same styling pattern)

## Task 2: Category & Brand Management

- **AdminDashboard.tsx**: Replace text inputs with Autocomplete (freeSolo) for Category/Brand
- **AdminDashboard.tsx**: Add "+ Add New" quick-create dialogs
- **AdminDashboard.tsx**: Fetch categories/brands from `/category` and `/brand` endpoints

## Task 3: Footer Links (already working with React Router)

- Layout.tsx footer links already use `component={Link} to="/?category=Phones"` - need to verify Home.tsx reads URL params

## Task 4: Reviews Frontend

- **ProductDetail.tsx**: Add review section (average rating, stars, review list, submit form)

## Task 5: Coupons Frontend

- **Cart.tsx**: Add coupon input + apply button
- **AdminDashboard.tsx**: Add Coupons tab (list, create, delete)

## Task 6: Final Verification

- TypeScript compilation
- Test all features
