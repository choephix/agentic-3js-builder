Cause: `mix(...)` returns an `[r, g, b]` array, which `lathe` rejects as a colour, and the `plinthFoot` lathe passed one as its `color`. I also fixed a latent bug nearby: the rune-ring `glow` call targeted whatever mesh was found last in the scene, which could be a painted one and throw next.

<<<<<<< SEARCH
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: mix("#1b2438", "#2a3550", 0.5), name: "plinthFoot" },
=======
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: "#222d44", name: "plinthFoot" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(planeGeo(0.9, 0.9, false), "#ffffff", {
=======
  const runeRingPart = b.part(planeGeo(0.9, 0.9, false), "#ffffff", {
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.root.children.length ? lastPart() : lastPart(), 1.1);
=======
  glow(runeRingPart, 1.1);
>>>>>>> REPLACE