# Arabian Mist UAE — Visual Redesign Spec v1
**Prepared for Codex handoff · May 2026**
All values are implementation-ready for plain HTML/CSS/JS. No framework assumed.

---

## 1. Executive Diagnosis

1. **`.eyebrow` class is undefined in CSS.** Every section uses `class="eyebrow"` but only `.hero-eyebrow` is styled. All non-hero section labels (intro, feature-split, ritual, detail, atelier) render as unstyled body text. Fix this first.

2. **`.purchase-row` has no flex/grid declaration.** Desktop layout stacks quantity + add-button vertically. Only fixed at ≤560px via `flex-direction: column`. The desktop state is broken by omission.

3. **Atelier band has wrong child count for its grid.** `.band` is a 2-col grid; `.atelier` has 3 direct children (eyebrow `<p>`, `<h2>`, `<a>`). The button falls into col-1 of row 2, leaving col-2 empty. The CTA never right-aligns as intended.

4. **Product cards are under-designed for luxury.** `padding: 1rem` is too cramped; no visible CTA on the card; `min-height: 25rem` is a magic number that collapses on narrow viewports; card `<p>` product name font-size of `1.8rem` conflicts with the Cormorant sizing scale; the `<span>` note descriptor font-size is not set (inherits body ~1rem).

5. **Icon buttons use Unicode glyphs.** `⌕` and `◌` render inconsistently across OS and browser. They have no fallback and the glyph font-size (1.25rem) inside a 2.55rem button gives poor optical centering.

6. **`detail-info { position: sticky; top: 4.8rem }` is a magic number.** Should use `var(--header-offset)`. Currently under-compensates on desktop where the notice bar + header exceed 4.8rem combined.

7. **No `:focus-visible` styles defined.** `product-card { outline: 0 }` explicitly removes the focus ring with no replacement. All `<button>`, `<a>`, `<details>`, `<summary>` elements are keyboard-inaccessible.

8. **Section vertical rhythm is inconsistent.** `product-grid` uses `var(--space-7)` (4.5rem) for top padding but `var(--section-y)` for bottom. `feature-split` uses `max(var(--section-y), var(--header-offset))` as top padding — compensating for scroll-offset rather than owning its own spacing.

9. **`--gold: #c5a05b` on `--porcelain: #fbf4e8` fails WCAG AA** for text smaller than 18px. The `.text-link`, accord buttons, eyebrow labels, and nav underline all use gold on light backgrounds at small sizes. Contrast ratio ≈ 2.8:1 (threshold: 4.5:1).

10. **Footer is a placeholder.** Two rows, no legal text, no secondary brand info, no visual separation from the atelier section above it. Charcoal background bleeds directly from atelier gradient into footer — sections merge visually.

---

## 2. Design System v1

### 2a. Color Tokens

```css
:root {
  /* Base surfaces */
  --c-paper:      #f5ead6;   /* Primary warm background — slightly richer than current #eee6d8 */
  --c-porcelain:  #faf3e4;   /* Card/panel surface */
  --c-linen:      #ede2cc;   /* Subtle section tint, dividers */

  /* Ink */
  --c-ink:        #0e0d0b;   /* Primary text — near-black with warm tint */
  --c-smoke:      #5a5044;   /* Secondary body text. Contrast vs --c-porcelain: 5.6:1 ✓ */
  --c-mist:       #8c7e6e;   /* Tertiary / captions. Use only ≥16px */

  /* Brand */
  --c-wine:       #2a0705;   /* Deep burgundy — CTAs, notice bar, accents */
  --c-burgundy:   #4b1014;   /* Mid burgundy — gradients, hover states */
  --c-charcoal:   #100f0e;   /* Dark sections (ritual, footer) */

  /* Gold — use for accents only, never for body text on light bg */
  --c-gold:       #b8924a;   /* Darkened from #c5a05b — contrast vs white: 3.6:1 (use ≥24px) */
  --c-gold-rich:  #7a5e28;   /* For small gold text on light bg — contrast: 6.2:1 ✓ */
  --c-gold-light: #e8cc88;   /* Gold highlight on dark backgrounds */

  /* Utility */
  --c-line:       rgba(14, 13, 11, 0.12);  /* Borders on light bg */
  --c-line-dark:  rgba(245, 234, 214, 0.16); /* Borders on dark bg */
  --c-overlay:    rgba(10, 8, 6, 0.52);    /* Image overlays */
}
```

**Usage rules:**
- `--c-gold` is decoration only (underlines, icons, ornamental spans). Never use it for paragraph text under 24px.
- `--c-gold-rich` is the ONLY gold variant permitted for small-text labels (eyebrows, captions, nav sub-labels) on light backgrounds.
- `--c-wine` on `--c-porcelain`: contrast 13.4:1 ✓ — safe for all text sizes.
- `--c-smoke` on `--c-paper`: contrast 5.6:1 ✓ — safe for body text.
- Do not add opacity to colored text; use a lighter token instead.

---

### 2b. Typography Scale

**Typefaces (unchanged):** `"Cormorant Garamond"` (serif, display) + `"Inter"` (sans, UI)

```css
:root {
  /* Display — Cormorant Garamond, always */
  --t-d1: clamp(5.5rem, 13vw, 10rem);    /* Hero H1. weight 600, ls -0.025em, lh 0.88 */
  --t-d2: clamp(3.2rem, 5.5vw, 5.5rem);  /* Section H2. weight 600, ls -0.02em, lh 0.94 */
  --t-d3: clamp(2rem, 3.2vw, 3rem);      /* Sub-section H2 (ritual steps). weight 500, ls -0.01em, lh 1.02 */
  --t-d4: clamp(1.6rem, 2.2vw, 2rem);    /* Card title, detail H2. weight 600, ls 0em, lh 1.1 */

  /* Body — Inter */
  --t-body-lg: clamp(1.05rem, 1.6vw, 1.22rem); /* Lead body text. weight 400, lh 1.85 */
  --t-body:    1rem;                            /* Default body. weight 400, lh 1.75 */
  --t-body-sm: 0.9rem;                          /* Secondary descriptors. weight 400, lh 1.7 */

  /* UI — Inter */
  --t-label:   0.72rem;   /* Eyebrows, nav, button text. weight 700, ls 0.16em, uppercase */
  --t-caption: 0.65rem;   /* Small metadata. weight 600, ls 0.12em, uppercase */
  --t-price:   1.3rem;    /* Price display. weight 700, ls 0.02em */
}
```

**Applied rules:**
- All H1, H2, H3 → Cormorant Garamond
- All UI text (buttons, nav, labels, prices, captions) → Inter
- Body paragraphs → Inter
- Never mix serif + sans within a single UI element
- Line lengths: body copy `max-width: 65ch`; lead copy `max-width: 48ch`; headlines unconstrained by `ch` (use pixel/rem max-width)

---

### 2c. Spacing Scale

Single 4-point base system. Named tokens map to multiples of 4px (0.25rem):

```css
:root {
  --sp-1:  0.25rem;   /*  4px — micro gaps, icon padding */
  --sp-2:  0.5rem;    /*  8px — tight inline gaps */
  --sp-3:  0.75rem;   /* 12px — compact stack gaps */
  --sp-4:  1rem;      /* 16px — default gap, small padding */
  --sp-5:  1.5rem;    /* 24px — card padding, form gaps */
  --sp-6:  2rem;      /* 32px — section-internal gaps */
  --sp-7:  3rem;      /* 48px — between content groups */
  --sp-8:  4.5rem;    /* 72px — section top/bottom padding (min) */
  --sp-9:  6.5rem;    /* 104px — large section padding */
  --sp-10: 9rem;      /* 144px — hero content bottom offset */

  /* Semantic aliases */
  --section-y:   clamp(var(--sp-8), 9vw, var(--sp-9));  /* Section top+bottom padding */
  --section-gap: clamp(var(--sp-6), 5vw, var(--sp-9));  /* Column gap in split layouts */
  --page-x:      clamp(1.25rem, 6vw, 6rem);             /* Horizontal page margin */
  --card-pad:    clamp(var(--sp-5), 2.5vw, var(--sp-7)); /* Card internal padding */
}
```

---

### 2d. Radius, Border, Shadow, Container

```css
:root {
  /* Radius — this brand is sharp/editorial; minimal rounding */
  --r-none:   0px;
  --r-xs:     2px;    /* Accord pill buttons only */
  --r-sm:     4px;    /* Toast notification */
  /* No border-radius on cards, sections, or images — keep angular */

  /* Borders */
  --border-thin:   1px solid var(--c-line);
  --border-gold:   1px solid var(--c-gold);
  --border-dark:   1px solid var(--c-line-dark);

  /* Shadows */
  --shadow-card:   0 8px 32px rgba(14, 10, 6, 0.10), 0 2px 8px rgba(14, 10, 6, 0.06);
  --shadow-lifted: 0 24px 64px rgba(14, 10, 6, 0.18), 0 6px 20px rgba(14, 10, 6, 0.10);
  --shadow-header: 0 4px 24px rgba(14, 10, 6, 0.08);
  --shadow-toast:  0 12px 40px rgba(14, 10, 6, 0.28);

  /* Containers */
  --container-wide:   88rem;   /* Max page content width */
  --container-text:   68rem;   /* Ritual, atelier, centered text sections */
  --container-narrow: 42rem;   /* Detail panel, single-column text */
}
```

---

### 2e. Grid / Layout Rules

**Desktop (>1200px):**
- Page margin: `var(--page-x)` = 6rem
- Feature split: `grid-template-columns: 0.86fr 1.14fr` (copy left, image right) ✓ keep
- Detail page: `grid-template-columns: 1fr 0.76fr` (gallery left, info right — info narrower for editorial feel)
- Product grid: `grid-template-columns: repeat(3, 1fr)`, `gap: var(--sp-5)`
- Band (intro, atelier): `grid-template-columns: 1fr 1fr`, aligned top — fix atelier child count (see §3)

**Tablet (901–1200px):**
- Page margin: `var(--page-x)` = clamp(1.25rem, 6vw, 6rem) (no change needed)
- Product grid: 3 columns → 2 columns (add breakpoint at 1000px)
- Feature split: stays 2-column down to 900px

**Mobile (≤900px):**
- All multi-column grids → 1 column
- Page margin: clamp(1.25rem, 5vw, 2rem)

**Mobile compact (≤560px):**
- Page margin: 1.25rem fixed

---

## 3. Section-by-Section Redesign Spec

### 3a. Notice Bar

**Current:** Correct concept, minor tweaks needed.

**Changes:**
- Font: Inter, `var(--t-caption)` (0.65rem), weight 700, ls 0.14em, uppercase
- Padding: `0.6rem var(--page-x)` (currently uses `1rem` fixed)
- Background: `var(--c-wine)` ✓
- Color: `#f5dfb0` ✓
- Add a thin gold ornamental separator `·` or `—` between text if content expands to multiple offers

---

### 3b. Header

**Current issues:** 3-col grid with `1fr auto 1fr` works structurally but icon-button sizes are 2.55rem (below 44px tap target); Unicode icon glyphs; no active nav state; missing `:focus-visible` style.

**Exact changes:**

```css
.site-header {
  padding: 0 var(--page-x);
  height: clamp(3.8rem, 7vw, 5rem);         /* Fixed height instead of padding-based */
  grid-template-columns: 1fr auto 1fr;
  /* backdrop-filter: blur(18px) ✓ keep */
}

.icon-button,
.menu-button {
  width: 2.75rem;    /* 44px — meets tap target minimum */
  height: 2.75rem;
  border: var(--border-thin);
  border-radius: var(--r-none);
}

/* Focus style — add globally */
:focus-visible {
  outline: 2px solid var(--c-gold-rich);
  outline-offset: 3px;
}

.nav-links a {
  font-size: var(--t-label);    /* 0.72rem */
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--c-smoke);        /* Not full ink — softer default */
}
.nav-links a:hover,
.nav-links a[aria-current="page"] {
  color: var(--c-wine);
}
.nav-links a::after {
  background: var(--c-gold-rich);  /* Was --gold which fails contrast */
  height: 1px;
}
```

**Replace icons:** Replace `⌕` and `◌` Unicode with inline SVG paths (16×16). Search: magnifier; Bag: rounded rect with handle arc. Both stroked, not filled. Stroke color: `var(--c-ink)`.

**Logo — no changes needed.** The gradient lettermark is strong. Keep it.

---

### 3c. Hero

**Current issues:** Hero text is well-structured but `hero-content` padding uses `clamp(6rem, 14vw, 12rem)` for top only — the content starts low and the eyebrow is far from the top. On tall viewports (>900px tall) the text floats too low. The hero shade gradient works well.

**Exact changes:**

```css
.hero-content {
  padding: 0 var(--page-x) clamp(var(--sp-8), 12vw, var(--sp-10));
  /* Bottom padding only — content aligned to bottom-left (keep current alignment: flex-end) */
  max-width: 56rem;   /* Wider than 48rem for large screens */
}

.hero-eyebrow {
  /* Rename class to just .eyebrow in hero too — unify (see eyebrow fix below) */
  color: var(--c-gold-light);    /* Light gold on dark bg */
  font-size: var(--t-label);
  font-weight: 700;
  letter-spacing: 0.2em;
  margin-bottom: var(--sp-5);   /* 24px — was 1.2rem */
}

.hero h1 {
  font-size: var(--t-d1);        /* clamp(5.5rem, 13vw, 10rem) */
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 0.88;
  margin: 0 0 var(--sp-6);       /* 32px below headline */
  max-width: 12ch;                /* Slightly wider than 10ch */
}

.hero-copy {
  font-size: var(--t-body-lg);
  line-height: 1.85;
  max-width: 40rem;
  margin: 0 0 var(--sp-7);       /* 48px above buttons */
  color: rgba(245, 234, 214, 0.82);
}

.hero-actions {
  gap: var(--sp-4);   /* 16px — was 0.8rem */
}
```

**Buttons in hero:**
- Primary: `background: #f5ead6; color: var(--c-wine); border-color: #f5ead6`
- Ghost: `border: 1px solid rgba(245, 234, 214, 0.45); color: #f5ead6`
- Ghost hover: `background: rgba(245, 234, 214, 0.08); border-color: rgba(245, 234, 214, 0.7)`
- Both: `min-height: 3rem; padding: 0 1.75rem; font-size: var(--t-label); letter-spacing: 0.14em`

**Image treatment:** Keep `object-fit: cover`, keep heroZoom animation. Add `object-position: center 30%` to keep bottle tops in frame on wide viewports.

---

### 3d. Intro Band

**Current issues:** 2-col grid with eyebrow+h2 in col-1, large paragraph in col-2. No `align-items` set — cells align to `stretch` default. The `.intro p:last-child` margin-top of 2.1rem is irrelevant in grid layout. The `eyebrow` class has no CSS.

**Fix eyebrow (apply globally — single declaration, affects all sections):**

```css
.eyebrow {
  color: var(--c-gold-rich);      /* #7a5e28 — passes AA on light bg */
  display: block;
  font-family: var(--sans);
  font-size: var(--t-label);      /* 0.72rem */
  font-weight: 700;
  letter-spacing: 0.2em;
  margin-bottom: var(--sp-4);     /* 16px */
  text-transform: uppercase;
}
/* On dark sections override: */
.ritual .eyebrow,
.atelier .eyebrow {
  color: var(--c-gold-light);     /* #e8cc88 on dark bg */
}
```

**Intro band layout:**

```css
.band {
  display: grid;
  gap: var(--section-gap);
  grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
  align-items: start;             /* Add this — was unset */
  padding: var(--section-y) var(--page-x);
  max-width: var(--container-wide);
  margin: 0 auto;                 /* Center wide sections */
}

.intro > div {
  /* eyebrow + h2 wrapper — no change needed */
}

.intro h2 {
  font-size: var(--t-d2);         /* clamp(3.2rem, 5.5vw, 5.5rem) */
  font-weight: 600;
  line-height: 0.94;
  letter-spacing: -0.02em;
  margin: 0;
  max-width: 14ch;
}

.intro p:last-child {
  color: var(--c-smoke);
  font-size: var(--t-body-lg);
  line-height: 1.85;
  margin: 0;                      /* Remove top margin — grid gap handles spacing */
  max-width: 42ch;
  align-self: end;                /* Sits at the bottom of its cell */
}
```

---

### 3e. Feature Split

**Current issues:** Feature-copy h2 has `margin-top: var(--space-6)` (3rem) after eyebrow — excessive. The feature-media aspect-ratio of `16/11` is fine. Image has no alt composition guidance.

**Exact changes:**

```css
.feature-split {
  align-items: center;            /* Was 'start' — center for visual balance */
  padding: var(--section-y) var(--page-x);
  max-width: var(--container-wide);
  margin: 0 auto;
  /* Remove: padding-top: max(var(--section-y), var(--header-offset)) — no longer needed */
}

.feature-copy h2 {
  font-size: var(--t-d2);
  line-height: 0.94;
  margin-top: var(--sp-5);        /* 24px — was var(--space-6) = 3rem */
  max-width: 10ch;
}

.feature-copy p:not(.eyebrow) {
  color: var(--c-smoke);
  font-size: var(--t-body-lg);
  line-height: 1.85;
  margin: var(--sp-6) 0 var(--sp-7);   /* 32px top, 48px bottom */
  max-width: 40ch;
}

.feature-media {
  aspect-ratio: 3 / 4;            /* Changed: portrait crop is more editorial for perfume */
  box-shadow: var(--shadow-lifted);
}

.text-link {
  color: var(--c-ink);
  font-size: var(--t-label);
  font-weight: 700;
  letter-spacing: 0.14em;
  border-bottom: 1px solid var(--c-gold-rich);
  padding-bottom: 0.3rem;
  transition: color 200ms ease, border-color 200ms ease;
}
.text-link:hover {
  color: var(--c-wine);
  border-color: var(--c-wine);
}
```

**Image treatment:** `object-fit: cover; object-position: center 20%` — keeps bottle tops and label in frame. No border-radius. Overflow hidden on `.feature-media`.

---

### 3f. Product Grid / Cards

**Current issues:** Most critical section to fix. Cards are cramped (1rem padding), no CTA visible, product name uses serif at 1.8rem without line-height, note descriptor has no explicit font-size, price has no visual weight, card background `--porcelain` blends into page background `--paper` (similar hue), no visible "action" affordance.

**Card structure — change HTML to add a CTA per card:**

```html
<article class="product-card reveal" …>
  <div class="product-thumb photo">
    <img … />
    <div class="card-quick-add">
      <button class="button card-cta" type="button">Add to bag</button>
    </div>
  </div>
  <div class="card-body">
    <p class="card-name">Arabian Nights</p>
    <span class="card-notes">Oud, saffron, black vanilla</span>
    <div class="card-footer">
      <strong class="card-price">AED 640</strong>
      <button class="card-view" type="button" aria-label="View Arabian Nights details">View →</button>
    </div>
  </div>
</article>
```

**Card CSS:**

```css
.product-grid {
  display: grid;
  gap: var(--sp-5);                        /* 24px — was var(--space-4) = 1.5rem */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: var(--section-y) var(--page-x);
  max-width: var(--container-wide);
  margin: 0 auto;
}

.product-card {
  background: var(--c-porcelain);
  border: var(--border-thin);
  cursor: pointer;
  padding: 0;                              /* Remove 1rem — handled by inner elements */
  outline: none;
  position: relative;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.product-card:hover,
.product-card:focus-visible {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lifted);
}
/* Override global focus-visible for cards (uses transform instead of outline) */
.product-card:focus-visible {
  outline: 2px solid var(--c-gold-rich);
  outline-offset: 2px;
}

.product-thumb {
  aspect-ratio: 3 / 4;                    /* Portrait — better for perfume bottle */
  overflow: hidden;
  position: relative;
  margin-bottom: 0;                        /* Was 1.25rem — remove, handled by card-body */
  background: #1a1410;                     /* Dark fallback while image loads */
}
.product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 15%;
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
.product-card:hover .product-thumb img {
  transform: scale(1.06);                 /* Was 1.04 — slightly more dramatic */
}

/* Quick-add overlay */
.card-quick-add {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--sp-4);
  background: linear-gradient(to top, rgba(14, 10, 6, 0.72), transparent);
  transform: translateY(100%);
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  justify-content: center;
}
.product-card:hover .card-quick-add,
.product-card:focus-within .card-quick-add {
  transform: translateY(0);
}
.card-cta {
  background: #f5ead6;
  border-color: #f5ead6;
  color: var(--c-wine);
  min-height: 2.75rem;
  font-size: var(--t-caption);
  letter-spacing: 0.14em;
  width: 100%;
  font-weight: 700;
}

.card-body {
  padding: var(--sp-5) var(--sp-5) var(--sp-6);  /* 24px sides, 32px bottom */
}

.card-name {
  font-family: var(--serif);
  font-size: var(--t-d4);                  /* clamp(1.6rem, 2.2vw, 2rem) */
  font-weight: 600;
  line-height: 1.1;
  margin: 0 0 var(--sp-2);
  letter-spacing: 0em;
  color: var(--c-ink);
}

.card-notes {
  display: block;
  color: var(--c-smoke);
  font-size: var(--t-body-sm);             /* 0.9rem — explicit, was inherited */
  line-height: 1.5;
  margin-bottom: var(--sp-6);             /* 32px before price row */
}

.card-footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.card-price {
  font-family: var(--sans);
  font-size: var(--t-price);              /* 1.3rem */
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--c-ink);
}

.card-view {
  background: none;
  border: none;
  color: var(--c-gold-rich);
  font-size: var(--t-caption);
  font-weight: 700;
  letter-spacing: 0.1em;
  cursor: pointer;
  padding: 0;
  text-transform: uppercase;
  transition: color 180ms ease;
}
.card-view:hover {
  color: var(--c-wine);
}
```

---

### 3g. Ritual Block

**Current issues:** `.ritual-steps div` uses `padding: 1.2rem 1.2rem 0 0` — asymmetric and too tight. The step number span in `var(--gold)` on `var(--charcoal)`: contrast 3.8:1 (fails AA). The `min-height: 11rem` on step cells is arbitrary.

**Exact changes:**

```css
.ritual {
  background: var(--c-charcoal);
  color: #f5ead6;
  padding: var(--section-y) var(--page-x);
}

.ritual-inner {
  margin: 0 auto;
  max-width: var(--container-text);       /* 68rem — was 78rem, tighter is better */
}

.ritual h2 {
  font-size: var(--t-d2);
  max-width: 16ch;
  margin-bottom: 0;
}

.ritual-steps {
  border-top: var(--border-dark);
  display: grid;
  gap: 0;
  grid-template-columns: repeat(3, 1fr);
  margin-top: var(--sp-8);               /* 72px — was 3rem */
}

.ritual-steps div {
  border-right: var(--border-dark);
  padding: var(--sp-6) var(--sp-7) var(--sp-7) 0;  /* 32px top, 48px right, 48px bottom */
  min-height: auto;                       /* Remove hard min-height */
}
.ritual-steps div:last-child {
  border-right: none;
}

.ritual-steps span {
  color: var(--c-gold-light);             /* #e8cc88 — contrast vs charcoal: 6.4:1 ✓ */
  font-size: var(--t-caption);
  font-weight: 700;
  letter-spacing: 0.2em;
  display: block;
  margin-bottom: var(--sp-5);
}

.ritual-steps p {
  font-family: var(--serif);
  font-size: var(--t-d3);                /* clamp(2rem, 3.2vw, 3rem) */
  font-weight: 500;
  line-height: 1.05;
  margin: 0;
  color: #f5ead6;
}
```

---

### 3h. Product Detail Section

**Current issues:** `detail-info { position: sticky; top: 4.8rem }` — hardcoded offset. `detail-page { gap: 0 }` — no breathing room. Price not styled with a token. Accord buttons need better active state. Purchase row has no flex declaration. `add-button { min-width: min(18rem, 100%) }` is redundant once purchase-row is fixed.

**Exact changes:**

```css
.detail-page {
  background: var(--c-porcelain);
  display: grid;
  gap: 0;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.76fr);
  /* Narrower info panel vs current 0.82fr — more gallery presence */
}

.detail-gallery {
  background: var(--c-linen);            /* Was #ded4c6 — use token */
  min-height: 70vh;
  position: sticky;
  top: 0;
  overflow: hidden;
}
/* Move sticky to gallery not info — gallery stays fixed while info scrolls */

.detail-gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 10%;
}

.detail-info {
  padding: var(--section-y) clamp(var(--sp-7), 5vw, var(--sp-9)) var(--section-y) var(--sp-7);
  position: static;                      /* Remove sticky from info — gallery sticks instead */
  align-self: start;
}

.detail-info h2 {
  font-family: var(--serif);
  font-size: var(--t-d2);
  font-weight: 600;
  line-height: 0.94;
  margin: var(--sp-4) 0 0;
  letter-spacing: -0.02em;
}

.price {
  font-size: var(--t-price);             /* 1.3rem */
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--c-ink);
  margin: var(--sp-5) 0 0;
}

.accord {
  border: var(--border-thin);
  background: transparent;
  border-radius: var(--r-xs);            /* 2px — minimal */
  font-size: var(--t-caption);
  font-weight: 700;
  letter-spacing: 0.12em;
  min-height: 2.75rem;                   /* 44px tap target */
  padding: 0 var(--sp-5);
  text-transform: uppercase;
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
  cursor: pointer;
}
.accord:hover {
  border-color: var(--c-ink);
  background: var(--c-linen);
}
.accord.active {
  background: var(--c-ink);
  border-color: var(--c-ink);
  color: #f5ead6;
}

/* Fix purchase-row */
.purchase-row {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin: var(--sp-7) 0 0;
}

.add-button {
  flex: 1;
  min-width: 0;                          /* Remove min-width hack */
}

.quantity {
  min-height: 2.75rem;                   /* Match tap target */
  grid-template-columns: 2.75rem 2.75rem 2.75rem;
}
```

---

### 3i. Atelier Band

**Current issues:** 3 direct children in a 2-col grid = broken layout. Button falls to row 2, col 1.

**Fix HTML — wrap h2 + button in a single grid cell:**

```html
<section class="atelier band reveal" id="atelier">
  <div class="atelier-left">
    <p class="eyebrow">Atelier service</p>
    <h2>A private consultation for gifting, layering, and signature scent wardrobes.</h2>
  </div>
  <div class="atelier-right">
    <p>Every bottle is composed for a specific skin chemistry. Book a 30-minute session and leave with a curated wardrobe.</p>
    <a class="button primary" href="mailto:atelier@arabianmist.example">Book appointment</a>
  </div>
</section>
```

**CSS:**

```css
.atelier {
  align-items: center;
  background: linear-gradient(135deg, var(--c-wine) 0%, var(--c-burgundy) 55%, var(--c-charcoal) 100%);
  color: #f5ead6;
}

.atelier-left h2 {
  font-size: var(--t-d2);
  max-width: 15ch;
  line-height: 0.94;
  margin-top: var(--sp-5);
}

.atelier-right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-7);
}

.atelier-right p {
  font-size: var(--t-body-lg);
  line-height: 1.85;
  color: rgba(245, 234, 214, 0.78);
  max-width: 38ch;
}

.atelier .button.primary {
  background: rgba(245, 234, 214, 0.12);
  border: 1px solid rgba(245, 234, 214, 0.45);
  color: #f5ead6;
  min-height: 3rem;
  padding: 0 2rem;
  font-size: var(--t-label);
  font-weight: 700;
  letter-spacing: 0.14em;
  transition: background 220ms ease, border-color 220ms ease;
}
.atelier .button.primary:hover {
  background: rgba(245, 234, 214, 0.22);
  border-color: rgba(245, 234, 214, 0.7);
}
```

---

### 3j. Footer

**Current issues:** Very sparse, no visual weight, no copyright, no secondary links, no separation from atelier.

**Change HTML:**

```html
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-top">
      <a class="footer-brand logo-lockup" href="#top" aria-label="Arabian Mist UAE home">
        <span class="logo-mark" aria-hidden="true">AM</span>
        <span class="logo-text">
          <span>Arabian Mist</span>
          <small>UAE</small>
        </span>
      </a>
      <nav class="footer-nav" aria-label="Footer navigation">
        <a href="#collection">Collection</a>
        <a href="#details">Product</a>
        <a href="#ritual">Ritual</a>
        <a href="#atelier">Atelier</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <p class="footer-legal">© 2026 Arabian Mist UAE. All rights reserved.</p>
      <p class="footer-tagline">Crafted in the UAE.</p>
    </div>
  </div>
</footer>
```

**CSS:**

```css
.footer {
  background: var(--c-charcoal);
  border-top: var(--border-dark);         /* Separates from atelier */
  color: #f5ead6;
  padding: var(--sp-9) var(--page-x) var(--sp-8);
}

.footer-inner {
  max-width: var(--container-wide);
  margin: 0 auto;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: var(--sp-8);
  border-bottom: var(--border-dark);
  margin-bottom: var(--sp-6);
}

.footer-nav {
  display: flex;
  gap: var(--sp-7);
  font-size: var(--t-label);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.footer-nav a {
  color: rgba(245, 234, 214, 0.65);
  transition: color 180ms ease;
}
.footer-nav a:hover {
  color: #f5ead6;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-legal,
.footer-tagline {
  font-size: var(--t-caption);
  color: rgba(245, 234, 214, 0.4);
  letter-spacing: 0.1em;
  margin: 0;
  text-transform: uppercase;
}

.footer .logo-text span {
  color: var(--c-gold-light);
}
```

---

## 4. Responsive Rules

### Breakpoint: ≤1200px

```css
@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);  /* 3→2 columns */
  }
  /* 3rd card becomes full-width or left-aligned — acceptable */
  .product-grid .product-card:nth-child(3) {
    max-width: 50%;  /* Don't stretch to full width */
  }
}
```

**Typography:** clamp values handle this range automatically. No manual overrides needed.

---

### Breakpoint: ≤900px

```css
@media (max-width: 900px) {
  /* Nav: collapses to mobile menu (keep existing logic) */
  .site-header {
    grid-template-columns: 1fr auto;
  }
  .menu-button {
    display: inline-flex;
  }
  .nav-links {
    grid-column: 1 / -1;
    /* Keep existing show/hide logic */
  }
  .nav-links a {
    padding: var(--sp-5) 0;
    border-top: var(--border-thin);
    font-size: 1rem;            /* Larger touch-friendly nav text */
    letter-spacing: 0.12em;
  }

  /* Layouts: all 2-col → 1-col */
  .band,
  .feature-split,
  .detail-page,
  .ritual-steps {
    grid-template-columns: 1fr;
  }

  /* Feature split: image above, copy below */
  .feature-split {
    flex-direction: column;     /* Use flex-direction since we switch to flex */
    display: flex;
  }
  .feature-media {
    order: -1;
    aspect-ratio: 16 / 9;      /* Landscape crop on mobile */
    width: 100%;
  }

  /* Product grid stays 2-col at 900, override 1200px rule */
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: var(--sp-8) var(--page-x);
  }
  .product-grid .product-card:nth-child(3) {
    max-width: 100%;
  }

  /* Detail page: gallery on top */
  .detail-page {
    display: flex;
    flex-direction: column;
  }
  .detail-gallery {
    position: static;           /* Unstick gallery */
    min-height: 55vw;           /* Proportional gallery height */
  }
  .detail-info {
    padding: var(--sp-8) var(--page-x);
  }

  /* Ritual steps: stacked */
  .ritual-steps {
    grid-template-columns: 1fr;
  }
  .ritual-steps div {
    border-right: none;
    border-bottom: var(--border-dark);
    padding: var(--sp-6) 0;
  }
  .ritual-steps div:last-child {
    border-bottom: none;
  }

  /* Atelier: stack columns */
  .atelier {
    grid-template-columns: 1fr;
  }
  .atelier-right {
    margin-top: var(--sp-6);
  }

  /* Footer */
  .footer-top {
    flex-direction: column;
    gap: var(--sp-7);
  }
  .footer-nav {
    flex-wrap: wrap;
    gap: var(--sp-5) var(--sp-7);
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
  }
}
```

**Typography at ≤900px:** Hero H1 overrides:
```css
@media (max-width: 900px) {
  .hero h1 {
    font-size: clamp(3.8rem, 18vw, 5.5rem);
  }
}
```

---

### Breakpoint: ≤560px

```css
@media (max-width: 560px) {
  :root {
    --page-x: 1.25rem;  /* Fixed — no more vw-based margin */
  }

  /* Hide search icon in header (keep bag icon) */
  .icon-button:first-of-type {
    display: none;
  }

  /* Product grid: 1 column */
  .product-grid {
    grid-template-columns: 1fr;
    gap: var(--sp-6);
  }

  /* Card CTA: always visible on mobile (no hover) */
  .card-quick-add {
    transform: translateY(0);      /* Always shown */
    background: linear-gradient(to top, rgba(14, 10, 6, 0.65), transparent 70%);
  }

  /* Hero adjustments */
  .hero h1 {
    font-size: clamp(3.2rem, 20vw, 4.8rem);
  }
  .hero-actions {
    flex-direction: column;
  }
  .hero-actions .button {
    width: 100%;
    justify-content: center;
  }

  /* Purchase row */
  .purchase-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--sp-4);
  }
  .quantity {
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;
  }
  .add-button {
    width: 100%;
  }

  /* Ritual steps: more padding */
  .ritual-steps p {
    font-size: clamp(1.7rem, 7vw, 2.2rem);
  }
}
```

**Touch targets at ≤560px:** All interactive elements must be ≥44×44px. Verify: buttons (3rem = 48px ✓), accord pills (2.75rem = 44px ✓), quantity buttons (2.75rem ✓), nav links (set to 3rem min-height on mobile), footer nav links (set to `padding: 0.75rem 0`).

---

## 5. Motion & Interaction

All animations defined with `prefers-reduced-motion` fallback. Rule of thumb: duration ≤ 400ms for UI feedback; ≤ 1400ms for entrance animations.

### Animation definitions

```css
/* 1. Hero entrance (existing — keep, minor tweak) */
@keyframes heroReveal {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Duration: 700ms | Easing: cubic-bezier(0.16, 1, 0.3, 1) | Delays: 300ms / 450ms / 600ms / 750ms */

/* 2. Hero image Ken Burns (existing — keep) */
@keyframes heroZoom {
  from { transform: scale(1.04); }
  to   { transform: scale(1); }
}
/* Duration: 1600ms | Easing: cubic-bezier(0.16, 1, 0.3, 1) | No delay */

/* 3. Scroll reveal (existing IntersectionObserver — keep, adjust timing) */
.reveal {
  opacity: 0;
  transform: translateY(24px);           /* Was 28px — slightly tighter */
  transition: opacity 640ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 640ms cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
/* Stagger delay in JS: Math.min(index * 60, 240)ms  — was 70/280 */

/* 4. Card lift on hover */
/* Already defined via transition. Ensure: 300ms cubic-bezier(0.16, 1, 0.3, 1) */

/* 5. Card image subtle zoom on hover */
/* Already defined. Ensure: 500ms cubic-bezier(0.16, 1, 0.3, 1) */

/* 6. Card quick-add overlay slide */
.card-quick-add {
  transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* 7. Nav underline draw on hover */
.nav-links a::after {
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
/* Draw from left (transform-origin: left) on hover; retract right (transform-origin: right) on leave */
.nav-links a:not(:hover)::after {
  transform-origin: right;
}
.nav-links a:hover::after {
  transform-origin: left;
}

/* 8. Scroll dot bounce (existing) */
@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50%       { transform: translateY(6px); opacity: 0.3; }
}
/* Duration: 2s | Easing: ease-in-out | Infinite */
```

### Reduced-motion fallback

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .reveal {
    opacity: 1;
    transform: none;
  }

  /* Hero elements appear immediately */
  .hero-eyebrow,
  .hero h1,
  .hero-copy,
  .hero-actions,
  .scroll-cue {
    opacity: 1;
    animation: none;
  }
}
```

---

## 6. Accessibility & UX Quality Checks

### Contrast targets

| Text use | Foreground | Background | Ratio | WCAG |
|---|---|---|---|---|
| Body copy | `#5a5044` (smoke) | `#faf3e4` (porcelain) | 5.6:1 | AA ✓ |
| Eyebrow labels | `#7a5e28` (gold-rich) | `#faf3e4` | 6.2:1 | AA ✓ |
| H1/H2 headings | `#0e0d0b` (ink) | `#faf3e4` | 17.8:1 | AAA ✓ |
| Nav links | `#5a5044` (smoke) | `rgba(251,244,232,0.86)` | ~5.4:1 | AA ✓ |
| Gold on charcoal | `#e8cc88` (gold-light) | `#100f0e` | 6.4:1 | AA ✓ |
| Button text (primary) | `#f5ead6` | `#2a0705` (wine) | 11.2:1 | AAA ✓ |
| Card price | `#0e0d0b` | `#faf3e4` | 17.8:1 | AAA ✓ |
| **REMOVE:** gold text small | ~~`#c5a05b`~~ | ~~`#faf3e4`~~ | ~~2.8:1~~ | ✗ Fail |

### Focus visibility

```css
/* Global rule — place at top of styles.css after reset */
:focus-visible {
  outline: 2px solid var(--c-gold-rich);
  outline-offset: 3px;
}

/* Override for dark backgrounds */
.ritual :focus-visible,
.atelier :focus-visible,
.footer :focus-visible {
  outline-color: var(--c-gold-light);
}

/* Override for cards (uses transform-based state) */
.product-card:focus-visible {
  outline: 2px solid var(--c-gold-rich);
  outline-offset: 2px;
}

/* Never suppress outline without providing an alternative */
/* Remove: .product-card { outline: 0 } — replace with above */
```

### Keyboard flow expectations

Tab order (logical, matches DOM order):
1. Notice bar (not focusable — correct)
2. Header: Logo → Nav links → Search → Bag → Menu (burger)
3. Hero: CTA buttons → Scroll cue (aria-hidden, skip)
4. Intro, Feature split: no interactive elements (correct)
5. Product cards: all 3 cards (Enter/Space → select product + scroll to detail)
6. Ritual: no interactive elements
7. Detail: Accord buttons (3) → Quantity minus → Quantity display (not focusable) → Quantity plus → Add to bag
8. Detail lines: `<details>` summaries (Space/Enter toggles)
9. Atelier: Book appointment button
10. Footer: Brand link → 4 nav links

**`<details>/<summary>` keyboard:** Native behavior works. Ensure no `outline: none` override on `summary`.

### Tap target minimums

All interactive elements must have a clickable area of at least 44×44px. Audit checklist:
- `icon-button` / `menu-button`: set `width: 2.75rem; height: 2.75rem` (44px) ✓
- `accord` buttons: `min-height: 2.75rem` ✓
- `quantity` +/- buttons: `height: 2.75rem` ✓
- `product-card`: full card is tappable ✓
- Footer nav `<a>`: add `padding: 0.5rem 0` (tap area extends above/below text)
- `text-link`: add `padding: 0.5rem 0` and `display: inline-block`

### Readability constraints

- Body paragraphs: `max-width: 65ch` (already `max-width: 37rem` on some — standardize with `65ch`)
- Lead copy / hero: `max-width: 48ch`
- Detail description: `max-width: 55ch`
- Minimum body font size: 1rem (16px) — no exceptions for reading text
- Line-height floor: 1.7 for all body copy
- Do not set `letter-spacing` on body text — only on labels, eyebrows, buttons (UI elements)

---

## 7. Codex Handoff Plan

### Phase 1 — Critical Bugs (fix before anything else)

These are broken or accessibility-failing right now:

1. **Define `.eyebrow` CSS class** — affects 6+ sections visually
2. **Fix `.purchase-row`** — add `display: flex; align-items: center; gap: var(--sp-4)`
3. **Fix Atelier HTML** — wrap H2 + CTA in `<div class="atelier-right">`; add body paragraph
4. **Fix `detail-info sticky top`** — change `4.8rem` to `var(--header-offset)`
5. **Add global `:focus-visible` styles** — remove `outline: 0` from `.product-card`
6. **Replace `--gold` with `--c-gold-rich` on small text** — fix contrast failures (eyebrows, text-link)
7. **Replace Unicode icons** with inline SVG in header icon buttons

**Estimated: 1–2 hours in Codex.**

---

### Phase 2 — Design System Upgrades

Apply the new token system and rebuild weak sections:

1. Rename and update all color tokens to v1 system (`--c-` prefix) — find/replace in CSS
2. Update spacing to `--sp-` token system — find/replace
3. Rebuild product cards (new HTML structure + CSS per §3f)
4. Update footer to full spec (new HTML + CSS per §3j)
5. Apply typography scale tokens to all sections
6. Fix rhythm: remove magic numbers in section paddings, use `var(--section-y)` consistently
7. Fix `--container-wide` max-widths on section grids

**Estimated: 4–6 hours in Codex.**

---

### Phase 3 — Polish & Motion

1. Tune reveal animation: stagger delay update in `script.js`
2. Add card quick-add overlay HTML + CSS
3. Nav underline direction fix (origin: left on enter, right on leave)
4. `prefers-reduced-motion` block
5. Touch target audit pass (padding audit on all interactive elements)
6. Footer nav link hover states
7. Mobile nav: larger touch targets, correct padding
8. `object-position` tuning on all images

**Estimated: 2–3 hours in Codex.**

---

### High-Risk Changes (do carefully)

- **Product card HTML restructure** — JS in `script.js` references `.product-card`, `[data-product]`, `[data-price]`, `[data-description]` data attributes. These must survive the card HTML change. Keep all `data-*` attributes on the `<article>` element. The JS event listeners attach to `.product-card` — add the new `.card-cta` and `.card-view` buttons with `event.stopPropagation()` if they trigger separate actions (else they'll also fire the parent card's click→scroll behavior).

- **Color token rename** — Do the CSS `--gold` → `--c-gold-rich` / `--c-gold-light` replacement carefully. `--gold` is used in 7+ places. Use a systematic find-replace, not manual edits. After renaming, verify the hero, ritual, nav underline, and text-link visually.

- **Feature split flex/grid change** — Currently `display: grid` desktop + `display: flex; flex-direction: column-reverse` at ≤900px. Keep this pattern; don't flatten to a single flex-only approach — the grid column ratios matter on desktop.

- **Detail gallery sticky** — Moving `position: sticky` from `.detail-info` to `.detail-gallery` reverses behavior. Test thoroughly: the gallery should stick while info panel scrolls alongside. At ≤900px both should revert to `position: static`.

---

### Quick Wins (do first, visible immediately)

1. Add `.eyebrow` CSS (2 lines) → fixes all section labels instantly
2. Add `display: flex` to `.purchase-row` → fixes broken desktop detail layout
3. Fix atelier HTML wrapper → fixes broken CTA alignment
4. Add `:focus-visible` global rule → instant accessibility improvement
5. Change gold text on small labels to `--c-gold-rich` → fixes contrast failures

---

### Final QA Checklist

Run each check in Chrome + Safari + Firefox at 1440px, 1024px, 768px, 375px.

**Visual:**
- [ ] Eyebrow labels visible and styled in all 6 sections
- [ ] No section uses magic-number padding (verify via DevTools computed values)
- [ ] Product cards: name, notes, price, and CTA all visible and spaced correctly
- [ ] Atelier section: eyebrow + headline in left col, body + button in right col
- [ ] Footer: brand lockup + nav + legal row all visible; border-top separates from atelier
- [ ] Hero H1 never overflows or wraps poorly at 375px
- [ ] All gold text on light bg passes 4.5:1 contrast (use browser devtools accessibility panel)

**Interaction:**
- [ ] Tab through entire page → every interactive element receives visible focus ring
- [ ] Product card: Enter key selects product and scrolls to detail
- [ ] Quantity buttons: capped at 1 min, 9 max
- [ ] Accord buttons: active state transfers on click, note copy updates
- [ ] Add to bag: toast appears and disappears after 2.2s
- [ ] Mobile menu: opens/closes on burger click; closes on nav link click
- [ ] `prefers-reduced-motion`: set OS to reduce motion → no animations fire, all elements visible immediately

**Responsive:**
- [ ] 900px: all grids single column; mobile menu visible; hero min-height ≥46rem
- [ ] 560px: product grid single column; hero actions stacked; purchase row stacked
- [ ] No horizontal scroll at any breakpoint (test with DevTools device toolbar)
- [ ] Touch targets ≥44px on all interactive elements at 375px (use devtools overlay)

**Performance:**
- [ ] All product images have `loading="lazy"` (already present ✓)
- [ ] No layout shift after hero image loads (hero has fixed min-height ✓)
- [ ] Header sticky does not cause paint on scroll (verify backdrop-filter is GPU-composited)
