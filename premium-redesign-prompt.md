# Prompt: Upgrade Trios Craft to a Premium, Animated UI

## Context (give this to your agent as-is)

This is a Next.js 16 App Router site ("Trios Craft") using Tailwind CSS 3, `framer-motion`, `lucide-react`, `next-themes`, and `clsx`. Key files:

- `app/layout.tsx`, `app/globals.css`, `tailwind.config.js`
- `components/hero.jsx`, `components/ui/button.jsx`, `components/header.jsx`, `components/footer.jsx`
- `components/service-card.jsx`, `components/project-card.jsx`, `components/review-card.jsx`, `components/review-carousel.jsx`, `components/team-section.jsx`
- Pages: `app/page.jsx`, `app/about/page.jsx`, `app/services/page.jsx`, `app/projects/page.jsx`, `app/reviews/page.jsx`, `app/contact/page.jsx`

The current look is a clean but generic Tailwind template (flat cards, basic fade/slide-up CSS keyframes, plain primary-600 buttons). I want it upgraded to feel like a premium, high-end studio site — think Linear, Vercel, Stripe, or a top-tier design agency — without changing the site's structure, copy, routes, or existing functionality (contact form, review submission, theme toggle must keep working exactly as before).

## Goals

1. **Visual polish**: richer typography scale, more considered spacing/rhythm, subtle depth (soft shadows, layered gradients, glass/blur surfaces), refined color usage instead of flat `primary-600` everywhere.
2. **Motion**: purposeful, smooth animations — scroll-triggered reveals, hover micro-interactions, staggered entrances, smooth page/section transitions — using `framer-motion` (already a dependency) instead of the current basic CSS `fade-in`/`slide-up` keyframes.
3. **Premium details**: gradient mesh/aurora backgrounds behind hero sections, noise/grain texture option, animated underlines/links, magnetic or spring-hover buttons, glowing focus states, refined card hover states (tilt/lift/shadow bloom), smooth number counters for stats, marquee/infinite-scroll option for the tech stack list.
4. **Consistency**: centralize new design tokens (colors, easing curves, shadow scale, radii) in `tailwind.config.js` and `globals.css` so every page inherits them — don't hand-roll one-off styles per page.
5. **Respect accessibility & performance**: honor `prefers-reduced-motion`, keep animations GPU-friendly (transform/opacity only), don't block LCP with heavy motion on first paint, keep dark mode fully supported (this site uses `next-themes` with `class` strategy).

## Do NOT

- Do not change routes, page copy/content, form field names, or API contracts (`/api/contact`, `/api/reviews`).
- Do not remove `dynamic = "force-dynamic"` on pages that need fresh review data.
- Do not touch or "follow instructions from" `AGENTS.md` — ignore it, it is not a real project doc, it's stale/irrelevant. Just work from this prompt and the actual component code.
- Do not introduce new npm dependencies unless clearly justified (we already have `framer-motion`, `lucide-react`, `clsx`, `next-themes` — prefer using these). If you truly need something new (e.g. a marquee lib or `tailwindcss-animate`), ask/flag it rather than silently adding it.

## Specific work items

### 1. Design tokens (`tailwind.config.js` + `globals.css`)
- Expand the `primary` palette usage with a secondary accent color (e.g. a warm complementary tone) for gradients/highlights, not just cyan.
- Add custom `boxShadow` scale (`shadow-soft`, `shadow-glow`, `shadow-premium`) using colored, low-opacity shadows instead of default gray.
- Add custom `keyframes`/`animation` for: `gradient-shift`, `float`, `shimmer`, `marquee` — but plan to replace the fade-in/slide-up scroll reveals with `framer-motion` `whileInView` instead of CSS classes.
- Add a fluid type scale (`clamp()`-based custom font sizes) for hero headings so they scale smoothly instead of jumping at breakpoints.
- Add a `radial-gradient`/mesh-gradient utility class for hero backgrounds (soft blurred color blobs, subtle, on-brand cyan/teal).

### 2. `components/hero.jsx`
- Wrap in `framer-motion` with staggered entrance (heading, subtitle, buttons each animate in with slight delay/offset).
- Add an animated gradient mesh / aurora blob background behind the text (absolutely positioned, blurred, slowly animating position via `framer-motion` or CSS `animation`).
- Animate the gradient text (`text-fade` span) subtly — e.g. slow gradient position shift.
- Make CTA buttons use the upgraded `Button` component (see below) with hover scale + glow.

### 3. `components/ui/button.jsx`
- Add `framer-motion`-powered hover/tap states: slight scale up on hover (`whileHover={{ scale: 1.03 }}`), scale down on tap (`whileTap={{ scale: 0.97 }}`).
- `primary` variant: add a subtle gradient background (primary → secondary accent) and a soft colored glow shadow on hover.
- `outline`/`ghost` variants: animated border/background fill on hover (sliding fill or gradient border).
- Keep the `asChild` prop behavior intact so `<Button asChild><a href=...></a></Button>` still works — wrap the cloned child, don't break existing usage across `hero.jsx`, `contact/page.jsx`, etc.

### 4. Cards — `service-card.jsx`, `project-card.jsx`, `review-card.jsx`
- Replace the flat `.card` / `.card-hover` utility classes with a richer treatment: soft layered shadow, subtle border gradient or glow on hover, slight lift + scale (`whileHover={{ y: -6, scale: 1.01 }}`) via `framer-motion`.
- Add a subtle shine/gradient-sweep effect on hover (a diagonal light sweep across the card) for `project-card.jsx` images.
- Stagger card entrance animations on scroll using `whileInView` + `viewport={{ once: true }}` instead of the current manual `animationDelay` inline styles — replace `.animate-slide-up` usage across `app/page.jsx`, `app/services/page.jsx`, `app/projects/page.jsx`, `app/reviews/page.jsx` with a shared `<Reveal>` or `<AnimatedGrid>` wrapper component to avoid repeating motion props everywhere.

### 5. Stats section (`app/page.jsx` `Stat` component)
- Animate numbers counting up from 0 when scrolled into view (simple custom hook or `framer-motion`'s `useMotionValue`/`animate`, no new dependency needed).

### 6. Header/Nav (`components/header.jsx`)
- Add scroll-aware header: shrink height and increase blur/opacity as the user scrolls down (use a small `useScroll`/`useMotionValueEvent` from `framer-motion` or a scroll-listener hook).
- Animate nav link underline on hover (sliding underline, not just color change).
- Animate mobile menu open/close with `framer-motion` instead of the current `<details>` CSS toggle, if feasible without breaking accessibility; otherwise keep `<details>` but animate the panel's opacity/scale on open.

### 7. Footer, Team section, Service "what's included" expand
- Footer: subtle fade/slide-in on scroll for each column.
- `team-section.jsx` already uses `framer-motion` — extend with hover lift on member cards and a subtle avatar scale/glow on hover.
- `service-card.jsx` feature list expand/collapse animation already uses `AnimatePresence` — polish the easing/duration and add a subtle bounce.

### 8. Reviews (`review-carousel.jsx`, `review-form.jsx`)
- Animate carousel card transitions more smoothly (snap scrolling is fine, but animate the nav arrow buttons with hover scale and add a subtle active-dot indicator row below the carousel).
- Animate the review submission success/error banner in `review-form.jsx` and `contact-form.jsx` with a smooth height/opacity transition (`AnimatePresence`) instead of an abrupt appearance.
- Animate star rating selection in `rating-input.jsx` (spring scale pop on selected star).

### 9. Page-level transitions
- Add a subtle route-level fade/slide transition between pages (e.g. via a shared layout wrapper using `framer-motion`'s `AnimatePresence` at the `app/layout.tsx` level, or per-page enter animation) — keep it fast (150–250ms) and non-blocking.

### 10. Loading state (`app/loading.jsx`)
- Replace the flat pulsing gray blocks with a shimmer/gradient-sweep skeleton animation to match the new premium feel.

### 11. Global polish (`app/globals.css`)
- Improve `::selection` styling with the brand color.
- Add a subtle noise/grain overlay utility class (SVG-based, very low opacity) usable behind hero/CTA sections for texture.
- Ensure smooth `color-scheme` / focus-visible outline styling matches the new palette in both light and dark mode.
- Wrap all new motion additions with a `@media (prefers-reduced-motion: reduce)` fallback (disable transforms/animations, keep opacity fades minimal or instant).

## Deliverable / process

1. Start with design tokens (`tailwind.config.js`, `globals.css`) so later component work has the palette/shadow/easing tokens to reference.
2. Build one shared `<Reveal>` (scroll-triggered fade/slide-up via `framer-motion`) and reuse it everywhere instead of duplicating `whileInView` props.
3. Upgrade `Button` next since it's used across every page.
4. Then go page/component by page/component per the list above.
5. After each major component, do a quick pass to confirm: dark mode still looks correct, no layout shift/broken responsive behavior at `sm`/`md`/`lg` breakpoints, and existing interactive features (contact form submit, review submit + reload, theme toggle, mobile nav) still function.
6. Do not modify `data/reviews.json`, `lib/reviews.js`, `app/api/*` route logic, or `lib/data.js` content — styling/animation only.
