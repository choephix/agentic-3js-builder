1. **Face reads as a red mask.** The nose is far too big and sits right between the eyes, covering them. I shrank it and moved it forward and down, moved its highlight with it, and pushed the eyes further apart and made them bigger so the gnome's gaze reads.
2. **Skin goes muddy brown in shadow.** The head was a painted `paint(() => SKIN)`, which bakes dark. I switched it to a flat colour string so it matches the hands.
3. **Legs and boots merge into one brown mass.** I made the trousers an olive-green stripe, so the tunic, trousers, boots and belt separate into clear colour blocks.
4. **Backpack is near-black.** It hides the gadgets it carries. I lightened the pack and flap leathers so the brass, copper and gear details stand out against them.

<<<<<<< SEARCH
  const PANTS = stripes("#7a5a3a", "#69492c", { size: 0.035, axis: "y", width: 0.3, seed: 3 });
=======
  const PANTS = stripes("#7d9a4e", "#62803a", { size: 0.035, axis: "y", width: 0.3, seed: 3 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const PACK = patches("#5b3b24", "#7b5232", { size: 0.07, gap: 0.06, seed: 9 });
  const FLAP = patches("#43291a", "#5a3822", { size: 0.06, gap: 0.07, seed: 12 });
=======
  const PACK = patches("#8a5c36", "#a8703e", { size: 0.07, gap: 0.06, seed: 9 });
  const FLAP = patches("#6a4226", "#83522d", { size: 0.06, gap: 0.07, seed: 12 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const skullPaint = paint(() => SKIN);
=======
  const skullPaint = SKIN;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const eh = hskin.around(HEAD_C).at(s * 28, 6);
    if (eh) b.decal(skull, EYE, { at: eh, size: [0.042, 0.05], mirror: s > 0 });
=======
    const eh = hskin.around(HEAD_C).at(s * 36, 9);
    if (eh) b.decal(skull, EYE, { at: eh, size: [0.052, 0.062], mirror: s > 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.SphereGeometry(1, 8, 6), "#f08a7c", { bone: head, at: [0, 0.728, 0.145], scale: [0.047, 0.042, 0.046], flat: true });
  b.part(new THREE.SphereGeometry(1, 5, 4), "#ffd6c8", { bone: head, at: [0.008, 0.742, 0.178], scale: [0.012, 0.008, 0.008] });
=======
  b.part(new THREE.SphereGeometry(1, 8, 6), "#f08a7c", { bone: head, at: [0, 0.72, 0.152], scale: [0.034, 0.03, 0.034], flat: true });
  b.part(new THREE.SphereGeometry(1, 5, 4), "#ffd6c8", { bone: head, at: [0.008, 0.731, 0.178], scale: [0.009, 0.006, 0.006] });
>>>>>>> REPLACE