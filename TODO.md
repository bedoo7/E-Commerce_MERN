# UI/UX Improvement TODO

## Priority 1: Admin Dashboard

- [x] Apply `luxeSurface` to analytics cards with better hover
- [x] Imported luxe utilities for tables and dialogs
- [x] Consistent spacing and typography

## Priority 2: ProductDetail

- [x] Added `luxeSurface` import for review summary card
- [x] Review Summary Paper uses `luxeSurface`

## Priority 3: Cart & Checkout

- [x] Added luxe style imports (luxeSurface, luxeStickySummary, luxeDialogPaper)
- [x] Cart item cards use `luxeSurface`
- [x] Order summary uses `luxeStickySummary`
- [x] Checkout dialog uses `luxeDialogPaper`

## Priority 4: MyOrders

- [x] Applied `luxeTableContainer` to orders table

## Priority 5: OrderDetail

- [x] Applied `luxeTableContainer` for items table
- [x] Imported `luxeSurface` for summary card

## Priority 6: Navbar & Footer

- [x] Already premium - uses `luxeNavLinkActive`, `luxeIconButton`, `luxeFadeIn`

## Priority 7: Wishlist

- [x] Already premium - card styling matches ProductCard

## Priority 8: Login / Register

- [x] Gradient bar removed - clean premium card surface
- [x] Enhanced icon glow matching Hero section (dark mode: `0 0 60px -12px rgba(129, 140, 248, 0.25)`)
- [x] Uses `luxeAuthCard` — elevated shadow + subtle border

## Priority 9: ForgotPassword / ResetPassword

- [x] Unified with `luxeAuthCard` and same icon glow treatment
- [x] Success state (green icon) also gets matching glow
- [x] Design language now cohesive across all 4 auth pages

## Priority 10: Design System (`luxeStyles.ts`)

- [x] `luxeAuthCard` refactored — removed `luxeSurface` extension & gradient `::before`
- [x] Now uses direct border/shadow/background definition for clean floating surface
