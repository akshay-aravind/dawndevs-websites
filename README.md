# DawnDevs — website studio

An elegant, minimal site for **DawnDevs**, a studio that builds one thing —
websites. Instead of scrolling, visitors **turn through it like a book**: four
full-screen pages, navigated with arrows, the on-screen ◀ ▶, the scroll wheel,
or a swipe.

Made for **non-technical business owners** — sleek, clear, and quiet, guiding
them to the plan that fits.

## Look & feel — "Nocturne"

A dark, sleek monochrome. Near-black canvas (`#0a0a0b`), warm off-white type, a
refined **Playfair Display** serif for the big lines and clean **Inter** for
everything else. Hairline detail, a soft top spotlight, a whisper of grain. No
colour — the elegance is in the restraint.

## The four pages

1. **Studio** — a minimal landing: *"We craft websites worth remembering."*
2. **What we do** — one focused craft: design · build · care
3. **Pricing** — all three plans on one page:
   Starter **₹2,999** · Custom **₹6,999** *(popular)* · Signature **Let's talk**
4. **Contact** — a simple, elegant enquiry form

Each pricing plan's button turns to the contact page with that plan preselected.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — design tokens in `src/app/globals.css`
- **Motion** (`motion/react`) — page-turn transitions + entrance reveals
- Fonts: **Playfair Display** (serif display) · **Inter** (sans)

## Run it

```bash
npm run dev      # http://localhost:3000 (or --port 3001)
npm run build    # static production build
npm run start
npm run lint
```

> Don't run `npm run build` while `npm run dev` is live — they share the `.next`
> folder and the dev server can corrupt. Stop dev first.

## Structure

```
src/
├─ app/
│  ├─ layout.tsx      # fonts + metadata/OG
│  ├─ globals.css     # "Nocturne" dark design system + tokens
│  └─ page.tsx        # mounts <Book/> + grain + noscript fallback
└─ components/
   ├─ Book.tsx         # ★ page-turn engine (keys/wheel/swipe/dots) + context + chrome
   ├─ Atmosphere.tsx   # the soft dark spotlight
   ├─ Rise.tsx         # entrance reveal for elements within a page
   ├─ tiers.ts         # ★ your three plans + prices (edit here)
   └─ pages/
      ├─ Landing.tsx · Approach.tsx · Pricing.tsx · Contact.tsx
```

## Editing content

- **Plans / prices** — `components/tiers.ts`
  (Starter ₹2,999 · Custom ₹6,999 · Signature "Let's talk").
- **Contact inbox** — `INBOX` in `components/pages/Contact.tsx` (`akshay.dx4@gmail.com`).
- **WhatsApp** — set `WHATSAPP` in `Contact.tsx` to your number in international
  format (e.g. `919876543210`) to reveal a WhatsApp link.
- **Theme colours** — the `--color-*` tokens in `globals.css`.

## Contact — wiring real delivery

The form composes a prefilled **`mailto:`** on send (zero setup). To capture
enquiries server-side, see the `TODO (delivery)` note in `Contact.tsx`: swap the
`mailto` for a POST to a Next.js route handler (Resend) or a Formspree endpoint.

## Notes

- Fixed full-screen "book" — needs JavaScript (there's a `<noscript>` email
  fallback). Respects `prefers-reduced-motion` (turns become simple fades).
- One static route — deploys anywhere Next.js runs.
```
