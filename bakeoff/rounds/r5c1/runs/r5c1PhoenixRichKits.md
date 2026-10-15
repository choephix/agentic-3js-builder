1. **Muddy shadows.** `shadowOf` turns the yellow and gold feathers olive-brown, which reads as dirty rather than flame. I replaced it with a warm shade that pushes yellows to orange and orange to crimson, for the feather ramps and the body, neck and head paints. The belly is now a lighter gold.
2. **Wings.** They were flat and edge-on in the front view, with thick pipe-like arms. I raised the elbow and wrist for a heroic upswept V, lifted the primaries, and thinned the arm tubes so the feathers carry the shape.
3. **Face.** The head is bigger and the anime eyes are about 30% larger and sit more forward, so the face reads at a glance.
4. **Chest emblem.** It landed on the underside as a tiny dark spot. I re-aimed the ray and decal so it sits on the chest and is larger.
5. **Tail.** The fan was a flat sheet. The central feathers now rise slightly and the outer ones droop, giving an arc.
6. **Body and embers.** The torso gets more sides so it looks less like a faceted blob. Embers become tall teardrop flames.

<<<<<<< SEARCH
const LIGHT = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
=======
const LIGHT = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

// Warm flame shadow: yellows go orange, oranges go crimson (never olive).
const warmShade = (hex: string) => {
  const c = new THREE.Color(hex);
  c.setRGB(c.r * 0.92, c.g * 0.55, c.b * 0.42);
  return "#" + c.getHexString();
};
const CEL_RED = cel(RED, "#a8181a");
const CEL_ORANGE = cel(ORANGE, "#d4321a");
const CEL_BELLY = cel("#ffd877", "#f29238");
>>>>>>> REPLACE

<<<<<<< SEARCH
    const shade = ramp.map((c) => shadowOf(c));
=======
    const shade = ramp.map((c) => warmShade(c));
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BODY_PAINT = cel(
    furEdge(RED, GOLD_HEX, { axis: [0, 1, 0], level: -0.1, teeth: 0.35, period: 0.04, along: [0, 0, 1] }),
  );
=======
  const BODY_PAINT = furEdge(CEL_RED, CEL_BELLY, {
    axis: [0, 1, 0],
    level: -0.1,
    teeth: 0.35,
    period: 0.04,
    along: [0, 0, 1],
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: BODY_PAINT, caps: "round", extend: [0.12, 0.1], shift: [0, -0.02] },
=======
    { color: BODY_PAINT, caps: "round", extend: [0.12, 0.1], shift: [0, -0.02], sides: 10 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  const NECK_PAINT = cel(
    furEdge(GOLD_HEX, RED, { axis: [0, 0.25, 1], level: 0.15, teeth: 0.3, period: 0.03, along: [1, 0, 0] }),
  );
=======
  const NECK_PAINT = furEdge(CEL_BELLY, CEL_RED, {
    axis: [0, 0.25, 1],
    level: 0.15,
    teeth: 0.3,
    period: 0.03,
    along: [1, 0, 0],
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const HEAD_PAINT = cel(
    furEdge(GOLD_HEX, ORANGE, { axis: [0, -0.1, 1], level: 0.1, teeth: 0.35, period: 0.035, along: [1, 0, 0] }),
  );
=======
  const HEAD_PAINT = furEdge(CEL_BELLY, CEL_ORANGE, {
    axis: [0, -0.1, 1],
    level: 0.1,
    teeth: 0.35,
    period: 0.035,
    along: [1, 0, 0],
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.15, 0.14, 0.17],
=======
    scale: [0.17, 0.16, 0.18],
>>>>>>> REPLACE

<<<<<<< SEARCH
      const hit = skullSkin.around(HC).at(s * 48, 4);
      if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.075, 0.103], mirror: s > 0 });
=======
      const hit = skullSkin.around(HC).at(s * 42, 2);
      if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.1, 0.137], mirror: s > 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const el = V(s * 0.9, 1.38, -0.05);
    const wr = V(s * 1.55, 1.5, 0.12);
=======
    const el = V(s * 0.9, 1.52, -0.05);
    const wr = V(s * 1.55, 1.8, 0.12);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const armSweep = b.sweep(arm, [0.065, 0.045], { color: GOLD, caps: "round" });
=======
    const armSweep = b.sweep(arm, [0.05, 0.032], { color: GOLD, caps: "round" });
>>>>>>> REPLACE

<<<<<<< SEARCH
      const d = V(s * Math.cos(a), 0.1 - 0.012 * k, -Math.sin(a)).normalize();
=======
      const d = V(s * Math.cos(a), 0.26 - 0.03 * k, -Math.sin(a)).normalize();
>>>>>>> REPLACE

<<<<<<< SEARCH
      const d = V(Math.sin(phi) * 0.95, -0.05, -Math.cos(phi)).normalize();
=======
      const d = V(Math.sin(phi) * 0.95, 0.12 - 0.045 * ak, -Math.cos(phi)).normalize();
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hit = torsoSkin.ray([0, 1.15, 2], [0, -0.15, -1]);
    if (hit) b.decal(torsoSkin, EMBLEM, { at: hit, size: [0.17, 0.17] });
=======
    const hit = torsoSkin.ray([0, 1.14, 2], [0, -0.05, -1]);
    if (hit) b.decal(torsoSkin, EMBLEM, { at: hit, dir: [0, 0.1, 1], size: [0.21, 0.21] });
>>>>>>> REPLACE

<<<<<<< SEARCH
          scale: sc,
=======
          scale: [sc, sc * 1.9, sc],
>>>>>>> REPLACE