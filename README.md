# uptomind online store

## File structure
- `index.html` — homepage (product grid)
- `product-shapes-engraving.html` — multi-option product page (pattern/size/color)
- `product-custom-text.html` — multi-option product page (custom text/font/finish/type/size/color)
- `product-custom-stamp.html` — multi-option product page (image upload/material/shape/size/handle)
- `style.css` — shared visual style
- `shop-common.js` — shared cart / PromptPay QR / LINE / sheet-logging / color palette / image-placeholder logic (used by every page)
- `script.js` — homepage-only logic (category filter, product grid, simple custom-text modal)
- `products.js` — product data (edit this file to add/change/remove products)
- `images/` — logo, favicon, product photos, pattern thumbnails, doodle collection teaser

## Photos still needed for the Custom Stamp page
Same idea as the Custom Text page — drop files into `images/` with these exact names and they'll appear automatically:
- `images/stamp-hero.jpg` — main hero shot
- `images/stamp-wood.jpg` — wood stamp example (shown when Material = Wood)
- `images/stamp-rubber.jpg` — rubber stamp example (shown when Material = Rubber)
- `images/stamp-handle-a.jpg`, `images/stamp-handle-b.jpg`, `images/stamp-handle-c.jpg` — the three handle styles (also used as the clickable option swatches)

Prices for each shape/size, and the wood/rubber price difference, are placeholders — search for `const SHAPES` and `const MATERIALS` near the bottom of `product-custom-stamp.html`.

**Note on the image upload field:** a static site like this one can't actually receive or store the file the customer uploads — there's no server to send it to. The page shows a local preview so the customer can confirm they picked the right file, and reminds them to also attach that same image in LINE when they check out (same as how payment screenshots already work). This is a deliberate limit of the current architecture, not a bug — if you'd rather have images upload automatically, that would need a small backend (e.g. a form service or a Google Drive upload endpoint), and I can help set that up if you want it later.

## Photos still needed for the Custom Engraved Text page
This page works right now with placeholder boxes — just drop your photos into `images/` using these exact filenames and they'll appear automatically, no code changes needed:
- `images/custom-text-hero.jpg` — main hero shot
- `images/custom-text-earrings.jpg` — example on earrings
- `images/custom-text-brooch.jpg` — example on a brooch
- `images/custom-text-keychain.jpg` — example on a keychain
- `images/custom-text-engraved-vs-raised.jpg` — side-by-side of the two finishes

Sizes and prices for each type (Earrings/Brooch/Keychain) in `product-custom-text.html` are placeholders — search for `const TYPES` near the bottom of that file and edit the numbers whenever you're ready.

## Settings to fill in

Open `shop-common.js` at the top:

```js
const PROMPTPAY_ID = '0887801158';   // already filled in
const SHOP_NAME = 'uptomind';        // already filled in
const SHOP_CITY = 'BANGKOK';         // already filled in
const LINE_OA_ID = '@598orgjd';      // already filled in — your LINE Official Account Basic ID
const SHEETS_WEBHOOK_URL = '';       // ← you still need to fill this in: your deployed Google Apps Script URL
```

Because `LINE_OA_ID` is now a LINE **Official Account**, the "Send via LINE" button opens a chat with the order details already typed in — no manual copy/paste needed (this only works for Official Accounts, not personal LINE accounts).

`SHEETS_WEBHOOK_URL` setup steps are in `apps-script-order-logger.gs` (sent earlier). Once deployed, paste the `/exec` URL here and every order will be logged to your sheet automatically. The site works fine without it — it just won't log orders.

## Adding real product photos

In `products.js`, products currently using an emoji icon can be swapped for a real photo:
1. Add your photo to the `images` folder
2. Replace `icon: '🌼'` with `image: 'images/your-photo.jpg'`

## Logo & the doodle collection
- `images/logo.png` is your hand-drawn wordmark, shown in the header on every page and used as the favicon.
- `images/doodle-collection.gif` is shown as a "coming soon" teaser on the homepage. When that product line is ready, this can become its own category the same way `product-shapes-engraving.html` works.

## Deploying to GitHub Pages
1. Create a new repo and upload every file in this folder
2. Settings → Pages → Source: pick your branch (usually `main`), folder `/root`
3. Wait a minute or two — you'll get a URL like `https://yourname.github.io/reponame/`

## Adding a new font later
There are two cases:

**A Google Font (easiest, no files to manage)**
1. Grab its `<link href="https://fonts.googleapis.com/css2?family=...">` from [fonts.google.com](https://fonts.google.com) and add it next to the existing font `<link>` in the `<head>` of `product-custom-text.html` (and any other page you want it on)
2. Add an entry to the `FONTS` array near the bottom of `product-custom-text.html`, e.g.:
   ```js
   { id:'mynewfont', label:'My New Font', family:"'FontName', serif", weight:600 }
   ```
That's it — no `fonts` folder needed for this case.

**Your own font file (.woff2/.ttf you own or bought)**
1. Drop the file into the `fonts/` folder
2. In `style.css`, find the commented-out `@font-face` block near the top, uncomment it, and fill in the font name + filename
3. Add an entry to `FONTS` in `product-custom-text.html` using that same `font-family` name

## Engraving preview (cutline + finish)
The preview on the Custom Engraved Text page now shows two things together, matching your reference diagram:
- The **orange dashed outline** = the cutline (the outer shape physically cut out of the material)
- The **filled box inside** = the engrave surface, which flips depending on the Finish you pick:
  - **Engraved (凹)** — light surface, dark carved-looking text (only the text is engraved)
  - **Raised (凸)** — dark engraved background, light text (the background is engraved, text stays raised)

This is a simplified stand-in for your actual outline-offset tool (`uptomind-engrave-mockup.html`) — good enough to show customers the idea, not a production file.

## Ideas for later (just ask)
- More multi-option product pages (brooches, bookmarks, etc.) using the same pattern as `product-shapes-engraving.html`
- A real product line based on the doodle-collection artwork
- Nicer engraving preview closer to the real laser effect (your `uptomind-engrave-mockup.html` prototype)
