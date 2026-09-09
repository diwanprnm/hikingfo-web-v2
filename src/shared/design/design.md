# hikingfo — Hallmark Design System

Locked 2026-09-04, task T098. This is the single source of truth for the UI.

## The system

- **Genre**: playful (warm-human community register — the plan's direction)
- **Theme**: Hum, **retuned to white & blue (user brief, 2026-09-05)** — near-white
  cool paper, mountain-blue primary (brand family, hue 245), sky-cyan secondary,
  coral pop, mint success. Rounded sans, generous radii, soft lifting shadows,
  press-down buttons. Pear (hue 95) removed — brand-300 shadow tone replaced by
  solid blue push buttons (white text on brand-600).
- **Macrostructure**: Catalogue spine for browse pages (the page is a visual index
  of mountains — uniform card grid, inventory header, no hero), rail-titled bands
  for the feed (Ecosystem Index rhythm), split form/proof for partner search
- **Nav**: N1b three-section (left cluster · wordmark · right cluster), sticky,
  paper/90 blur — no centred link row, no CTA-right-only
- **Footer**: Ft5 statement — one warm sentence, muted meta under it
- **Fonts**: Plus Jakarta Sans (display+body, rounded humanist) + JetBrains Mono
  (uppercase mono labels, stats). No serif anywhere.
- **Motion register**: spring-bouncy on cards, snappy press on buttons, ≤3
  primitives per page. `prefers-reduced-motion` collapses all of it.

## The rules

1. **All colours/fonts via tokens.** Tailwind utilities (`bg-brand-600`,
   `text-ink-900`, `rounded-card`) map to the `@theme` block in
   `src/assets/main.css`, which mirrors `src/shared/design/tokens.css`. Never
   inline hex/OKLCH in components.
2. **Ink is tuned by opacity, not new hexes**: body ~90% of ink, hover 100%.
   `text-ink-600/400/700` exist for muted steps — don't add new shades.
3. **Blue owns primary action; cyan owns links/hover tints; coral is one
   high-energy moment per page (badge earned, verified stamp); mint owns
   success/verified states.** No gradients between accents, ever.
4. **No pure white paper, no pure black ink, no square corners on cards, pills,
   inputs.** Cards 20px, pills 999px, inputs 12px.
5. **The push button.** Primary CTA carries a solid blue fill (white text) +
   darker-blue edge + soft cast shadow; hover lifts −2px, `:active` presses down
   +3px with the edge shrinking. The press IS the feedback. One push button per
   primary moment.
6. **Card physics**: tinted-at-rest cards (~6% accent) that deepen to ~12% and
   lift −4px with shadow brighten on hover. Vary tints across cards
   (color-shift grid) — never three identical cards in a row.
7. **Emphasis = weight or colour, never italics.** Headings always roman.
8. **Section-heads stack** (label above, heading below, same column). Never a
   tag-left / heading-right hang.
9. **One off-grid moment per page** (a tilted card, a numeral bleeding the
   gutter) and **one designed exception** (a deadpan aside, a drawn mark).
10. **Clickable text never wraps** — `whitespace-nowrap` on buttons/nav/footer
    links; shorten the label first. Image grid tracks use `minmax(0, 1fr)`.
11. **Mobile floor: 320/375/414/768px** — no horizontal scroll
    (`overflow-x: clip` on html/body), focus rings ≥3:1, `:focus-visible`
    everywhere, hit areas ≥44px on touch.
12. **Honest copy**: real counts only, specific verbs (`Simpan`, `Catat
    Pendakian`), errors name what broke + how to fix. No "Unleash", no
    "Supercharge", no em-dash pile-ups.

## Tokens file

`src/shared/design/tokens.css` carries the commented OKLCH values; Tailwind's
`@theme` in `src/assets/main.css` is the operative copy. Edit values there and
keep this file in sync.

## Variants

### Home surface — studied DNA (locked 2026-09-05)

The home route (`MountainListPage`) uses a **Marquee Hero + search overlay**
macrostructure, extracted via `hallmark study` from a user-supplied reference
(image mode). Type, colour, and component voice stay Hum — only the structure
is studied.

- **Hero band**: full-bleed blue-tinted band (brand-100), eyebrow pill, short
  display headline with `.hl` emphasis band, one honest stat (live
  `results.total` — never a hardcoded count). No photography: `photo_url` is
  not populated in v1, so the hero is a flat tinted band, not a fake photo.
- **Search overlay**: raised card overlapping the hero's bottom edge
  (`-mt`), one row on desktop (query · region · difficulty · push button),
  stacked on mobile. This is the surface's signature move.
- **Destination cards**: tinted-at-rest cards (color-shift rotation), big
  initial-glyph mast, info chips (height / region / difficulty pill).
- **Split CTA band**: two RouterLink cards (journeys feed · record hike) —
  no icon-row cliché, no newsletter bar.
- **Anti-patterns banned from the reference** (do NOT carry over): script/
  italic accent words, identical 4-icon feature rows, "Bestseller/Trending"
  badges, invented prices or metrics, blue newsletter bar, "Why Choose Us".
- Diversification stays inverted on this variant: interior pages keep the
  Catalogue spine; the home keeps the hero+overlay fingerprint.
