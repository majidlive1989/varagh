# VARAGH — Next.js Headless Storefront

An RTL-first, bilingual (fa/en) Next.js App Router storefront connected to the Beyond Borders v1.1.0 WordPress plugin. Design system uses configurable CSS variables and a lightweight Motion reveal component. The frontend is a working *integration starter*, **not a production-ready commerce checkout**.

## Run locally

```bash
npm install
cp .env.example .env.local
# edit .env.local
npm run dev
```

Open `http://localhost:3000/fa`. The homepage, shop, product detail, about, contact, cart and checkout placeholder are included. Without `WORDPRESS_URL`, demo layouts work but product data is empty. No fake products or fabricated contact details are shown.

## WordPress setup

1. Install WordPress + WooCommerce on a separate CMS host, such as `cms.example.com`, with HTTPS.
2. Install Beyond Borders v1.1.0 on a staging instance. Verify `/wp-json/beyond-borders/v1/health` and `/products` first.
3. Configure `WORDPRESS_URL=https://cms.example.com` (no `/wp-json` suffix).
4. Create products, product categories and the `about` page in WordPress. `about-en` is the current English page slug placeholder; production multilingual routing needs a consistent translation mapping.
5. Configure the CMS public frontend URL in Beyond Borders, but keep wp-admin, REST, webhooks and payment callbacks accessible on the CMS hostname.
6. Contact form proxies to `/wp-json/beyond-borders/v1/forms/contact`. **Check the actual endpoint and request schema before enabling the form**.

## Vercel deployment

1. Push the `varagh-next` folder to GitHub. Import the repo into Vercel with the Next.js framework preset and project root set to the folder if in a monorepo.
2. Set Vercel environment variables `WORDPRESS_URL`, `NEXT_PUBLIC_SITE_URL=https://example.com`, `ENABLE_CHECKOUT=false` for Production, Preview and Development as appropriate.
3. Deploy to the temporary `*.vercel.app` domain and test both locales and every route before changing DNS.
4. In Vercel Project Settings → Domains add `example.com` and `www.example.com`, choose the primary redirect, and follow the **exact DNS records Vercel displays** at your registrar (records vary). Preserve mail MX/TXT records. Keep `cms.example.com` pointing to WordPress.
5. Enable SSL, verify redirects, inspect sitemap and robots, set up analytics/error monitoring and perform smoke tests. After propagation, test contact forms, assets and WordPress availability.

## Critical pre-production checklist

- **Checkout intentionally disabled**: Beyond Borders v1.1.0 `/checkout` creates an order but does not safely implement the complete WooCommerce Store API payment/shipping/tax/customer session flow. Do not wire it directly to a production purchase button. Use a tested WooCommerce Store API integration with server-verified prices, variation selection, shipping, tax, gateway redirect/webhooks and idempotency.
- **Variable products**: Displayed but purchase button disabled until variation selection is implemented server-side.
- **Categories**: The Beyond Borders `/products` endpoint has no category filter. Category pages currently show the unfiltered product list with an explicit notice. Extend the plugin endpoint and then pass category ID/slug from the server.
- **Search**: The search input filters the currently loaded page only; build a server-side search endpoint for the full catalog.
- **Pricing**: The local cart is a *preview only*; all prices, discounts and stock must be recomputed by WooCommerce at checkout. Never trust client-submitted totals.
- **Contact security**: Add server-side distributed rate limiting, spam prevention and consent policy. The current Next.js route validates input but does not provide distributed rate limiting.
- **HTML content**: WordPress page/product HTML is currently rendered with `dangerouslySetInnerHTML`. Only allow trusted editorial roles and sanitize WordPress HTML at the source / server before public rendering.
- **SEO**: Add translated hreflang, real product metadata, complete paginated sitemap and structured data after verifying data quality. Sitemap currently lists only the first 24 products.
- **Media**: `<img>` is used for WordPress remote media to avoid unconfigured image host failures. Set up a verified media hostname and Next Image remotePatterns when moving to production.
- **Currency**: Respect WooCommerce currency units and formatting; don't treat IRR as IRT automatically. Current UI labels are illustrative.
- **Auth/account**: Login, customer sessions, order history and private account views are not implemented.
- **Legal**: Add terms, privacy policy, shipping/returns, tax invoice rules and verified company contact information.
- **Ops**: Backups, WAF, monitoring, CI tests, security review, and staging payment tests are required.

## Routes

- `/fa`, `/en` — home
- `/[locale]/shop` — product catalog
- `/[locale]/category/[slug]` — category landing (filter backend TODO)
- `/[locale]/product/[slug]` — product detail
- `/[locale]/about` — editorial about
- `/[locale]/contact` — contact form
- `/[locale]/cart` — local preview cart
- `/[locale]/checkout` — safely disabled checkout
- `/api/contact` — server-side form proxy

## Theme

Colors live in `app/globals.css` (`--forest`, `--brown`, `--cream`). Fonts: Vazirmatn + DM Sans (Google Fonts CSS import, internet required). Replace with licensed, locally hosted brand fonts later.
