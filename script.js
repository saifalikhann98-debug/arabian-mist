const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu]");
const nav = document.querySelector("[data-nav]");
const revealItems = document.querySelectorAll(".reveal");
const parallaxImage = document.querySelector("[data-parallax]");
const qtyValue = document.querySelector("[data-qty]");
const minusButton = document.querySelector("[data-qty-minus]");
const plusButton = document.querySelector("[data-qty-plus]");
const noteCopy = document.querySelector("[data-note-copy]");
const accordButtons = document.querySelectorAll(".accord");
const productCards = document.querySelectorAll(".product-card");
const productTitle = document.querySelector("[data-product-title]");
const productPrice = document.querySelector("[data-product-price]");
const productDescription = document.querySelector("[data-product-description]");
const addButton = document.querySelector("[data-add]");
const toast = document.querySelector("[data-toast]");

const notes = {
  incense: "Frankincense and bakhoor smoke give the opening a mineral glow before the mist settles on skin.",
  iris: "Powdered orris adds a cream-soft elegance, keeping the perfume refined rather than heavy.",
  musk: "White musk warms the drydown with a close, clean trail that lasts through the evening.",
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
  observer.observe(item);
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);

  if (parallaxImage) {
    const rect = parallaxImage.getBoundingClientRect();
    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const shift = Math.max(-22, Math.min(22, (progress - 0.5) * 44));
    parallaxImage.style.setProperty("--shift", `${shift}px`);
  }
});

menuButton.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("is-open"));
});

let quantity = 1;

minusButton.addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  qtyValue.textContent = quantity;
});

plusButton.addEventListener("click", () => {
  quantity = Math.min(9, quantity + 1);
  qtyValue.textContent = quantity;
});

accordButtons.forEach((button) => {
  button.addEventListener("click", () => {
    accordButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    noteCopy.textContent = notes[button.dataset.note];
  });
});

productCards.forEach((card) => {
  const selectProduct = () => {
    productTitle.textContent = card.dataset.product;
    productPrice.textContent = card.dataset.price;
    productDescription.textContent = card.dataset.description;
    document.querySelector("#details").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  card.addEventListener("click", selectProduct);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectProduct();
    }
  });
});

addButton.addEventListener("click", () => {
  toast.textContent = `${quantity} × ${productTitle.textContent} added to bag`;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
});
