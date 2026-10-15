1. **Material cleanup (finish, biggest gain).** The `metal()` paints read as dirty camouflage on the engine, frame and exhaust, and the pipes look like grey spirals. I'm replacing chrome, gunmetal and blued steel with hard-banded cel paints in the Overwatch style: bright sky band, dark horizon line, cool underside. The next render should show clean, graphic chrome and a crisp dark-navy engine and frame. The primary cover, air cleaner and exhaust should read as separate objects.
2. **Pennant flag.** It renders as a muddy brown card because it is lit from the edge. I'm making it glow so the orange and bolt emblem read like a team banner.
3. **Composition.** The crates stand behind the front wheel and hide it in the three-quarter view. I'm moving the crate stack to the rear-left corner and the toolbox to mid-left, clear of both wheels. The front wheel, fork and headlight should be unobstructed.

## Edits

<<<<<<< SEARCH
  metal,
  panelled,
=======
  panelled,
>>>>>>> REPLACE

<<<<<<< SEARCH
const CHROME = metal("steel", { polish: 0.9, tarnish: 0.05 });
const GUNM = metal("iron", { tarnish: 0.3, polish: 0.35 });
const BLUED = metal("blued");
=======
// Stylised hard-banded chrome: bright sky band, dark horizon line, cool underside.
const CHROME = paint((_p, n) =>
  n.y > 0.6 ? "#f6faff" : n.y > 0.15 ? "#c9d8ec" : n.y > -0.2 ? "#56668a" : n.y > -0.65 ? "#a3b5d2" : "#7487ad",
);
const GUNM = paint((_p, n) => (n.y > 0.45 ? "#66749c" : n.y > -0.05 ? "#455170" : n.y > -0.5 ? "#2f3858" : "#222947"));
const BLUED = paint((_p, n) => (n.y > 0.3 ? "#7a98e8" : n.y > -0.2 ? "#3f5cb0" : "#27397c"));
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
  glow(
    b.cards([frame(mv(top, 0, -0.01, 0), [0, 0, -1])], FLAG, {
      size: [0.2, 0.42],
      flow: [1, 0, 0],
      bend: 35,
      lean: 0,
      sink: 0,
      bone: frameJ,
    }),
    0.85,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const x = -0.9;
    const z = -0.55;
=======
    const x = -0.9;
    const z = 0.1;
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(box(0.3, 0.3, 0.3), "#ffffff", stage, [-0.95, G + 0.15, 0.55], { rotation: [0, 12, 0], texture: CRATE });
  P(box(0.22, 0.22, 0.22), "#ffffff", stage, [-0.95, G + 0.41, 0.55], { rotation: [0, -25, 0], texture: CRATE });
=======
  P(box(0.3, 0.3, 0.3), "#ffffff", stage, [-0.85, G + 0.15, -0.72], { rotation: [0, 12, 0], texture: CRATE });
  P(box(0.22, 0.22, 0.22), "#ffffff", stage, [-0.85, G + 0.41, -0.72], { rotation: [0, -25, 0], texture: CRATE });
>>>>>>> REPLACE