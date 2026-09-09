"use client";

/**
 * HeroMotif — animated hero background for ghazanfarbank.com
 * -----------------------------------------------------------------
 * A khatam (star-and-cross) tessellation: eight-point stars on a 164px square
 * grid with their tips touching, a small cross filling every gap, drawn as thin
 * rounded outlines a few percent off the hero gradient. Revealed once on load
 * as a diagonal wave, then drifting by exactly one cell so the loop is seamless.
 *
 * Same technique as aib.af (oversized tone-on-tone motif, one reveal on load),
 * but pure SVG + CSS — no Lottie, no runtime dependency.
 *
 * Drop it into the hero section AFTER the gradient div and BEFORE the content div:
 *
 *   <section className="... relative h-screen w-full overflow-hidden">
 *     <div className="absolute inset-0" style={{ background: "linear-gradient(...)" }} />
 *     <HeroMotif variant="mark" />
 *     <div className="absolute inset-0 ... z-2"> ...headline... </div>
 *   </section>
 *
 * variant:
 *   "lattice" — the tessellation alone, quietest
 *   "mark"    — lattice with the oversized Ghazanfar “G” drawing in on top (recommended)
 *   "rosette" — lattice with one star blown up and blooming petal by petal
 */

import { useEffect, useRef } from "react";

/** The gold "G" from GeneralSettings_HeaderLogo.svg (the cls-1 path). */
const MARK =
  "M16.59,89.04c.31.06.46-.03.71-.19.92-.6,2.54-2.64,3.5-3.53,10.54-9.69,24.89-19.43,39.16-22.11,9.04-1.69,23.53-2.94,28.96,6.2,4.92,8.28,2.79,16.15-4.79,21.6-.32.23-2.83,1.63-2.67,1.84,8.64,3.4,10.58,11.49,8.38,19.94-3.86,14.79-26.16,35.85-42.18,26.65-4.3-2.47-6.95-6.44-9.08-10.81-6.31,7.69-16.18,16-26.86,12.2-3.84-1.36-7.04-4.32-9.02-7.85-5.96-10.61-1.19-26.07,6-35C.53,89.14.12,76.81,2.19,65.5,7.55,36.3,35.96,4.93,65.93.45c23.67-3.54,39.04,14.08,26.88,36.14-5.45,9.9-19.02,23.69-31.48,19.83-4.66-1.44-7.75-4.97-8.16-9.92-1.03-12.3,15.44-25.69,23.57-33.23.83-1,2.65.06,2.09,1.07-4.78,4.99-9.49,10.32-13.12,16.23-2.84,4.63-7.03,13.06-3.21,18.05,4.86,6.35,13.25-2.3,16.55-6.32,5.72-6.98,10.84-19.35,4.13-27.23-4.34-5.09-10.43-4.56-16.32-2.86-20.45,5.9-39.97,33.26-46.99,52.45-2.81,7.67-5.02,16.2-3.26,24.37ZM63.62,98.06c-.12-.19-.06-.78,0-1.03.27-1.06,5.56-4.75,6.79-5.87,4.69-4.29,12.13-13.61,7.02-19.89s-19.59-1.5-25.75.75c-9.06,3.3-17.55,8.27-24.95,14.42-1.03.86-7.4,6.45-7.51,7.17,5.97,7.15,16.61.81,22.53-3.39,5.08-3.6,9.27-8.16,14.45-11.66,5.48-3.7,11.89-6.86,18.4-8.18.96,2.15-1.92,2.64-3.38,3.52-8.42,5.1-10.62,11.96-14.44,20.32-4.91,10.73-9.92,21.51-16,31.61,8.13,16,22.7,2.84,29.58-6.57,3.6-4.92,8.41-13.1,6.16-19.35s-8.97.07-12.91-1.85ZM41.29,99.09c-.18-.19-4.03,2.33-4.54,2.59-7.17,3.55-17.21,4.77-23.92-.35-.24-.09-.38.03-.57.16-.52.36-2.34,3.14-2.78,3.85-4.41,7.14-6.63,17.77.39,24.09,7.33,6.61,13.7.27,18.13-5.76,5.46-7.43,9.87-16.03,13.29-24.58Z";

/** Grid cell. The drift animation translates by exactly this, so the loop is seamless. */
const CELL = 164;

/** Round every corner of a polygon: cut r off each side and arc through the vertex. */
function roundPoly(pts: [number, number][], r: number) {
  let d = "";
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[(i - 1 + n) % n], v = pts[i], q = pts[(i + 1) % n];
    const ax = v[0] - p[0], ay = v[1] - p[1];
    const bx = q[0] - v[0], by = q[1] - v[1];
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
    const ra = Math.min(r, la / 2), rb = Math.min(r, lb / 2);
    const sx = v[0] - (ax / la) * ra, sy = v[1] - (ay / la) * ra;
    const ex = v[0] + (bx / lb) * rb, ey = v[1] + (by / lb) * rb;
    d += `${i === 0 ? "M" : "L"}${sx.toFixed(2)},${sy.toFixed(2)}`;
    d += `Q${v[0].toFixed(2)},${v[1].toFixed(2)} ${ex.toFixed(2)},${ey.toFixed(2)}`;
  }
  return d + "Z";
}

/** Eight-point star — tips on the axes and the diagonals. */
function star(cx: number, cy: number, R: number) {
  const pts: [number, number][] = [];
  const ri = R * 0.7654;
  for (let k = 0; k < 8; k++) {
    const ao = (45 * k * Math.PI) / 180;
    const ai = ((45 * k + 22.5) * Math.PI) / 180;
    pts.push([cx + R * Math.cos(ao), cy + R * Math.sin(ao)]);
    pts.push([cx + ri * Math.cos(ai), cy + ri * Math.sin(ai)]);
  }
  return roundPoly(pts, R * 0.075);
}

/** The cross filling each gap, its four points meeting the surrounding stars. */
function cross(cx: number, cy: number, L: number, w: number) {
  const p: [number, number][] = (
    [[0, -L], [w, -w], [L, 0], [w, w], [0, L], [-w, w], [-L, 0], [-w, -w]] as [number, number][]
  ).map(([x, y]) => [cx + x, cy + y] as [number, number]);
  return roundPoly(p, w * 0.5);
}

type Variant = "lattice" | "mark" | "rosette";

export default function HeroMotif({
  variant = "mark",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  /* Build the SVG once the hero has been measured, so we only ever draw the
     tiles that are actually on screen. Rebuilt on resize (debounced). */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const NS = "http://www.w3.org/2000/svg";
    const el = (t: string, a: Record<string, string | number> = {}) => {
      const n = document.createElementNS(NS, t);
      for (const k in a) n.setAttribute(k, String(a[k]));
      return n;
    };

    const build = () => {
      const W = host.clientWidth;
      const H = host.clientHeight;
      if (!W || !H) return;

      host.replaceChildren();
      const svg = el("svg", {
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: "none",
        "aria-hidden": "true",
      });

      /* The mark and the rosette each sit in a clearing: a soft radial hole in
         the lattice, so the pattern never runs through them. */
      const cx = W * 0.72, cy = H * 0.5;
      let maskId: string | null = null;
      if (variant !== "lattice") {
        const rad = variant === "mark" ? H * 0.62 : H * 0.6;
        maskId = `gbClear-${variant}-${Math.random().toString(36).slice(2, 8)}`;
        const defs = el("defs");
        const grad = el("radialGradient", {
          id: `${maskId}g`, cx, cy, r: rad, gradientUnits: "userSpaceOnUse",
        });
        grad.appendChild(el("stop", { offset: "0", "stop-color": "#000" }));
        grad.appendChild(el("stop", { offset: ".52", "stop-color": "#000" }));
        grad.appendChild(el("stop", { offset: "1", "stop-color": "#fff" }));
        defs.appendChild(grad);
        const mask = el("mask", {
          id: maskId, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H,
        });
        mask.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, fill: "#fff" }));
        mask.appendChild(el("circle", { cx, cy, r: rad, fill: `url(#${maskId}g)` }));
        defs.appendChild(mask);
        svg.appendChild(defs);
      }

      /* --- the lattice, revealed as a diagonal wave --- */
      const S = CELL, R = S * 0.5;
      const g = el("g", { class: "gb-drift" });
      const cols = Math.ceil(W / S) + 3;
      const rows = Math.ceil(H / S) + 3;
      const maxd = cols + rows;

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const x = c * S, y = r * S;
          const t0 = 0.05 + ((c + r + 2) / maxd) * 2.6;

          const tile = el("g", { class: "gb-tile" }) as SVGGElement;
          tile.style.animationDelay = `${t0}s`;

          const st = el("path", {
            d: star(x, y, R),
            fill: "rgba(255,255,255,.055)",
            stroke: "rgba(255,255,255,.55)",
            "stroke-width": 1.5,
            "stroke-linejoin": "round",
            pathLength: 1,
            class: "gb-ink",
          }) as SVGPathElement;
          st.style.animationDelay = `${t0}s`;
          tile.appendChild(st);

          const cr = el("path", {
            d: cross(x + S / 2, y + S / 2, S * 0.23, S * 0.07),
            fill: "rgba(243,183,26,.055)",
            stroke: "rgba(255,255,255,.42)",
            "stroke-width": 1.4,
            "stroke-linejoin": "round",
            pathLength: 1,
            class: "gb-ink",
          }) as SVGPathElement;
          cr.style.animationDelay = `${t0 + 0.12}s`;
          tile.appendChild(cr);

          g.appendChild(tile);
        }
      }
      if (maskId) {
        const clipped = el("g", { mask: `url(#${maskId})` });
        clipped.appendChild(g);
        svg.appendChild(clipped);
      } else {
        svg.appendChild(g);
      }

      /* --- the "G", sized to leave clear air above and below --- */
      if (variant === "mark") {
        const mg = el("g", {
          transform: `translate(${cx} ${cy}) scale(${H / 235}) translate(-48 -71)`,
        });
        mg.appendChild(el("path", { d: MARK, fill: "rgba(255,255,255,.40)" }));
        const ink = el("path", {
          d: MARK, fill: "none", stroke: "rgba(0,68,148,.55)",
          "stroke-width": 0.9, pathLength: 1, class: "gb-ink gb-ink-mark",
        }) as SVGPathElement;
        ink.style.animationDelay = "1.1s";
        mg.appendChild(ink);
        svg.appendChild(mg);
      }

      /* --- one lattice star blown up, blooming petal by petal --- */
      if (variant === "rosette") {
        const RR = H * 0.46;
        const petal = "M0,0 C -0.19,-0.26 -0.20,-0.63 0,-1 C 0.20,-0.63 0.19,-0.26 0,0 Z";
        const wrap = el("g", { class: "gb-breathe" }) as SVGGElement;
        wrap.style.transformOrigin = `${cx}px ${cy}px`;

        for (let i = 0; i < 8; i++) {
          const arm = el("g", { transform: `rotate(${i * 45} ${cx} ${cy})` });
          const anim = el("g", { class: "gb-bloom" }) as SVGGElement;
          anim.style.transformOrigin = `${cx}px ${cy}px`;
          anim.style.animationDelay = `${0.9 + i * 0.09}s`;
          const scaled = el("g", { transform: `translate(${cx} ${cy}) scale(${RR})` });
          scaled.appendChild(
            el("path", { d: petal, fill: i % 2 ? "rgba(255,255,255,.27)" : "rgba(255,255,255,.17)" })
          );
          anim.appendChild(scaled);
          arm.appendChild(anim);
          wrap.appendChild(arm);
        }
        const core = el("circle", {
          cx, cy, r: H * 0.09, fill: "rgba(243,183,26,.14)", class: "gb-bloom",
        }) as SVGCircleElement;
        core.style.transformOrigin = `${cx}px ${cy}px`;
        core.style.animationDelay = "1.7s";
        wrap.appendChild(core);
        svg.appendChild(wrap);
      }

      host.appendChild(svg);
    };

    build();

    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(build, 200); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, [variant]);

  /* pointer parallax — skipped on touch and under reduced-motion */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const host = hostRef.current;
    if (!host) return;

    let mx = 0, my = 0, tx = 0, ty = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    const loop = () => {
      tx += (mx - tx) * 0.06;
      ty += (my - ty) * 0.06;
      host.style.transform = `translate3d(${(-tx * 22).toFixed(2)}px,${(-ty * 22).toFixed(2)}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className={`gb-motif-clip pointer-events-none absolute inset-0 z-[1] overflow-hidden ${className}`}>
      <div ref={hostRef} className="gb-motif" />

      <style jsx global>{`
        /* keep the lattice clear of the headline column */
        .gb-motif-clip {
          -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.18) 30%, #000 66%);
                  mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.18) 30%, #000 66%);
        }
        .gb-motif {
          position: absolute;
          inset: 0;
          will-change: transform;
        }
        .gb-motif svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .gb-tile {
          opacity: 0;
          animation: gb-fade-in 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          will-change: opacity;
        }
        .gb-ink {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: gb-draw 1.05s cubic-bezier(0.25, 0.6, 0.3, 1) forwards;
          will-change: stroke-dashoffset;
        }
        /* the mark is one long compound path - slower, near-constant pen speed */
        .gb-ink-mark {
          animation-duration: 2.6s;
          animation-timing-function: cubic-bezier(0.2, 0.55, 0.3, 1);
        }
        .gb-drift {
          animation: gb-drift 72s linear infinite;
        }
        .gb-bloom {
          transform-box: view-box;
          opacity: 0;
          animation: gb-bloom 1.5s cubic-bezier(0.16, 0.9, 0.3, 1) forwards;
        }
        .gb-breathe {
          transform-box: view-box;
          animation: gb-breathe 16s ease-in-out infinite alternate;
        }
        @keyframes gb-fade-in { to { opacity: 1; } }
        @keyframes gb-draw { to { stroke-dashoffset: 0; } }
        /* exactly one grid cell, so the loop never shows a seam */
        @keyframes gb-drift { to { transform: translate(-164px, -164px); } }
        @keyframes gb-bloom {
          0%   { opacity: 0; transform: scale(0.62) rotate(-14deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes gb-breathe {
          from { transform: scale(1); }
          to   { transform: scale(1.03); }
        }

        /* on phones the motif would sit behind the copy — move it below, soften it */
        @media (max-width: 768px) {
          .gb-motif-clip {
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 42%, #000 78%);
                    mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 42%, #000 78%);
            opacity: 0.72;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gb-tile, .gb-ink, .gb-bloom {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
          .gb-drift, .gb-breathe { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
