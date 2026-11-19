# CoasTee: landing page + design studio

Static site (one `index.html` plus `assets/`). No build step. Host it on Netlify, Vercel, GitHub Pages or Cloudflare Pages by uploading this folder.

## Before going live: edit the `CONFIG` block at the top of the `<script>` in `index.html`
- `formEndpoint`: a URL that accepts JSON POSTs (Formspree, a Make/Zapier webhook, or Google Apps Script into a Google Sheet). If it's empty, forms open the visitor's email client instead, which loses leads.
- `checkoutUrl`: a Stripe Payment Link. After a reservation, the visitor gets a "Secure my spot" button.
- `packs`, `tiers`: **placeholder prices**. Replace them with real ones.
- `colors`, `businessMOQ`, `shipEstimate`, and the contact details.

## What's in it
- A design studio: upload, drag-and-drop or paste (Ctrl/⌘+V) an image, then position, zoom and rotate it. Fill/Fit layouts (a logo with a transparent background switches to Fit automatically), body color, and text around the rim.
- 6 live scenes: event lawn, beach, golf course, picnic table, top view, studio. Mockups can be downloaded or shared.
- A pre-order form (the chosen design travels with the order) and a business form with a quantity estimator.
- Analytics hooks (`track()`) for GA4 or Plausible, if either is installed.
