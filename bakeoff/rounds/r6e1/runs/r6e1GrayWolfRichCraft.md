**Art-director read**

- **Identity cues:** (a) The lupine head has a long muzzle, tall pointed ears and amber eyes. It reads, and both eyes show from the front, but the eyes are a little small and the cheek war paint prints as a noisy blue checker. (b) The ruff and mane are the biggest problem. Dark, hard shards read as a porcupine or armour, not thick wolf fur, and stray tufts at the ears and a hooked tuft under the chin look like debris. (c) The tail is a thin tongue hanging straight down between the hind legs, so the bushy dark-tipped wolf tail is missing from the back and three-quarter views.
- **Composition:** The banner stands in front of the wolf's body in the three-quarter view, and the obelisk crystal sits right over its ears. Both clash with the silhouette.

**Changes, in priority order**

1. **Mane and ruff** (three-quarter, top and head views). Lighter root-to-tip colour, fewer and wider blades, side tufts only on the shoulders, and fewer dark fur cards. The wolf should read as soft gray fur with a cream bib, not spikes.
2. **Stray bits and tail** (head close-up and back view). Remove the chin hook and the ear-side tan bars. The tail becomes bushier and sweeps back more, so it shows as a real brush with a dark tip from behind.
3. **Face and legs** (head close-up and front view). Larger eyes, bold war-paint slashes in place of the checker, thicker forelegs and a 2048 paint sheet so painted details stay crisp.
4. **Props** (three-quarter and front views). The banner moves to the right flank beside the rump, the obelisk goes forward-left so its crystal clears the ears, and the pine and the rocks, mounds and ice crystals shift to match. The wolf's silhouette is then unobstructed.

## Edits

<<<<<<< SEARCH
  const b = createBuilder({ name: "frostwolf" });
=======
  const b = createBuilder({ name: "frostwolf", paintSize: 2048 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const t = smoothstep(0, 0.22, s[1]);
  const c = mix(mix(FUR_D, FUR_M, t * 1.3), FUR_L, smoothstep(0.6, 1, t));
=======
  const t = smoothstep(0, 0.22, s[1]);
  const c = mix(mix("#5a5d68", "#8b8e99", t * 1.3), "#c4c6cc", smoothstep(0.55, 1, t));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const f = (p.z - 0.8 + Math.abs(p.y - (1.13 + G)) * 1.6) * 34;
    if (f - Math.floor(f) < 0.34) c = mix(c as any, FROST, 0.92);
=======
    const f = (p.z - 0.8 + Math.abs(p.y - (1.13 + G)) * 1.6) * 13;
    if (f - Math.floor(f) < 0.42) c = mix(c as any, FROST, 0.95);
>>>>>>> REPLACE

<<<<<<< SEARCH
const TUFT_G = svg(tuftSvg("#34363f", "#787b85", "#c9ccd0"), { size: 128 });
=======
const TUFT_G = svg(tuftSvg("#4c4f59", "#8a8d97", "#d2d4d9"), { size: 128 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    catmull([P(0, 0.84, -0.5), P(0, 0.76, -0.72), P(0, 0.58, -0.88), P(0, 0.36, -0.97)]),
=======
    catmull([P(0, 0.84, -0.5), P(0, 0.74, -0.78), P(0, 0.56, -1.0), P(0, 0.36, -1.1)]),
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailTube = b.sweep(tail, [0.055, 0.092, 0.105, 0.08, 0.02], { color: tailPaint, caps: "point" });
=======
  const tailTube = b.sweep(tail, [0.07, 0.12, 0.14, 0.11, 0.025], { color: tailPaint, caps: "point" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(fl, [0.1, 0.072, 0.052, 0.046], { color: coat });
=======
    b.sweep(fl, [0.105, 0.082, 0.062, 0.054], { color: coat });
>>>>>>> REPLACE

<<<<<<< SEARCH
size: [0.075, 0.047], mirror: s > 0, segments: 8 });
=======
size: [0.09, 0.057], mirror: s > 0, segments: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  tuft(P(0, 1.0, 1.0), V(0, -0.8, -0.5), V(0, -1, 0), 0.08, 0.05, maneCream, jaw);
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let k = 0; k < 2; k++)
      tuft(P(s * (0.082 + k * 0.012), 1.25 + k * 0.01, 0.79), V(s * 0.1, 0.4, 0.9), V(0, 0, 1), 0.07, 0.03, maneCream, earJ, 0.008);
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    const L = 0.14 + 0.1 * Math.min(1, i / 5);
    tuft(h.moved([0, -0.025, 0]), V(0, 0.5, -0.86), h.n, L, 0.1, maneGrey);
    for (const [s] of SIDES)
      tuft(h.moved({ left: s * 0.06, down: 0.035 }), V(s * 0.45, 0.4, -0.8), h.n, L * 0.8, 0.09, maneGrey);
=======
    const L = 0.1 + 0.07 * Math.min(1, i / 5);
    tuft(h.moved([0, -0.025, 0]), V(0, 0.5, -0.86), h.n, L, 0.13, maneGrey);
    if (i >= 4)
      for (const [s] of SIDES)
        tuft(h.moved({ left: s * 0.06, down: 0.035 }), V(s * 0.45, 0.4, -0.8), h.n, L * 0.8, 0.11, maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.ring(nk, { count: 12, radius: 0.13 }, (it: any) => {
=======
  b.ring(nk, { count: 10, radius: 0.13 }, (it: any) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(it, up, out, 0.2, 0.09, front ? maneCream : maneGrey);
=======
    tuft(it, up, out, 0.17, 0.12, front ? maneCream : maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(it, up, out, 0.15, 0.08, it.t > 0.3 && it.t < 0.7 ? maneCream : maneGrey);
=======
    tuft(it, up, out, 0.12, 0.1, it.t > 0.3 && it.t < 0.7 ? maneCream : maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
    neckSkin.scatter(110, {
=======
    neckSkin.scatter(60, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    bodySkin.scatter(70, {
=======
    bodySkin.scatter(40, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.88, 0.95, 0.15],
=======
    [-0.8, 0.05, 0.15],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.98, 0.5, 0.16, 0.12, 0.13, 20],
    [1.0, 0.1, 0.14, 0.1, 0.12, 50],
    [0.55, -0.85, 0.15, 0.09, 0.13, 70],
    [-0.4, -0.97, 0.13, 0.08, 0.11, 10],
=======
    [0.98, 0.45, 0.14, 0.1, 0.12, 50],
    [-0.3, -1.0, 0.15, 0.09, 0.13, 70],
    [-0.58, -0.45, 0.13, 0.08, 0.11, 10],
    [-1.0, -0.4, 0.14, 0.1, 0.12, 25],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const OX = -0.95;
  const OZ = -0.45;
  bp(new THREE.BoxGeometry(0.5, 0.1, 0.5), STONE, { at: [OX, G + 0.05, OZ] });
=======
  const OX = -0.9;
  const OZ = 0.6;
  bp(new THREE.BoxGeometry(0.44, 0.1, 0.44), STONE, { at: [OX, G + 0.05, OZ] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.spike([-0.72 + dx, G, 0.95 + dz], d, len, r, ICE, { bone: baseJ, section: { ngon: 6 } }), 1.3);
=======
    glow(b.spike([-0.45 + dx, G, 1.0 + dz], d, len, r, ICE, { bone: baseJ, section: { ngon: 6 } }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const PX = 0.92;
  const PZ = -0.5;
=======
  const PX = 0.6;
  const PZ = -0.9;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BX = 0.95;
  const BZ = 0.75;
=======
  const BX = 1.05;
  const BZ = 0.0;
>>>>>>> REPLACE