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

## Setting up the Bookings CRM

This section walks through connecting the booking form to a Google Sheet so every submission is automatically recorded. No coding required after the one-time setup.

### 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Rename the first sheet tab (bottom of screen) to exactly: **Bookings**
3. Add these column headers in row 1 (one per cell, A through O):

   | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
   |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
   | Timestamp | Booking Ref | Name | Phone | Email | Service | Size | Area | Preferred Date | Preferred Slot | Notes | Status | Assigned Cleaner | Final Price | Source |

4. Bold row 1 and freeze it: View → Freeze → 1 row.

### 2. Find your Sheet ID

The Sheet ID is the long string of letters and numbers in your spreadsheet's URL, between `/d/` and `/edit`:

```
https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit
```

Copy it — you'll need it in the next step.

### 3. Deploy the Apps Script webhook

1. In your Google Sheet, go to **Extensions → Apps Script**.
2. Delete all the default code in the editor.
3. Open the file `apps-script/webhook.gs` from this repo and paste its entire contents.
4. On line 10, replace `[REPLACE_WITH_YOUR_SHEET_ID]` with the Sheet ID you copied above.
5. Click the floppy-disk icon (Save) or press Ctrl+S.
6. Click **Deploy → New deployment**.
7. Under "Select type", choose **Web app**.
8. Set "Execute as" to **Me**.
9. Set "Who has access" to **Anyone**.
10. Click **Deploy**, then **Authorize access** and follow the Google sign-in prompts.
11. Copy the **Web app URL** — it looks like:
    ```
    https://script.google.com/macros/s/AKfycb.../exec
    ```

Every time you change the script you must click **Deploy → Manage deployments → Edit (pencil icon) → Version: New version → Deploy** to publish the update.

### 4. Add the webhook URL to Vercel

1. Go to your project on [vercel.com](https://vercel.com).
2. Click **Settings → Environment Variables**.
3. Add a new variable:
   - **Name:** `PUBLIC_BOOKINGS_WEBHOOK_URL`
   - **Value:** the Web app URL from step 3
   - **Environment:** Production (and Preview if you want it in staging too)
4. Click **Save**, then trigger a new deployment (push a commit, or use Vercel's "Redeploy" button).

For local development, copy `.env.example` to `.env` and paste your URL there:
```
PUBLIC_BOOKINGS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec
```

### 5. Troubleshooting

**Form submits but nothing appears in the sheet**
- Check that the sheet tab is named exactly `Bookings` (capital B, no spaces).
- Verify the Sheet ID in `webhook.gs` is correct — no extra spaces.
- In Apps Script, click **Executions** (left sidebar, clock icon) to see if `doPost` ran and whether it threw an error.
- Re-deploy after any code change (see step 3 above).

**Step 4 shows the error banner ("We couldn't save your request...")**
- The webhook URL may be wrong or the script may not be deployed yet.
- The form still works — the LINE button takes the customer to LINE with their details pre-filled. Nothing is lost.
- Check the browser console (F12 → Console) for a `[BookingForm] Webhook error:` message.

**"Script function not found: doPost"**
- You may have saved but not deployed. Always deploy after pasting the code.

**Google asks for authorisation every time**
- That only happens the first time. Once authorised, the script runs automatically.

**Rows appear out of order**
- `appendRow` always adds to the bottom. Sort by column A (Timestamp) descending: Data → Sort range → Sort by A, Z→A.

### 6. Daily CRM workflow (5-minute morning routine)

Each morning, open the Bookings sheet and scan new rows (Status = **Pending**):

1. **Confirm or decline** each booking via LINE (see message templates below).
2. Fill in **Assigned Cleaner** with your cleaner's name.
3. Fill in **Final Price** once confirmed.
4. Change **Status** from `Pending` to one of:
   - `Confirmed` — booking locked in
   - `Declined` — couldn't accommodate, let customer know
   - `Completed` — clean done and paid
   - `No-show` — customer didn't answer

Optional: use conditional formatting (Format → Conditional formatting) to colour-code the Status column for a quick visual overview.

### 7. LINE message templates

**Confirmation:**
```
Hi [Name]! Thanks for booking with Dee Cleaning Co. 🧹

Confirmed:
→ Service: [Service]
→ Date: [Date] · [Slot]
→ Address: [ask if not provided]

[Cleaner's name] will arrive at the start of your time window.
Payment: cash on the day (or bank transfer beforehand — let us know).

Any questions? Just reply here. See you then!
```

**Decline / reschedule:**
```
Hi [Name], thanks for your booking request!

Unfortunately we're fully booked on [Date] in the [Slot] slot.

We do have availability on:
→ [Alternative date 1] · [Slot]
→ [Alternative date 2] · [Slot]

Would either of those work for you? Happy to lock one in now.
```

---

## Deploying to Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Framework preset: **Astro** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add the `PUBLIC_BOOKINGS_WEBHOOK_URL` environment variable (see "Setting up the Bookings CRM" above)
7. Click Deploy

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
