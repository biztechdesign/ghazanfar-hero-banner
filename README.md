# Ghazanfar Bank — animated hero background

Three options for the empty right-hand side of the hero on
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

Each single-option file has a **Replay animation** button, bottom right, so you can
watch the intro again without reloading.

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
| Star opens | 0.38s | one column every 0.22s | Two half-outlines draw from the left tip and meet at the right |
| Cross follows | 0.26s | +0.27s after its column's star | The gap shape, wound to start at its own left point |
| Phones land | 0.95s | centre 2.50s, left 2.66s, right 2.80s | Centre rises; the outer two fan out from behind it |
| Light sweep | 1.60s | once, 4.20s | A single sheen across the phones, clipped to their silhouettes |
| Phone float | 7s | loop, alternate | ±9px, starts once they have landed |
| Ambient drift | 72s | loop | −104px diagonal — exactly one cell, so the loop never shows a seam |
| Pointer parallax | — | rAF, lerp .06 | ±22px counter to the cursor |

`stroke-dashoffset` is not GPU-composited, so every drawing path repaints each
frame. Because a column only starts as the previous one finishes, peak load is
about **50** concurrent draws out of 780 paths — that is what keeps it smooth.

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
