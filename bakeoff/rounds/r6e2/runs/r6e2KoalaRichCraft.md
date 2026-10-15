**Review against the brief**

- **Koala identity cues.**
  - The round cream-rimmed ears are visible and read well from the front.
  - The big black nose is visible but too large. It juts out as a black block in the head close-up, and it crowds two small eyes.
  - The head is barely wider than the torso, so the face lacks the big, flat, cute koala proportion.
  - The grey fur with a cream chest bib reads, but the paws are near-black and the back is very dark in the back view.
- **Gripping the branch.** The hands and feet sit on the fork limbs, but they read as dark lumps.
- **Soundness.** No gaps or floating parts. Only the back-view fur is too dark.
- **Composition.** The plinth fits and the koala is centred, but the head is small for the frame.

**Changes, in priority order**

1. **Bigger head (three-quarter, front, head close-up).** The head and jaw boxes scale up 25% about the neck pivot through the `box` helper, so the face, muzzle, cheek ruffs and jaw all grow together. The head will clearly dominate the torso and the character will look cuter.
2. **Smaller, softer nose (head close-up).** The muzzle becomes a lighter grey box and the black nose a smaller oval that sits inside it. The nose will no longer be a protruding black block.
3. **Bigger eyes (front, head).** The eye decals grow from 4.6 cm to 6.4 cm and sit on the scaled face. The face will read at once from the front.
4. **Rebuilt, bigger ears (front, three-quarter).** The ears get larger steps on the pixel grid and sit further out on the head. A cream rim of boxes follows the ear outline, and a larger pink-cream inner ear sits in front of it. The silhouette gets the classic koala fluff discs.
5. **Lighter paws (front, three-quarter).** The paws change from near-black to mid-grey, so the hands and feet read as paws.
6. **Lighter back fur (back view).** The fur paint now brightens on faces turned away from the camera, so the back view is no longer a dark slab.

## Edits

<<<<<<< SEARCH
  const box = (bone: Joint, size: V, at: V, color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...opts });
=======
  const HS = 1.25; // head scale about the neck pivot
  const box = (bone: Joint, size: V, at: V, color: any, opts: any = {}) => {
    const k = bone === head || bone === jaw ? HS : 1;
    const p: V = k === 1 ? at : [at[0] * k, 0.77 + (at[1] - 0.77) * k, 0.06 + (at[2] - 0.06) * k];
    return b.part(new THREE.BoxGeometry(size[0] * k, size[1] * k, size[2] * k), color, { bone, at: p, ...opts });
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
        bias + 0.26 * c.n.y + 0.1 * c.n.z + (noise(c.at, 0.09, seed) - 0.5) * 0.5 + (c.random(seed) - 0.5) * 0.28;
=======
        bias + 0.26 * c.n.y + 0.1 * Math.abs(c.n.z) + (noise(c.at, 0.09, seed) - 0.5) * 0.5 + (c.random(seed) - 0.5) * 0.28;
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(head, [0.11, 0.075, 0.05], [0, 0.8, 0.19], fur(GREY, 0.68, 7));
  box(head, [0.085, 0.055, 0.04], [0, 0.835, 0.215], INKBLACK);
=======
  box(head, [0.12, 0.08, 0.05], [0, 0.805, 0.185], FUR_LT);
  box(head, [0.07, 0.05, 0.036], [0, 0.838, 0.215], INKBLACK);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.046, 0.046, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.068, 0.878, 0.176],
    });
=======
    b.part(new THREE.BoxGeometry(0.064, 0.064, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.085, 0.905, 0.206],
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const outer = stepped([2, 3, 4, 4, 4, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]), 0.018, { rows: true });
    const inner = stepped([1, 2, 3, 3, 3, 2, 1].map((h) => [-h, h] as [number, number]), 0.018, { rows: true });
    b.extrude(outer, { at: [s * 0.125, 0.875, 0.05], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: FUR_LT, bone: ear });
    b.extrude(inner, { at: [s * 0.125, 0.893, 0.074], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: FUR_CR, bone: ear });
    const rim: V[] = [[0.2, 0.91, 0.08], [0.2, 0.965, 0.08], [0.172, 1.012, 0.08], [0.125, 1.04, 0.08], [0.078, 1.012, 0.08]];
    for (const [x, y, z] of rim) box(ear, [0.03, 0.032, 0.03], [s * x, y, z], FUR_CR);
=======
    const CELL = 0.021;
    const outer = stepped([2, 3, 4, 4, 4, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]), CELL, { rows: true });
    const inner = stepped([1, 2, 3, 3, 3, 2, 1].map((h) => [-h, h] as [number, number]), CELL, { rows: true });
    b.extrude(outer, { at: [s * 0.15, 0.9, 0.07], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: FUR_LT, bone: ear });
    b.extrude(inner, { at: [s * 0.15, 0.925, 0.09], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: FUR_CR, bone: ear });
    for (let k = 0; k <= 8; k++) {
      const a = (k * Math.PI) / 8;
      box(ear, [0.034, 0.034, 0.034], [s * (0.15 + 0.09 * Math.cos(a)), 0.9945 + 0.099 * Math.sin(a), 0.08], FUR_CR);
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  const PAW = fur(GREY_DK, 0.6, 8);
=======
  const PAW = fur(GREY, 0.42, 8);
>>>>>>> REPLACE