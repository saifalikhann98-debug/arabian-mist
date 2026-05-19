# Arabian Mist Phase One Architecture

## Goal

Arabian Mist runs as a static ecommerce catalog for the first phase. The site does not use a database, checkout backend, cart persistence, authentication, or payment gateway.

## Product Source

All products live in `data/products.js`.

Each product includes:

- `id`
- `code`
- `name`
- `price`
- `size`
- `notes`
- `accords`
- `description`
- `image`

`script.js` renders the product grid from this file, so adding or editing a perfume is a data change only.

## Buying Flow

The conversion action is WhatsApp enquiry.

1. Customer clicks a product or opens the detail section.
2. Customer chooses quantity.
3. Customer clicks `Buy on WhatsApp`.
4. The site builds a WhatsApp message with product name, code, size, price, and quantity.
5. The browser redirects to `wa.me`.

The WhatsApp number is configured in `script.js` as `BUSINESS_WHATSAPP_NUMBER`.

## Deployment

The site is static HTML, CSS, and JavaScript hosted on Vercel.

No runtime server is required.
