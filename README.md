# Ghazanfar Bank — animated hero background

Four options for the empty right-hand side of the hero on
[ghazanfarbank.indiaondesk.com](https://ghazanfarbank.indiaondesk.com/).

Technique borrowed from [aib.af](https://aib.af/): an oversized tone-on-tone motif
behind the headline, revealed once on load. AIB ships it as a Lottie — these are
plain inline SVG + CSS, so nothing new enters the bundle.

The shape is the **khatam** star-and-cross tessellation from the reference image
(`reference-shape.png`): eight-point stars on a 164px square grid with their tips
touching, and a small cross filling every gap.

## Open these

Every `index.html` is standalone. Double-click it, or email the folder — no server,
no build step, no internet connection needed.

| Folder | What it shows |
|---|---|
| `index.html` | **Start here.** All three side by side, plus the motion spec and porting notes. |
| `option-a-lattice/` | The tessellation plus the app shot on the right. |
| `option-b-lattice-mark/` | The lattice with the "G" from the header logo sitting in a clearing. **Recommended.** |
| `option-c-lattice-rosette/` | The lattice with one star blown up, blooming petal by petal. |
| `option-d-light/` | Option A on a **white / off-white** ground, with the lattice ink switchable between **blue, gold and green**. App shot 25% larger. |

Each single-option file has a **Replay animation** button, bottom right, so you can
watch the intro again without reloading. Option D adds two more controls, bottom
left: three colour pills for the pattern colour, and a **Pattern size** slider.

### Option D — picking the pattern colour

The three inks live in CSS variables at the top of the `<style>` block. Lock one in
by setting the attribute on `<html>` and deleting the pills:

```html
<html lang="en" data-pattern="blue">   <!-- "blue" | "gold" | "green" -->
```

The ground is pure white for its first 70%; the theme colour only shows up as a
tint across the last 30%. The lattice itself sits at roughly half the ink weight of
the other options, and a soft white clearing (`.hero__scrim`) sits between the
pattern and the copy — the tessellation is background texture there, never
something the headline competes with.

### Option D — picking the pattern size

The **Pattern size** slider sweeps the grid cell from 56px (a dense net) to 200px
(a few large stars), 104px by default. Everything scales off it: star radius, the
crosses, and the drift loop, which always travels exactly one cell so the loop
stays seamless. Once you have settled on a number, set it in the script and drop
the slider:

```js
var CELL = 104;   // grid cell in px
```

To flip one file between options, change line 105:

```js
var VARIANT = "lattice";   // "lattice" | "mark" | "rosette"
```

## Why the mark and the lattice do not overlap

Two dense patterns on top of each other turn to mush. So the mark and the rosette
each get a **clearing** — a soft radial hole punched in the lattice, `0.62 × hero
height` across — and the mark is sized to leave clear air above and below it. The
lattice is the ground; the mark is the one thing on it.

There is a second mask on top of that: a horizontal fade that takes the whole motif
out before it reaches the headline column (transparent to 30%, solid past 66%). On
screens under 768px it turns vertical at 72% opacity, so the texture sits under the
buttons rather than behind the words.

## Porting into the Next.js site

`component/HeroMotif.tsx` is a client component with no dependencies. It slots into
the hero section that already exists, between the gradient layer and the content layer:

```tsx
<section className="section-spacing relative h-screen w-full overflow-hidden ...">

  {/* 1 · the khaki gradient, unchanged */}
  <div className="absolute inset-0" style={{ background: "linear-gradient(...)" }} />

  {/* 2 · NEW — z-[1], under the copy */}
  <HeroMotif variant="mark" />

  {/* 3 · the content layer, untouched */}
  <div className="absolute inset-0 pt-[150px] pb-[45px] z-2"> … </div>

</section>
```

The content layer already carries `z-2`, so the motif at `z-[1]` never touches it.
The component uses `styled-jsx` (`<style jsx global>`), which Next.js ships by
default. If your setup does not have it, move that block into a plain CSS file
and delete the `<style jsx global>` wrapper — nothing else changes.

## Motion

The lattice is not revealed by a fade. Each star is split into two open halves
that both start at its **left tip** and travel round to meet at its **right tip** —
which is where the next shape picks the line up. One column hands off to the next,
so a single line appears to grow through the whole net from left to right.

| Step | Duration | Stagger | What moves |
|---|---|---|---|
| Star opens | 0.62s | one column every 0.34s | Two half-outlines draw from the left tip and meet at the right |
| Cross follows | 0.42s | +0.45s after its column's star | The gap shape, wound to start at its own left point |
| Phones land | 0.95s | centre 1.50s, left 1.66s, right 1.80s | Centre rises; the outer two fan out from behind it |
| Light sweep | 1.80s | once, 3.40s | A single sheen across the phones, clipped to their silhouettes |
| Phone float | 9s | loop, alternate | ±9px, starts once they have landed |
| Ambient drift | 120s | loop | −104px diagonal — exactly one cell, so the loop never shows a seam |
| Pointer parallax | — | rAF, lerp .06 | ±22px counter to the cursor |

`stroke-dashoffset` is not GPU-composited, so every drawing path repaints each
frame. Because a column only starts as the previous one finishes, peak load is
about **78** concurrent draws out of 780 paths — that is what keeps it smooth.

The lattice takes about **7.4s** end to end in option A, deliberately slow. The
phones do not wait for it: they land at 1.5s so the product is there immediately
while the texture keeps unfolding behind them. Options B and C still use the
faster 4.6s sweep — say the word and I will match them.

## Accessibility and cost

- The layer is `aria-hidden` and `pointer-events-none`.
- Under `prefers-reduced-motion: reduce` every animation is dropped and the final
  frame renders immediately.
- Tiles are generated to fill the measured hero and rebuilt on resize, so no
  oversized off-screen grid is ever drawn.
- No library, no Lottie JSON. Option A embeds the app mockup as a data URI so the
  file stays standalone (~150 KB); the other two are ~30 KB.

## Brand values used

| | |
|---|---|
| Mark gold | `#f3b71a` |
| Action navy | `#004494` — the site's own `--primary` / `--blue` token |
| Hero gradient | `linear-gradient(#c6bd82 10%, #ddd7b5 40%, #ebe4d1 82%, #f5f1e6 100%)` |
| Motif strokes | white at 26–34%; the mark's outline is the CTA navy at 55% |
| Motif fills | white at 5.5%, gold at 5.5% |

The "G" path is lifted from the bank's own header logo SVG
(`GeneralSettings_HeaderLogo_1ff67a81-...svg`) — no new brand assets were drawn.

## SVG assets — `assets/`

Open `assets/index.html` to see them all rendered, including a seam test on the tile.

| File | What it is |
|---|---|
| `hero-background-full.svg` | **The whole hero background in one file** — khaki gradient + full lattice. `background: url(...) center / cover no-repeat;` |
| `hero-pattern-only.svg` | The same lattice with a transparent background, for layering over your own gradient or photography |
| `pattern-khatam-tile.svg` | One seamless 104×104 tile, for `background-repeat: repeat` |
| `pattern-khatam-currentcolor.svg` | The tile with `stroke="currentColor"` — inline only |
| `ghazanfar-mark.svg` | The "G" alone, gold `#f3b71a`, viewBox cropped tight (97 × 142) |
| `ghazanfar-mark-outline.svg` | The "G" as a navy `#004494` outline — the hero treatment |
| `ghazanfar-mark-currentcolor.svg` | The "G" inheriting `currentColor` — inline only |
| `ghazanfar-logo-full.svg` | Full lockup: mark + Arabic + wordmark |
| `ghazanfar-logo-full-reversed.svg` | Same, wordmark in white for navy or photography |

The pattern files are generated from the same maths as the animated hero, so the
static and animated versions line up exactly.

### Two things to know

**`currentColor` only works inline.** Through `<img>` or `url()` the browser renders
an SVG in its own isolated document, where there is no parent colour to inherit. Use
the fixed-colour files in those places.

**The logo files keep the logo's own navy, `#1b4b99`** — that is what the official
header logo SVG declares. The site's UI navy is `#004494` (`--primary` / `--blue`),
which is what the buttons and `ghazanfar-mark-outline.svg` use. The two are close but
not the same; I have not "corrected" the logo, since that is a brand decision.
