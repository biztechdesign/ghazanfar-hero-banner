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
| `00-preview-all/` | **Start here.** All three side by side, plus the motion spec and porting notes. |
| `option-a-lattice/` | The tessellation alone. Quietest — pure texture, nothing competing with the headline. |
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

| Step | Duration | Stagger | What moves |
|---|---|---|---|
| Tiles appear | 1.20s | wave, 2.6s total | Opacity per tile, ordered by `col + row` — a diagonal sweep from the top-left |
| Outlines draw | 1.05s | same wave | `stroke-dashoffset` 1 → 0 on `pathLength="1"`, so every star takes the same time |
| Crosses follow | 1.05s | wave, +120ms | The gap shapes trail their four surrounding stars |
| Mark draws | 2.60s | once, +1.10s | Option B — one long compound path, so it gets a slower near-constant pen speed |
| Rosette blooms | 1.50s | 90ms × 8 | Option C — each petal scales from 0.62 and unwinds −14° |
| Ambient drift | 72s | loop | −164px diagonal — exactly one cell, so the loop never shows a seam |
| Pointer parallax | — | rAF, lerp .06 | ±22px counter to the cursor |

The intro plays once. The drift never stops but moves about 2px per second.

`stroke-dashoffset` is not GPU-composited — every drawing path repaints each frame.
The wave is deliberately spread wider than each draw lasts, so peak load is **168**
concurrent draws rather than all 281 at once.

## Accessibility and cost

- The layer is `aria-hidden` and `pointer-events-none`.
- Under `prefers-reduced-motion: reduce` every animation is dropped and the final
  frame renders immediately.
- Tiles are generated to fill the measured hero and rebuilt on resize, so no
  oversized off-screen grid is ever drawn.
- About 5 KB of markup. No library, no Lottie JSON, no image request.

## Brand values used

| | |
|---|---|
| Mark gold | `#f3b71a` |
| Action navy | `#004494` — the site's own `--primary` / `--blue` token |
| Hero gradient | `linear-gradient(#c6bd82 10%, #ddd7b5 40%, #ebe4d1 82%, #f5f1e6 100%)` |
| Motif strokes | white at 42–55%; the mark's outline is the CTA navy at 55% |
| Motif fills | white at 5.5%, gold at 5.5% |

The "G" path is lifted from the bank's own header logo SVG
(`GeneralSettings_HeaderLogo_1ff67a81-...svg`) — no new brand assets were drawn.
