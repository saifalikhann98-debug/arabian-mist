/* ============================================================
   Arabian Mist UAE — PDP content layer (the data seam)
   ------------------------------------------------------------
   The PDP renders from a typed `PdpProduct`. We DERIVE that from the
   catalog in `data/products.js` (PRODUCTS) via `toPdpProduct()`.

   >>> TO SWAP IN A REAL BACKEND/CMS: replace the body of
       `toPdpProduct()` with a fetch/transform from your commerce source.
       Nothing else in the PDP needs to change.
   ============================================================ */

/**
 * @typedef {Object} PdpSize
 * @property {string}  ml        e.g. "100ml"
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

/* ---------- shared copy (same for every product) ---------- */
const SHARED_ACCORDIONS = {
  delivery: 'Wrapped in a rigid keepsake box with complimentary samples and a signature note card. Complimentary UAE delivery on orders above AED 350. Dispatched within 1–2 working days.',
  returns: 'Unopened bottles accepted within 14 days of delivery. Contact us via WhatsApp to arrange a return or exchange.',
};

/* ---------- derivation helpers ---------- */
/** Map the catalog's 3 accords into the pyramid's Opening / Heart / Base. */
function pyramidNotes(base) {
  const n = base.notes || [];
  const a = base.accords || {};
  return [
    { name: 'Opening', items: n[0] || '', desc: a.top || '' },
    { name: 'Heart', items: n[1] || n[0] || '', desc: a.heart || '' },
    { name: 'Base', items: n.slice(2).join(', ') || n.join(', '), desc: a.base || '' },
  ];
}

/** Deterministic placeholder review count (seed data — replace via CMS). */
function seedReviews(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 200;
  return 80 + h;
}

/** Build the PDP gallery from the product's real images (packshot first). */
function galleryFor(base) {
  const list = (base.images && base.images.length ? base.images : [base.image]).filter(Boolean);
  return list.map((src, i) => ({ src, label: i === 0 ? base.name + ' bottle' : base.name + ' — in context' }));
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

/* ---------- the seam: catalog entry -> PdpProduct ---------- */
/**
 * @param {object} base  an entry from PRODUCTS (data/products.js)
 * @param {object[]} all the full catalog (for related products)
 * @returns {PdpProduct}
 */
function toPdpProduct(base, all) {
  const price = parseAed(base.price); // PLACEHOLDER until real prices are set in products.js
  return {
    slug: base.id,
    name: base.name,
    house: 'Private Collection',
    concentration: 'Extrait de Parfum',
    tagline: (base.notes || []).join(' · '),
    rating: 4.8,                  // seed default — replace via CMS
    reviews: seedReviews(base.id), // seed placeholder — replace via CMS
    lede: base.description || '',
    images: galleryFor(base),
    // Single real size (the bottles are 100ml). Add more sizes here if sold.
    sizes: [{ ml: base.size || '100ml', price: price, note: 'Signature', soldOut: false }],
    defaultSize: 0,
    notes: pyramidNotes(base),
    accordions: [
      { title: 'Composition', body: (base.description || '') + ' Alcohol-based eau de parfum, matured in small batches and finished by hand.' },
      { title: 'Delivery & Wrapping', body: SHARED_ACCORDIONS.delivery },
      { title: 'Returns', body: SHARED_ACCORDIONS.returns },
    ],
    related: relatedFor(base, all || []),
  };
}

/* expose (script-tag globals, matching data/products.js' pattern) */
Object.assign(window, { toPdpProduct, aedFormat: aed });
