/* ============================================================
   Arabian Mist UAE — Collection page (all products)
   Renders the full catalog (data/products.js) into the same card
   grid used on the homepage, with no pagination.
   ============================================================ */
const BUSINESS_WHATSAPP = "971544224930"; // store WhatsApp number (digits only, intl)

(function () {
  "use strict";

  /* PRODUCTS is a top-level const in data/products.js (shared global scope) */
  const CATALOG = (typeof PRODUCTS !== "undefined" && PRODUCTS) ? PRODUCTS : (window.PRODUCTS || []);
  const grid = document.querySelector("[data-product-grid]");
  const countEl = document.querySelector("[data-collection-count]");
  const toast = document.querySelector("[data-toast]");

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const absUrl = (u) => (/^(https?:|\/)/.test(u) ? u : "/" + u); // root-absolute (works at any URL depth)

  const cardHTML = (p) => `
    <article class="product-card" data-product-id="${esc(p.id)}" tabindex="0" aria-label="View ${esc(p.name)}">
      <div class="product-thumb">
        <img src="${esc(absUrl(p.image))}" alt="${esc(p.name)} by Arabian Mist" loading="lazy" width="600" height="800" />
      </div>
      <div class="product-card-content">
        <p>${esc(p.name)}</p>
        <span>${esc((p.notes || []).join(", "))}</span>
      </div>
      <button class="product-buy" type="button" data-product-buy="${esc(p.id)}" aria-label="Buy ${esc(p.name)} on WhatsApp">Buy on WhatsApp</button>
    </article>`;

  if (grid) grid.innerHTML = CATALOG.map(cardHTML).join("");
  if (countEl) countEl.textContent = `${CATALOG.length} fragrances`;

  const whatsAppUrl = (p) => {
    const msg = ["Hi Arabian Mist,", `I'd like to order: ${p.name}`, `Code: ${p.code}`, `Size: ${p.size}`, "Quantity: 1"].join("\n");
    return `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  };

  let toastTimer;
  const showToast = (m) => {
    if (!toast) return;
    toast.textContent = m;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  const goToProduct = (id) => { window.location.href = "product.html?slug=" + encodeURIComponent(id); };

  if (grid) {
    grid.addEventListener("click", (e) => {
      const buy = e.target.closest("[data-product-buy]");
      if (buy) {
        const p = CATALOG.find((x) => x.id === buy.dataset.productBuy);
        if (!p) return;
        showToast(`Opening WhatsApp for ${p.name}`);
        setTimeout(() => { window.location.href = whatsAppUrl(p); }, 420);
        return;
      }
      const card = e.target.closest(".product-card");
      if (card) goToProduct(card.dataset.productId);
    });
    grid.addEventListener("keydown", (e) => {
      if (e.target.closest("button")) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".product-card");
      if (!card) return;
      e.preventDefault();
      goToProduct(card.dataset.productId);
    });
  }

  /* mobile nav toggle (same pattern as the homepage) */
  const menu = document.querySelector("[data-menu]");
  const nav = document.querySelector("[data-nav]");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menu.setAttribute("aria-expanded", "false");
    }));
  }
})();
