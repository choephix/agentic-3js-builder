1. **The front arms hid the face.** In the three-quarter view the near front tentacle crossed the maw and eye. I spread both front arms from ±48° to ±60° so the face reads from every angle.
2. **The tentacle undersides read as muddy brown.** I swapped them for a brighter coral-pink gradient, closer to Overwatch's saturated palette.
3. **The tentacles were thin next to the mantle.** I thickened them (base radius 0.25 → 0.30, tip 0.032 → 0.04) so the silhouette feels heavy.
4. **The mantle was a flat violet bullet.** I added glowing aqua chevron bands along the dorsal line, painted in the tube's own surface coordinates. This gives the hero shape a strong, readable pattern.
5. **The eyes needed more presence.** I enlarged the eye balls and decals (0.26 → 0.30, decal 0.36 → 0.42) and raised the angry brow a little.
6. **The stage needed a signature glow.** I added a glowing aqua rim ring around the water edge, which frames the kraken like a hero-shooter map callout.

<<<<<<< SEARCH
const BODY_TOP = paint((p, n) => {
=======
const BODY_TOP = paint((p, n, s) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
  if (cl.d1 < 0.055 && cl.id > 0.35) c = mix(c, AQUA, 0.85);
=======
  if (cl.d1 < 0.055 && cl.id > 0.35) c = mix(c, AQUA, 0.85);
  const dd = Math.abs(((s[1] + 540) % 360) - 180);
  if (s[0] > 0.3 && s[0] < 0.92 && dd < 52) {
    const w = (s[0] * 15 + dd / 160) % 1;
    if (w < 0.13) c = mix(c, AQUA, 0.85 * smoothstep(52, 40, dd));
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
const ARM_BELLY = paint((p) => mix(CORAL, PEACH, smoothstep(0.7, 2.8, Math.hypot(p.x, p.z)) * 0.8 + noise(p, 0.3, 4) * 0.2));
=======
const ARM_BELLY = paint((p) => mix("#ff7f9a", "#ffd0b8", smoothstep(0.7, 2.8, Math.hypot(p.x, p.z)) * 0.8 + noise(p, 0.3, 4) * 0.2));
>>>>>>> REPLACE

<<<<<<< SEARCH
const armR = (t: number) => 0.25 * Math.pow(1 - t, 1.5) + 0.032;
=======
const armR = (t: number) => 0.3 * Math.pow(1 - t, 1.5) + 0.04;
>>>>>>> REPLACE

<<<<<<< SEARCH
  { n: "FR", az: -48, keys: UPF },
=======
  { n: "FR", az: -60, keys: UPF },
>>>>>>> REPLACE

<<<<<<< SEARCH
  { n: "FL", az: 48, keys: UPF },
=======
  { n: "FL", az: 60, keys: UPF },
>>>>>>> REPLACE

<<<<<<< SEARCH
    const ball = glow(b.part(new THREE.SphereGeometry(0.26, 12, 8), "#ffe9a0", { bone: head, at: E }), 0.8);
    b.decal(ball, EYE, { at: E.clone().addScaledVector(g, 0.26), dir: g, size: [0.36, 0.36], segments: 8, bone: head });
=======
    const ball = glow(b.part(new THREE.SphereGeometry(0.3, 12, 8), "#ffe9a0", { bone: head, at: E }), 0.8);
    b.decal(ball, EYE, { at: E.clone().addScaledVector(g, 0.3), dir: g, size: [0.42, 0.42], segments: 8, bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const browAt = E.clone().add(V(0, 0.17, 0)).addScaledVector(g, 0.05);
=======
    const browAt = E.clone().add(V(0, 0.2, 0)).addScaledVector(g, 0.06);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(catmull(circlePts(0.95, 0.4, 14), { closed: true }), 0.07, { color: FOAM, sides: 6, bone: root });
=======
  b.sweep(catmull(circlePts(0.95, 0.4, 14), { closed: true }), 0.07, { color: FOAM, sides: 6, bone: root });
  glow(b.sweep(catmull(circlePts(3.22, 0.367, 28), { closed: true }), 0.025, { color: AQUA, sides: 5, bone: root }), 1.4);
>>>>>>> REPLACE