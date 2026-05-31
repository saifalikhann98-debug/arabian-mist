/* ============================================================
   Arabian Mist UAE — PDP content layer (the data seam)
   ------------------------------------------------------------
   The PDP renders from a typed `PdpProduct`. We DERIVE that from the
   existing catalog in `data/products.js` (window.PRODUCTS) via
   `toPdpProduct()`, with a pixel-faithful override for the hero product.

   >>> TO SWAP IN A REAL BACKEND/CMS: replace the body of
       `toPdpProduct()` with a fetch/transform from your commerce source.
       Nothing else in the PDP needs to change.
   ============================================================ */

/**
 * @typedef {Object} PdpSize
 * @property {string}  ml        e.g. "50ml"
 * @property {number}  price     AED, numeric
 * @property {string}  note      e.g. "Signature"
 * @property {boolean} soldOut
 *
 * @typedef {Object} PdpNote
 * @property {'Opening'|'Heart'|'Base'} name
 * @property {string} items   short ingredient list
 * @property {string} desc    caption shown in the pyramid
 *
 * @typedef {Object} PdpImage
 * @property {string} src
 * @property {string} label
 *
 * @typedef {Object} PdpRelated
 * @property {string} slug
 * @property {string} name
 * @property {string} notes
 * @property {number} price
 * @property {string} src
 *
 * @typedef {Object} PdpProduct
 * @property {string} slug
 * @property {string} name
 * @property {string} house
 * @property {string} concentration
 * @property {string} tagline
 * @property {number} rating
 * @property {number} reviews
 * @property {number} [priceWas]
 * @property {string} lede
 * @property {PdpImage[]} images
 * @property {PdpSize[]} sizes
 * @property {number} defaultSize        index of the size selected on load
 * @property {PdpNote[]} notes
 * @property {{title:string, body:string}[]} accordions
 * @property {PdpRelated[]} related
 */

/* ---------- price helpers ---------- */
/** Format a numeric AED amount: 480 -> "AED 480". */
function aed(n) { return 'AED ' + Number(n).toLocaleString('en-AE'); }
/** Parse an AED value that may already be a number or an "AED 640" string. */
function parseAed(v) {
  if (typeof v === 'number') return v;
  const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/* ---------- shared copy (same for every product unless overridden) ---------- */
const SHARED_ACCORDIONS = {
  delivery: 'Wrapped in a rigid keepsake box with complimentary samples and a signature note card. Complimentary UAE delivery on orders above AED 350. Dispatched within 1–2 working days.',
  returns: 'Unopened bottles accepted within 14 days of delivery. Contact us via WhatsApp to arrange a return or exchange. Discovery sizes are non-returnable.',
};

/* ---------- derivation helpers (seed-quality; replace via CMS) ---------- */
const round10 = (n) => Math.round(n / 10) * 10;

/** A sensible size ladder anchored to the catalog (100ml) price. */
function defaultSizes(basePrice) {
  return [
    { ml: '30ml', price: round10(basePrice * 0.46), note: 'Travel', soldOut: false },
    { ml: '50ml', price: round10(basePrice * 0.68), note: 'Signature', soldOut: false },
    { ml: '100ml', price: basePrice, note: 'Atelier', soldOut: false },
    { ml: '15ml', price: round10(basePrice * 0.30), note: 'Discovery', soldOut: true },
  ];
}

/** Map the catalog's 3 accords into the pyramid's Opening/Heart/Base. */
function pyramidNotes(base) {
  const n = base.notes || [];
  const a = base.accords || {};
  return [
    { name: 'Opening', items: n[0] || '', desc: a.top || '' },
    { name: 'Heart', items: n[1] || n[0] || '', desc: a.heart || '' },
    { name: 'Base', items: n.slice(2).join(', ') || n.join(', '), desc: a.base || '' },
  ];
}

/** Deterministic placeholder review count (clearly seed data — replace via CMS). */
function seedReviews(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 200;
  return 80 + h;
}

function relatedFor(base, all) {
  const idx = all.findIndex((p) => p.id === base.id);
  const out = [];
  for (let k = 1; out.length < 3 && k < all.length; k++) {
    const p = all[(idx + k) % all.length];
    if (p.id === base.id) continue;
    out.push({ slug: p.id, name: p.name, notes: p.notes.join(' · '), price: parseAed(p.price), src: p.image });
  }
  return out;
}

function dedupeImages(list) {
  const seen = new Set();
  return list.filter((im) => (seen.has(im.src) ? false : (seen.add(im.src), true)));
}

/* ---------- pixel-faithful override for the hero product ---------- */
/* Mirrors the design handoff's product-data.js exactly (image paths updated
   to the optimized .jpg assets that replaced the heavy .png originals). */
const OVERRIDES = {
  'arabian-nights': {
    slug: 'arabian-nights',
    name: 'Arabian Nights',
    house: 'Private Collection',
    concentration: 'Extrait de Parfum',
    tagline: 'Oud · Saffron · Black Vanilla',
    rating: 4.8,
    reviews: 214,
    priceWas: 560,
    lede: 'A lavish oud extrait threaded with saffron, black vanilla, and polished woods — dark, plush, and made for the slow drama of desert evenings.',
    images: [
      { src: 'assets/card-arabian-nights.jpg', label: 'Arabian Nights bottle' },
      { src: 'assets/feature.jpg', label: 'On dark marble with amber' },
      { src: 'assets/product-oud-lifestyle.jpg', label: 'Lifestyle' },
      { src: 'assets/hero.jpg', label: 'Collection on the dunes' },
    ],
    sizes: [
      { ml: '30ml', price: 320, note: 'Travel', soldOut: false },
      { ml: '50ml', price: 480, note: 'Signature', soldOut: false },
      { ml: '100ml', price: 720, note: 'Atelier', soldOut: false },
      { ml: '15ml', price: 190, note: 'Discovery', soldOut: true },
    ],
    defaultSize: 1,
    notes: [
      { name: 'Opening', items: 'Saffron, spiced citrus, pink pepper', desc: 'Saffron and spiced citrus open with a warm evening glow.' },
      { name: 'Heart', items: 'Bulgarian rose, orris butter, jasmine', desc: 'A polished floral core, matured and softly powdered.' },
      { name: 'Base', items: 'Black oud, smoked tea, cashmere musk, vanilla', desc: 'Skin-warm oud and black vanilla for a long, quiet trail.' },
    ],
    accordions: [
      { title: 'Composition', body: 'Frankincense tears, orris butter, smoked black tea, pale woods, and cashmere musk — matured in small batches and finished by hand. Free from added colourants. Alcohol-based extrait, 30% concentration.' },
      { title: 'Delivery & Wrapping', body: SHARED_ACCORDIONS.delivery },
      { title: 'Returns', body: SHARED_ACCORDIONS.returns },
    ],
    related: [
      { slug: 'noor-al-ain', name: 'Noor Al Ain', notes: 'Damask Rose · Cacao · Ambergris', price: 680, src: 'assets/card-noor-al-ain.jpg' },
      { slug: 'blue-mist', name: 'Blue Mist', notes: 'Bergamot · Blue Musk · Cool Woods', price: 590, src: 'assets/card-blue-mist.jpg' },
      { slug: 'oud-royale', name: 'Oud Royale', notes: 'Cambodian Oud · Leather · Patchouli', price: 720, src: 'assets/product-oud-lifestyle.jpg' },
    ],
  },
};

/* ---------- the seam: catalog entry -> PdpProduct ---------- */
/**
 * @param {object} base  an entry from window.PRODUCTS (data/products.js)
 * @param {object[]} all the full catalog (for related products)
 * @returns {PdpProduct}
 */
function toPdpProduct(base, all) {
  if (OVERRIDES[base.id]) return OVERRIDES[base.id];

  const basePrice = parseAed(base.price); // catalog price is the 100ml/Atelier price
  const sizes = defaultSizes(basePrice);
  return {
    slug: base.id,
    name: base.name,
    house: 'Private Collection',
    concentration: 'Extrait de Parfum',
    tagline: (base.notes || []).join(' · '),
    rating: 4.8,                 // seed default — replace via CMS
    reviews: seedReviews(base.id), // seed placeholder — replace via CMS
    lede: base.description || '',
    images: dedupeImages([
      { src: base.image, label: base.name + ' bottle' },
      { src: 'assets/feature.jpg', label: 'On dark marble with amber' },
      { src: 'assets/hero.jpg', label: 'The collection on the dunes' },
    ]),
    sizes,
    defaultSize: 1, // Signature/50ml
    notes: pyramidNotes(base),
    accordions: [
      { title: 'Composition', body: (base.description || '') + ' Alcohol-based extrait, matured in small batches and finished by hand.' },
      { title: 'Delivery & Wrapping', body: SHARED_ACCORDIONS.delivery },
      { title: 'Returns', body: SHARED_ACCORDIONS.returns },
    ],
    related: relatedFor(base, all || []),
  };
}

/* expose (script-tag globals, matching data/products.js' pattern) */
Object.assign(window, { toPdpProduct, aedFormat: aed });
