# Dee Cleaning Co.

Premium condo cleaning service website for Bangkok. Built with Astro 4, React, Tailwind CSS, and GSAP 3.

---

## Tech Stack

- **Astro 4** — static-first, island architecture
- **React** — interactive islands (PricingCalculator, Gallery, FAQ, BookingForm)
- **Tailwind CSS** — utility styles with custom brand tokens
- **GSAP 3 + ScrollTrigger** — scroll-driven animations (free version)
- **i18n** — `/en/` and `/th/` route prefixes

---

## Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:4321/en/

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── pages/
│   ├── index.astro          → redirects to /en/
│   ├── en/
│   │   ├── index.astro      → English landing page
│   │   └── book.astro       → English booking page
│   └── th/
│       ├── index.astro      → Thai landing page
│       └── book.astro       → Thai booking page
├── components/
│   ├── Nav.astro
│   ├── Hero.astro
│   ├── TrustStrip.astro
│   ├── Services.astro
│   ├── PricingCalculator.tsx  (React island)
│   ├── WhyUs.astro
│   ├── Gallery.tsx            (React island)
│   ├── ServiceAreas.astro
│   ├── Testimonials.astro
│   ├── FAQ.tsx                (React island)
│   ├── FinalCTA.astro
│   ├── Footer.astro
│   └── BookingForm.tsx        (React island)
├── layouts/
│   └── Base.astro
├── styles/
│   └── global.css
├── i18n/
│   ├── en.json
│   └── th.json
└── lib/
    ├── gsap-setup.ts
    └── line-handoff.ts
```

---

## Placeholders to Replace Before Launch

Search for `[PLACEHOLDER]` in the codebase. Replace these:

| Item | File | Current Value |
|------|------|---------------|
| LINE @ID | `src/i18n/en.json`, `src/i18n/th.json`, `src/lib/line-handoff.ts` | `@deecleaning` |
| Phone number | `src/i18n/en.json`, `src/i18n/th.json` | `+66 (0) 00 000 0000` |
| Email address | `src/i18n/en.json`, `src/i18n/th.json` | `hello@deecleaning.com` |
| Gallery photos | `src/components/Gallery.tsx` | Replace labeled placeholder rectangles with real `<img>` tags |
| Favicon | `public/favicon.svg` | Replace with proper branded favicon |

### Updating Gallery Photos

In `Gallery.tsx`, replace the before/after placeholder divs with actual images:

```tsx
// Replace this:
<div className="flex-1 bg-paper-deep border-r border-line flex items-center justify-center">
  {/* placeholder text */}
</div>

// With this:
<div className="flex-1 overflow-hidden">
  <img src="/images/before-asoke-1.jpg" alt="Before — Asoke 1-bed" className="w-full h-full object-cover" loading="lazy" />
</div>
```

Place photos in `public/images/`.

---

## Updating Content

All text content lives in:
- `src/i18n/en.json` — English
- `src/i18n/th.json` — Thai

Edit these JSON files to update copy, prices, service names, area lists, FAQ answers, etc. No code changes needed.

---

## Brand Rules (do not change)

- **"Dee"** in the wordmark: always `<em>` italic, always terracotta `#b85c3c`
- **No drop shadows, no gradients, no glass-morphism**
- **No rounded buttons over 6px radius**
- **No pure white** — use `paper` (#f6f1e7) as base background
- **No icon libraries** — typography and geometry only
- **Fonts**: Fraunces (headings), Manrope (body), Sarabun (Thai text only)

---

## Deploying to Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Framework preset: **Astro** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click Deploy

No environment variables needed for the static site.

To set a custom domain, go to Project Settings → Domains.

---

## LINE Booking Integration

The booking flow sends users to LINE with a pre-filled message. The LINE URL format is:

```
https://line.me/R/oaMessage/@deecleaning/?MESSAGE
```

Replace `@deecleaning` with your actual LINE Official Account ID in:
- `src/lib/line-handoff.ts`
- `src/components/BookingForm.tsx` (the `handleSubmit` function)

---

## Analytics

No analytics are included by design. To add Vercel Analytics:

```bash
npm install @vercel/analytics
```

Then add `<Analytics />` to `src/layouts/Base.astro`.

---

## Performance Notes

- React islands use `client:load` (above fold) and `client:visible` (below fold)
- All fonts loaded via Google Fonts with `display=swap`
- No images in initial build (gallery uses placeholders)
- GSAP loaded only in browser, not during SSR

---

Built in Bangkok.
