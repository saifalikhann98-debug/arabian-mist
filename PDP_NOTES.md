# Product Detail Page (PDP) — implementation notes

A reusable, data-driven product detail page recreated from the design handoff
(`~/Downloads/design_handoff_product_page`). It renders **any** catalog product, not
just Arabian Nights. Built in the existing vanilla stack — no framework, no build step,
no new dependencies.

## Try it
- Local: `npm run dev` → `http://localhost:4173/product.html?slug=arabian-nights`
  (try `?slug=blue-mist`, `?slug=oud-royale`, … any id from `data/products.js`).
- Production URL shape: **`/products/<slug>`** (clean URL via `vercel.json` rewrite).
- Homepage product cards now navigate to the PDP.

## Two things you'll want to change

### 1. WhatsApp order number
`product-page.js` → top of file:
```js
const BUSINESS_WHATSAPP = '971544224930'; // digits only, international format
```
Every "Order on WhatsApp" action builds `https://wa.me/<number>?text=...` with the
quantity, product name, and selected size.

### 2. Product data source (the seam)
`data/pdp-content.js` → **`toPdpProduct(base, all)`** is the single function that turns a
catalog entry into the page's `PdpProduct` shape (typed via JSDoc at the top of that file).
Today it **derives** the rich PDP fields from the existing `data/products.js` catalog and
keeps a pixel-faithful **override** for `arabian-nights`.

To wire a real backend/CMS later, replace the body of `toPdpProduct()` with a fetch/transform
from your commerce source — nothing else in the PDP needs to change.

**Seed-derived fields to replace with real data per product:**
- `sizes` — currently a default ladder (30/50/100ml + sold-out 15ml) anchored to the catalog price.
- `images` — currently `[catalog image, feature.jpg, hero.jpg]`; add real per-product gallery shots.
- `rating` / `reviews` — placeholder seed values (4.8 + a deterministic count).
- pyramid `notes[].items` — derived from the catalog's 3 headline notes; real layered notes are richer.
- `priceWas` — only set on the Arabian Nights override (no fake discounts elsewhere).

## Files
- `product.html` — page shell (static chrome + mount points), loads Cormorant + **Jost**.
- `product.css` — ported design tokens + components + responsive (1080 / 760 / 480) + focus rings.
- `product-page.js` — renderer + interactions (gallery, size→price, qty, accordion, pyramid, WhatsApp).
- `data/pdp-content.js` — typed model + `toPdpProduct()` seam.
- `vercel.json` — `/products/:slug` → `/product.html` rewrite.
- `index.html` / `script.js` — homepage cards now link to the PDP (unchanged otherwise).

> Cache-busting: local assets are referenced with `?v=N`. **Bump the number** when you change
> `product.css` / `product-page.js` / `data/*.js` so returning visitors don't get stale files.

## Known divergences (intentional, flagged)
- **Palette + UI font:** the PDP uses the handoff's ink / ivory / antique-gold tokens and **Jost**,
  whereas the homepage uses warm wine / porcelain / gold and **Inter**. The PDP CSS is self-contained
  (loaded only by `product.html`) so it doesn't affect the homepage. Recommend unifying the two
  directions site-wide as a follow-up.
- **Pricing:** the PDP shows prices (per the design); the homepage currently hides them. Decide whether
  to reveal prices on cards too.
- **No cart:** per decision, "Add to cart" is a direct WhatsApp order (the store is WhatsApp-only).
