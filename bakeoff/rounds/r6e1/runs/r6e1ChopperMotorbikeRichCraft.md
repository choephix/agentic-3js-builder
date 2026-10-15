**Reading the renders.** The cues are a long-fork chopper with ape-hangers, a flame-painted tank with a V-twin, and hero-shooter graphics (teal glow, hex emblems, hazard trim).
- **Ape-hanger bars, long raked fork and sissy bar:** visible and in good proportion.
- **Flame tank and V-twin:** the tank reads small and the engine is a dark, noisy mass. The speckled "iron" and "steel" paints look dirty rather than hand-painted.
- **Hero-shooter graphics:** the teal wheel rings, hex emblems and beacons read well. The navy fenders and tank vanish into the navy deck, and the hazard rim shows no stripes from above. The pennant renders as dull brown.

**Changes, in priority order**
1. **Form and style (three-quarter, back).**
   - Chunkier tank: wider and taller, so the flames have room to read.
   - Wider rear tyre, so the rear end carries more weight.
   - Replace the speckled metal paints on chrome, frame and engine with clean two-tone hand-painted paints.
   - The engine, exhausts, forks and bars will read as bright steel and slate-blue shapes instead of grey noise.
2. **Soundness (three-quarter, back, top).**
   - The pennant card was lit from its back-facing normal, hence the brown. Rebuild it as a bevelled extruded swallowtail pennant, so it lights correctly.
   - It gets an orange body, a cream stripe, a navy hoist end and an emblem on both faces.
3. **Composition (three-quarter, top).**
   - Lighten the deck to a mid slate-blue, so the navy fenders and tank separate from the floor.
   - Stripe the hazard rim on its top face too; from above it becomes a bold orange/navy ring.
   - Slide the crates forward and out from behind the front wheel, so they no longer crowd the fender in the three-quarter view.
4. **Finish.** The glow rings, emblems and beacons stay as they are.

## Edits

<<<<<<< SEARCH
const CHROME = metal("steel", { polish: 0.9, tarnish: 0.05 });
const GUNM = metal("iron", { tarnish: 0.3, polish: 0.35 });
const BLUED = metal("blued");
=======
const CHROME = toned("#dce6f4", 0.25, 0.42);
const GUNM = toned("#566390", 0.25, 0.35);
const BLUED = metal("blued", { tarnish: 0.05, polish: 0.5 });
>>>>>>> REPLACE

<<<<<<< SEARCH
const HAZARD = paint((p, n) => {
  if (n.y > 0.5) return "#232a3d";
  const k = ((((p.x + p.z) / 0.14) % 1) + 1) % 1;
  return k < 0.5 ? ORANGE : "#1b2133";
});
const DECK = panelled(SLATE, { size: 0.4, aspect: 1, rivets: 0.1 });
=======
const HAZARD = paint((p, n) => {
  const k = ((((p.x + p.z) / 0.14) % 1) + 1) % 1;
  const c = k < 0.5 ? ORANGE : "#1b2133";
  return n.y > 0.5 ? c : mix(c, COOL, 0.3);
});
const DECK = panelled(toned("#5b6c9c", 0.2, 0.2), { size: 0.4, aspect: 1, rivets: 0.1 });
>>>>>>> REPLACE

<<<<<<< SEARCH
const FLAG_SVG = `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
<polygon points="0,100 60,100 60,42 30,0 0,42" fill="#f58a1f" stroke="#161f3a" stroke-width="4" stroke-linejoin="round"/>
<polygon points="30,48 48,58 48,78 30,88 12,78 12,58" fill="#27345c" stroke="#161f3a" stroke-width="3"/>
<path d="M33 54 L22 70 H29 L26 82 L38 66 H31 Z" fill="#ffe9bd"/>
</svg>`;

=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  const FLAG = svg(FLAG_SVG, { size: 160 });
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  wheel(wheelR, RC, 0.37, 0.11, 0.235, 0.2, 0.115);
=======
  wheel(wheelR, RC, 0.37, 0.125, 0.235, 0.2, 0.12);
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: V(0, 1.06, 0.3), w: 0.24, h: 0.2 },
      { at: V(0, 1.0, 0.1), w: 0.34, h: 0.25 },
=======
      { at: V(0, 1.06, 0.3), w: 0.3, h: 0.23 },
      { at: V(0, 1.0, 0.1), w: 0.4, h: 0.28 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards([frame(mv(top, 0, -0.01, 0), [0, 0, -1])], FLAG, {
    size: [0.2, 0.42],
    flow: [1, 0, 0],
    bend: 35,
    lean: 0,
    sink: 0,
    bone: frameJ,
  });
=======
  b.extrude(
    [
      [0, -0.1],
      [0.46, -0.1],
      [0.35, 0, "sharp"],
      [0.46, 0.1],
      [0, 0.1],
    ],
    {
      at: mv(top, 0, -0.12, 0),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      bone: frameJ,
      color: toned(
        paint((_p, _n, s) => {
          if (s[0] < 0.06) return NAVY;
          if (Math.abs(s[1]) < 0.02) return CREAM;
          return ORANGE;
        }),
        0.15,
        0.2,
      ),
    },
  );
  for (const s of [1, -1])
    P(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", frameJ, mv(top, s * 0.006, -0.12, -0.2), {
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(box(0.3, 0.3, 0.3), "#ffffff", stage, [-0.95, G + 0.15, 0.55], { rotation: [0, 12, 0], texture: CRATE });
  P(box(0.22, 0.22, 0.22), "#ffffff", stage, [-0.95, G + 0.41, 0.55], { rotation: [0, -25, 0], texture: CRATE });
=======
  P(box(0.3, 0.3, 0.3), "#ffffff", stage, [-0.98, G + 0.15, 0.82], { rotation: [0, 12, 0], texture: CRATE });
  P(box(0.22, 0.22, 0.22), "#ffffff", stage, [-0.98, G + 0.41, 0.82], { rotation: [0, -25, 0], texture: CRATE });
>>>>>>> REPLACE