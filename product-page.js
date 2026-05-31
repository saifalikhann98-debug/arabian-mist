/* ============================================================
   Arabian Mist UAE — PDP renderer + interactions (vanilla)
   Ported from the design handoff's product-app.jsx, minus the cart
   (this store takes orders via WhatsApp).

   >>> CONFIG: set the order destination here.
   ============================================================ */
const BUSINESS_WHATSAPP = '971544224930'; // <-- store WhatsApp number (digits only, intl)

(function () {
  'use strict';

  /* ---------- tiny utils ---------- */
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const aed = window.aedFormat || ((n) => 'AED ' + Number(n).toLocaleString('en-AE'));
  const $ = (sel, root) => (root || document).querySelector(sel);

  /* ---------- inline icons (no icon-library dependency) ---------- */
  const ICON = {
    wa: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.33 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.5 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.92-7.04A9.9 9.9 0 0 0 12.04 2Zm0 18.03h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.64 4.19 3.7.58.25 1.04.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>',
    chevL: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
    chevR: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    truck: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>',
    gift: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 9v11M12 9S9 3 6.5 5 9 9 12 9Zm0 0s3-6 5.5-4S15 9 12 9Z"/></svg>',
    leaf: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M20 4S8 4 6 12c-1 4 1 6 1 6s2-7 7-9c0 0-5 3-5 9 7 1 11-4 11-14Z"/></svg>',
    star: (f) => '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + (f ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="m12 3 2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.5l1.1-6L3.4 9.3l6-.8L12 3Z"/></svg>',
  };

  /* image with graceful fallback to the branded .ph placeholder */
  window.amImgFail = function (img) {
    const fb = img.getAttribute('data-fallback') || 'AM';
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.innerHTML = '<span>' + esc(fb) + '</span>';
    if (img.parentNode) img.parentNode.replaceChild(ph, img);
  };
  /* root-absolute URL for site assets so paths resolve under /products/<slug> */
  const absUrl = (u) => /^(https?:|\/)/.test(u) ? u : '/' + u;
  const imgTag = (src, alt, fallback, cls, id) =>
    '<img' + (id ? ' id="' + id + '"' : '') + (cls ? ' class="' + cls + '"' : '') +
    ' src="' + esc(absUrl(src)) + '" alt="' + esc(alt) + '" loading="lazy"' +
    ' data-fallback="' + esc(fallback || 'AM') + '" onerror="amImgFail(this)">';

  const stars = (v) => [1, 2, 3, 4, 5].map((i) => ICON.star(i <= Math.round(v))).join('');

  /* clean /products/<slug> in prod (Vercel rewrite); ?slug= locally */
  const productUrl = (slug) =>
    location.pathname.indexOf('/products/') === 0
      ? '/products/' + slug
      : 'product.html?slug=' + encodeURIComponent(slug);

  function getSlug() {
    const m = location.pathname.match(/\/products\/([^/?#]+)/);
    if (m) return decodeURIComponent(m[1]);
    return new URLSearchParams(location.search).get('slug') || 'arabian-nights';
  }

  function waOrder(name, sizeMl, qty) {
    const msg = "Hello Arabian Mist, I'd like to order " + qty + ' × ' + name +
      (sizeMl ? ' (' + sizeMl + ')' : '') + '.';
    window.open('https://wa.me/' + BUSINESS_WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  let toastTimer;
  function showToast(html) {
    const t = $('#toast');
    if (!t) return;
    t.innerHTML = html;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- resolve product ---------- */
  /* PRODUCTS is a top-level const in data/products.js — shared across classic
     scripts via the global lexical scope (not on window). */
  const CATALOG = (typeof PRODUCTS !== 'undefined' && PRODUCTS) ? PRODUCTS : (window.PRODUCTS || []);
  const base = CATALOG.find((p) => p.id === getSlug()) || CATALOG[0];
  if (!base || !window.toPdpProduct) {
    console.error('[PDP] catalog/data layer missing'); return;
  }
  const P = window.toPdpProduct(base, CATALOG);
  document.title = P.name + ' · Arabian Mist UAE';

  /* ---------- breadcrumb ---------- */
  const crumbs = $('#crumbs');
  if (crumbs) {
    crumbs.innerHTML =
      '<a href="/index.html">Home</a><span>/</span>' +
      '<a href="/index.html#collection">Collection</a><span>/</span>' + esc(P.name);
  }

  /* ---------- state ---------- */
  let gi = 0;                                   // gallery index
  let sel = Math.min(P.defaultSize || 0, P.sizes.length - 1); // selected size
  let qty = 1;
  let activeNote = Math.max(0, P.notes.length - 1); // Base active by default
  const signatureIdx = P.sizes.findIndex((s) => s.note === 'Signature');

  /* ============================================================
     PDP grid: gallery (left) + buy box (right)
     ============================================================ */
  const galleryHTML =
    '<div class="gallery">' +
      '<div class="gallery__main">' +
        '<div class="gallery__badge">' + esc(P.concentration) + '</div>' +
        imgTag(P.images[0].src, P.images[0].label, P.name, null, 'gMain') +
        '<button class="gallery__nav prev" data-go="-1" aria-label="Previous image">' + ICON.chevL + '</button>' +
        '<button class="gallery__nav next" data-go="1" aria-label="Next image">' + ICON.chevR + '</button>' +
      '</div>' +
      '<div class="thumbs">' +
        P.images.map((im, i) =>
          '<button class="thumb' + (i === 0 ? ' active' : '') + '" data-thumb="' + i + '" aria-label="View ' + esc(im.label) + '">' +
          imgTag(im.src, im.label, P.name) + '</button>').join('') +
      '</div>' +
    '</div>';

  const cur = P.sizes[sel];
  const showWas = sel === signatureIdx && P.priceWas;
  const buyHTML =
    '<div class="info">' +
      '<div class="eyebrow info__house">' + esc(P.house) + '</div>' +
      '<h1 class="title">' + esc(P.name) + '</h1>' +
      '<div class="subtitle">' + esc(P.tagline) + '</div>' +
      '<div class="rating"><div class="stars" aria-hidden="true">' + stars(P.rating) + '</div>' +
        '<small>' + P.rating + ' · <a href="#reviews">' + P.reviews + ' reviews</a></small></div>' +
      '<p class="lede">' + esc(P.lede) + '</p>' +
      '<div class="price">' +
        '<span class="price__now" id="priceNow">' + aed(cur.price) + '</span>' +
        '<span class="price__was" id="priceWas"' + (showWas ? '' : ' hidden') + '>' + (P.priceWas ? aed(P.priceWas) : '') + '</span>' +
        '<span class="price__tax">VAT included</span>' +
      '</div>' +
      '<div class="divider"></div>' +
      '<div class="field__label">Size <span id="sizeNote">' + esc(cur.note) + '</span></div>' +
      '<div class="sizes" id="sizes">' +
        P.sizes.map((s, i) =>
          '<button class="size' + (i === sel ? ' active' : '') + (s.soldOut ? ' soldout' : '') + '" data-size="' + i + '"' +
          (s.soldOut ? ' disabled aria-disabled="true"' : '') + ' aria-pressed="' + (i === sel) + '">' +
          '<b>' + esc(s.ml) + '</b><small>' + (s.soldOut ? 'Sold out' : aed(s.price)) + '</small></button>').join('') +
      '</div>' +
      '<div class="buy-row">' +
        '<div class="qty">' +
          '<button data-qty="-1" aria-label="Decrease quantity">−</button>' +
          '<input id="qty" value="1" inputmode="numeric" aria-label="Quantity">' +
          '<button data-qty="1" aria-label="Increase quantity">+</button>' +
        '</div>' +
        '<button class="btn btn--order" id="orderBtn">' + ICON.wa + ' Order on WhatsApp</button>' +
      '</div>' +
      '<div class="assure">' +
        '<div>' + ICON.truck + '<b>UAE delivery</b><small>Complimentary above AED 350</small></div>' +
        '<div>' + ICON.gift + '<b>Keepsake box</b><small>Free samples &amp; note card</small></div>' +
        '<div>' + ICON.leaf + '<b>Small batch</b><small>Matured &amp; finished by hand</small></div>' +
      '</div>' +
      '<div class="accordion" id="accordion">' +
        P.accordions.map((a, i) =>
          '<div class="acc' + (i === 0 ? ' open' : '') + '">' +
          '<button class="acc__head" aria-expanded="' + (i === 0) + '">' + esc(a.title) + '<span class="acc__icon">+</span></button>' +
          '<div class="acc__body" style="max-height:' + (i === 0 ? '240px' : '0') + '"><div class="acc__body-inner">' + esc(a.body) + '</div></div>' +
          '</div>').join('') +
      '</div>' +
    '</div>';

  $('#pdp').innerHTML = galleryHTML + buyHTML;

  /* ---------- gallery behavior ---------- */
  function showMain(i) {
    const n = P.images.length;
    gi = (i + n) % n;
    const wrap = $('.gallery__main');
    wrap.querySelectorAll('#gMain, .ph').forEach((el) => el.remove());
    const tmp = document.createElement('div');
    tmp.innerHTML = imgTag(P.images[gi].src, P.images[gi].label, P.name, null, 'gMain');
    const node = tmp.firstChild;
    wrap.insertBefore(node, $('.gallery__nav.prev'));
    if (node.tagName === 'IMG') {
      node.classList.add('fading');
      requestAnimationFrame(() => requestAnimationFrame(() => node.classList.remove('fading')));
    }
    document.querySelectorAll('.thumb').forEach((t, k) => t.classList.toggle('active', k === gi));
  }
  $('.gallery').addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) return showMain(gi + Number(go.dataset.go));
    const th = e.target.closest('[data-thumb]');
    if (th) return showMain(Number(th.dataset.thumb));
  });

  /* ---------- size selection ---------- */
  $('#sizes').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-size]');
    if (!btn || btn.disabled) return;
    sel = Number(btn.dataset.size);
    document.querySelectorAll('#sizes .size').forEach((b, i) => {
      b.classList.toggle('active', i === sel);
      b.setAttribute('aria-pressed', String(i === sel));
    });
    const s = P.sizes[sel];
    $('#priceNow').textContent = aed(s.price);
    $('#sizeNote').textContent = s.note;
    const was = $('#priceWas');
    if (sel === signatureIdx && P.priceWas) was.removeAttribute('hidden');
    else was.setAttribute('hidden', '');
  });

  /* ---------- quantity ---------- */
  const qtyInput = $('#qty');
  function setQty(v) { qty = Math.max(1, Math.floor(v) || 1); qtyInput.value = qty; }
  $('.qty').addEventListener('click', (e) => {
    const b = e.target.closest('[data-qty]');
    if (b) setQty(qty + Number(b.dataset.qty));
  });
  qtyInput.addEventListener('change', () => setQty(parseInt(qtyInput.value, 10)));

  /* ---------- accordion (single-open) ---------- */
  $('#accordion').addEventListener('click', (e) => {
    const head = e.target.closest('.acc__head');
    if (!head) return;
    const acc = head.closest('.acc');
    const wasOpen = acc.classList.contains('open');
    $('#accordion').querySelectorAll('.acc').forEach((a) => {
      a.classList.remove('open');
      a.querySelector('.acc__body').style.maxHeight = '0';
      a.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      acc.classList.add('open');
      acc.querySelector('.acc__body').style.maxHeight = '240px';
      head.setAttribute('aria-expanded', 'true');
    }
  });

  /* ---------- order on WhatsApp ---------- */
  $('#orderBtn').addEventListener('click', () => {
    waOrder(P.name, P.sizes[sel].ml, qty);
    showToast('<span><b>Opening WhatsApp</b> · ' + esc(qty + ' × ' + P.name) + '</span>');
  });

  /* ============================================================
     Scent pyramid
     ============================================================ */
  $('#pyramid').innerHTML =
    '<div class="wrap">' +
      '<div class="eyebrow">The scent pyramid</div>' +
      '<h2 class="pyramid__title">A golden after-dark composition.</h2>' +
      '<div class="pyramid__grid">' +
        '<div class="notes-tabs" id="notesTabs">' +
          P.notes.map((nt, n) =>
            '<button type="button" class="note' + (n === activeNote ? ' active' : '') + '" data-note="' + n + '">' +
            '<span class="note__head"><span class="note__num">0' + (n + 1) + '</span>' +
            '<span class="note__name">' + esc(nt.name) + '</span></span>' +
            '<span class="note__items">' + esc(nt.items) + '</span></button>').join('') +
        '</div>' +
        '<div class="pyramid__visual">' +
          imgTag((P.images[1] || P.images[0]).src, 'Composition', P.name) +
          '<div class="pyramid__cap" id="pyramidCap">' + esc(P.notes[activeNote].desc) + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  const notesTabs = $('#notesTabs');
  function setNote(n) {
    activeNote = n;
    notesTabs.querySelectorAll('.note').forEach((el, k) => el.classList.toggle('active', k === n));
    $('#pyramidCap').textContent = P.notes[n].desc;
  }
  notesTabs.addEventListener('mouseover', (e) => {
    const note = e.target.closest('[data-note]');
    if (note) setNote(Number(note.dataset.note));
  });
  notesTabs.addEventListener('focusin', (e) => {
    const note = e.target.closest('[data-note]');
    if (note) setNote(Number(note.dataset.note));
  });

  /* ============================================================
     Related products
     ============================================================ */
  $('#related').innerHTML =
    '<div class="wrap">' +
      '<div class="related__top">' +
        '<div><div class="eyebrow">The signature trio</div><h2>You may also like</h2></div>' +
        '<a class="related__link" href="/index.html#collection">View the collection →</a>' +
      '</div>' +
      '<div class="cards" id="relatedCards">' +
        P.related.map((r) =>
          '<div class="card" role="link" tabindex="0" data-href="' + esc(productUrl(r.slug)) + '" aria-label="' + esc(r.name) + '">' +
            '<div class="card__img">' + imgTag(r.src, r.name, r.name) +
              '<button class="card__quick" data-order="' + esc(r.name) + '" aria-label="Order ' + esc(r.name) + ' on WhatsApp">+ Order on WhatsApp</button>' +
            '</div>' +
            '<div class="card__meta"><div class="card__name">' + esc(r.name) + '</div>' +
            '<div class="card__notes">' + esc(r.notes) + '</div>' +
            '<div class="card__price">' + aed(r.price) + '</div></div>' +
          '</div>').join('') +
      '</div>' +
    '</div>';
  const relatedCards = $('#relatedCards');
  relatedCards.addEventListener('click', (e) => {
    const quick = e.target.closest('.card__quick');
    if (quick) {
      e.stopPropagation();
      waOrder(quick.dataset.order, '', 1);
      showToast('<span><b>Opening WhatsApp</b> · ' + esc(quick.dataset.order) + '</span>');
      return;
    }
    const card = e.target.closest('.card');
    if (card) window.location.href = card.dataset.href;
  });
  relatedCards.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.card');
    if (card && !e.target.closest('.card__quick')) { e.preventDefault(); window.location.href = card.dataset.href; }
  });

  /* ---------- mobile nav toggle (header is static in product.html) ---------- */
  const menuToggle = $('#menuToggle');
  const nav = $('#nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('open'); menuToggle.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); } });
  }
})();
