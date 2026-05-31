/* Arabian Mist UAE — script.js v3 */

/* ─── DOM REFS ─────────────────────────────────────────── */
const header          = document.querySelector("[data-header]");
const menuButton      = document.querySelector("[data-menu]");
const nav             = document.querySelector("[data-nav]");
const parallaxImage   = document.querySelector("[data-parallax]");
const galleryImage    = document.querySelector("[data-gallery-image]");
const qtyValue        = document.querySelector("[data-qty]");
const minusButton     = document.querySelector("[data-qty-minus]");
const plusButton      = document.querySelector("[data-qty-plus]");
const noteCopy        = document.querySelector("[data-note-copy]");
const accordButtons   = document.querySelectorAll(".accord");
const productGrid     = document.querySelector("[data-product-grid]");
const collectionCount = document.querySelector("[data-collection-count]");
const productTitle    = document.querySelector("[data-product-title]");
const productDesc     = document.querySelector("[data-product-description]");
const buyButton       = document.querySelector("[data-buy]");
const toast           = document.querySelector("[data-toast]");
const navLinks        = document.querySelectorAll(".nav-links a[href^='#']");

/* ─── CONFIG ───────────────────────────────────────────── */
const BUSINESS_WHATSAPP = "971544224930";
const PAGE_SIZE = 6;

/* ─── STATE ────────────────────────────────────────────── */
let quantity        = 1;
let currentPage     = 1;
let selectedProduct = PRODUCTS.find((p) => p.id === "arabian-nights") || PRODUCTS[0];

/* ─── REDUCED MOTION ────────────────────────────────────── */
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─────────────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

const observeRevealItems = () => {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((item, i) => {
    item.style.transitionDelay = reducedMotion ? "0ms" : `${Math.min(i * 60, 240)}ms`;
    revealObserver.observe(item);
  });
};

/* ─────────────────────────────────────────────────────────
   SCROLLSPY — sets aria-current="page" on active nav link
   Uses rootMargin to fire when section crosses ~30% from top
───────────────────────────────────────────────────────── */
const scrollspy = () => {
  const sections = document.querySelectorAll("section[id], main[id]");

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${id}`;
          link.toggleAttribute("aria-current", isActive);
          if (isActive) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-28% 0px -65% 0px", threshold: 0 }
  );

  sections.forEach((s) => spyObserver.observe(s));
};

/* ─────────────────────────────────────────────────────────
   PRODUCT RENDERING
───────────────────────────────────────────────────────── */
const renderProductCard = (product) => {
  const notes = product.notes.join(", ");
  return `
    <article
      class="product-card reveal"
      data-product-id="${product.id}"
      tabindex="0"
      aria-label="View ${product.name}"
    >
      <div class="product-thumb">
        <img
          src="${product.image}"
          alt="${product.name} fragrance by Arabian Mist"
          loading="lazy"
          width="600"
          height="800"
        />
      </div>
      <div class="product-card-content">
        <p>${product.name}</p>
        <span>${notes}</span>
      </div>
      <button
        class="product-buy"
        type="button"
        data-product-buy="${product.id}"
        aria-label="Buy ${product.name} on WhatsApp"
      >Buy on WhatsApp</button>
    </article>
  `;
};

const renderProducts = (page = 1) => {
  const end      = page * PAGE_SIZE;
  const visible  = PRODUCTS.slice(0, end);
  const hasMore  = end < PRODUCTS.length;
  const remaining = PRODUCTS.length - end;

  const cards = visible.map(renderProductCard).join("");
  const loadMore = hasMore
    ? `<div class="product-grid-footer">
         <a class="load-more-btn" href="/collection">
           View all ${PRODUCTS.length} fragrances &rarr;
         </a>
       </div>`
    : "";

  productGrid.innerHTML = cards + loadMore;

  // Update collection count display
  if (collectionCount) {
    collectionCount.textContent = `${PRODUCTS.length} fragrances`;
  }

  // Observe new cards for reveal
  observeRevealItems();

  // Reattach load-more listener
  const btn = productGrid.querySelector("[data-load-more]");
  if (btn) {
    btn.addEventListener("click", () => {
      currentPage += 1;
      renderProducts(currentPage);
      // Focus first new card for keyboard continuity
      const cards = productGrid.querySelectorAll(".product-card");
      const firstNew = cards[(currentPage - 1) * PAGE_SIZE];
      if (firstNew) firstNew.focus();
    });
  }
};

/* ─────────────────────────────────────────────────────────
   ACCORD LOGIC
───────────────────────────────────────────────────────── */
const setActiveAccord = (key = "top") => {
  accordButtons.forEach((btn) => {
    const active = btn.dataset.note === key;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  if (noteCopy && selectedProduct.accords[key]) {
    noteCopy.textContent = selectedProduct.accords[key];
  }
};

/* ─────────────────────────────────────────────────────────
   PRODUCT SELECTION
───────────────────────────────────────────────────────── */
const selectProduct = (product, shouldScroll = true) => {
  selectedProduct = product;
  if (productTitle) productTitle.textContent = product.name;
  if (productDesc)  productDesc.textContent  = product.description;

  // Swap gallery image
  if (galleryImage) {
    galleryImage.src = product.image;
    galleryImage.alt = `${product.name} by Arabian Mist`;
  }

  // Update detail eyebrow to reflect product
  const eyebrow = document.querySelector(".detail-info .eyebrow");
  if (eyebrow) eyebrow.textContent = `Eau de parfum · ${product.size}`;

  setActiveAccord("top");

  if (shouldScroll) {
    document.querySelector("#details")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }
};

/* ─────────────────────────────────────────────────────────
   WHATSAPP
───────────────────────────────────────────────────────── */
const whatsAppUrl = (product) => {
  const msg = [
    "Hi Arabian Mist,",
    `I'd like to order: ${product.name}`,
    `Code: ${product.code}`,
    `Size: ${product.size}`,
    `Quantity: ${quantity}`,
  ].join("\n");
  return `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(msg)}`;
};

/* ─────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────── */
let toastTimer;
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
};

/* ─────────────────────────────────────────────────────────
   MOBILE NAV HELPERS
───────────────────────────────────────────────────────── */
const closeNav = (returnFocus = false) => {
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  if (returnFocus) menuButton.focus();
};

const openNav = () => {
  nav.classList.add("is-open");
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Close menu");
};

/* ─────────────────────────────────────────────────────────
   INITIALISE
───────────────────────────────────────────────────────── */
renderProducts(currentPage);
selectProduct(selectedProduct, false);
observeRevealItems();
scrollspy();

/* ─────────────────────────────────────────────────────────
   EVENTS — Product grid
───────────────────────────────────────────────────────── */
productGrid.addEventListener("click", (e) => {
  // Buy button
  const buyTarget = e.target.closest("[data-product-buy]");
  if (buyTarget) {
    const p = PRODUCTS.find((x) => x.id === buyTarget.dataset.productBuy);
    if (!p) return;
    selectProduct(p, false);
    showToast(`Opening WhatsApp for ${p.name}`);
    setTimeout(() => { window.location.href = whatsAppUrl(p); }, 480);
    return;
  }
  // Card click → open the product detail page
  const card = e.target.closest(".product-card");
  if (!card) return;
  window.location.href = "product.html?slug=" + encodeURIComponent(card.dataset.productId);
});

productGrid.addEventListener("keydown", (e) => {
  if (e.target.closest("button")) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".product-card");
  if (!card) return;
  e.preventDefault();
  window.location.href = "product.html?slug=" + encodeURIComponent(card.dataset.productId);
});

/* ─────────────────────────────────────────────────────────
   EVENTS — Detail section
───────────────────────────────────────────────────────── */
buyButton.addEventListener("click", () => {
  showToast(`Opening WhatsApp — ${quantity} × ${selectedProduct.name}`);
  setTimeout(() => { window.location.href = whatsAppUrl(selectedProduct); }, 480);
});

accordButtons.forEach((btn) => {
  btn.addEventListener("click", () => setActiveAccord(btn.dataset.note));
});

minusButton.addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  qtyValue.textContent = quantity;
});

plusButton.addEventListener("click", () => {
  quantity = Math.min(9, quantity + 1);
  qtyValue.textContent = quantity;
});

/* ─────────────────────────────────────────────────────────
   EVENTS — Mobile nav
───────────────────────────────────────────────────────── */
menuButton.addEventListener("click", () => {
  nav.classList.contains("is-open") ? closeNav() : openNav();
});

// Close on nav link click
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeNav());
});

// Close on Escape key (return focus to burger)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) {
    closeNav(true);
  }
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (
    nav.classList.contains("is-open") &&
    !nav.contains(e.target) &&
    !menuButton.contains(e.target)
  ) {
    closeNav();
  }
});

/* ─────────────────────────────────────────────────────────
   HEADER STATE — transparent on hero, cream once hero scrolls out
   Uses IntersectionObserver instead of scrollY threshold so the
   header only turns cream when the hero is actually out of view.
───────────────────────────────────────────────────────── */
const heroSection = document.querySelector(".hero");
if (heroSection) {
  new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    },
    { threshold: 0.08 } /* triggers when <8% of hero remains visible */
  ).observe(heroSection);
}

/* ─────────────────────────────────────────────────────────
   EVENTS — Scroll (parallax only — header state handled above)
───────────────────────────────────────────────────────── */
window.addEventListener(
  "scroll",
  () => {
    if (parallaxImage && !reducedMotion) {
      const rect = parallaxImage.getBoundingClientRect();
      const progress =
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const shift = Math.max(-22, Math.min(22, (progress - 0.5) * 44));
      parallaxImage.style.setProperty("--shift", `${shift}px`);
    }
  },
  { passive: true }
);
