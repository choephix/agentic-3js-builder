1. **Face reads mauve and muzzle-like.** The skin's shadow tone is pink-mauve, and the jaw and midface spheres push forward like a snout. I'm using a warmer, lighter shadow tone, pulling the jaw and midface back, and moving the mouth onto the new face surface.
2. **Eyes are small for the anime style.** I'm enlarging the eye decals and moving them slightly outward.
3. **Arms and hands are spindly, with needle fingers.** I'm thickening the arms, palms and fingers.
4. **The target tripod leg crosses in front of the target face.** I'm moving the target in from the base edge and rebuilding the legs behind it, with the apex hidden behind the disc and the feet on the grass.
5. **The model's lowest point is 46 mm below y = 0.** I'm raising the base disc's underside so it sits near the floor.

## Edits

<<<<<<< SEARCH
const SKIN = cel("#fde3d1", "#eeaba6");
=======
const SKIN = cel("#fde6d4", "#f3c4b2");
>>>>>>> REPLACE

<<<<<<< SEARCH
const armR = (t: number) => 0.04 - 0.012 * t;
=======
const armR = (t: number) => 0.046 - 0.016 * t;
>>>>>>> REPLACE

<<<<<<< SEARCH
    ball(SKIN, P(0.04, 0), [0.013, 0.042, 0.034], wrist, [8, 6]).mesh.quaternion.identity();
=======
    ball(SKIN, P(0.04, 0), [0.017, 0.046, 0.04], wrist, [8, 6]).mesh.quaternion.identity();
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(f, [0.0095, 0.0065], { color: SKIN });
=======
      b.sweep(f, [0.0125, 0.0085], { color: SKIN });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(th, [0.011, 0.007], { color: SKIN });
=======
    b.sweep(th, [0.014, 0.009], { color: SKIN });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const midface = b.part(sph14, SKIN, { bone: head, at: [0, 1.615, 0.025], scale: [0.082, 0.07, 0.085] });
  ball(SKIN, [0, 1.572, 0.045], [0.052, 0.034, 0.062], jaw, [10, 7]);
=======
  const midface = b.part(sph14, SKIN, { bone: head, at: [0, 1.62, 0.018], scale: [0.08, 0.066, 0.078] });
  ball(SKIN, [0, 1.575, 0.035], [0.048, 0.03, 0.052], jaw, [10, 7]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [-0.014, 1.599, 0.099],
      [0, 1.594, 0.106],
      [0.014, 1.599, 0.099],
=======
      [-0.014, 1.599, 0.091],
      [0, 1.594, 0.097],
      [0.014, 1.599, 0.091],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hit = faceSkin.around([0, 1.66, 0]).at(s * 27, -2);
    if (hit) b.decal(faceSkin, EYE, { at: hit.at, dir: [0, 0, 1], size: [0.05, 0.068], mirror: s > 0, lift: 0.003 });
=======
    const hit = faceSkin.around([0, 1.655, 0]).at(s * 30, -1);
    if (hit) b.decal(faceSkin, EYE, { at: hit.at, dir: [0, 0, 1], size: [0.062, 0.085], mirror: s > 0, lift: 0.003 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0, -0.03],
      [0.8, -0.03],
=======
      [0, -0.012],
      [0.8, -0.012],
>>>>>>> REPLACE

<<<<<<< SEARCH
const Cb: V = [-0.6, 0.62, -0.12];
=======
const Cb: V = [-0.5, 0.62, -0.05];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const apex: V = [-0.64, 0.82, -0.14];
  for (const foot of [
    [-0.46, 0.012, 0.1],
    [-0.5, 0.012, -0.42],
    [-0.78, 0.012, -0.2],
  ] as V[]) b.rod(apex, foot, 0.014, { color: WOOD, bone: root, sides: 5 });
=======
  const fSide = nrm(cross([0, 1, 0], f));
  const apex: V = [Cb[0] - f[0] * 0.07, 0.86, Cb[2] - f[2] * 0.07];
  const g0: V = [Cb[0] - f[0] * 0.2, 0.012, Cb[2] - f[2] * 0.2];
  for (const foot of [
    add(g0, fSide, 0.26),
    add(g0, fSide, -0.24),
    [Cb[0] - f[0] * 0.34, 0.012, Cb[2] - f[2] * 0.34],
  ] as V[]) b.rod(apex, foot, 0.014, { color: WOOD, bone: root, sides: 5 });
>>>>>>> REPLACE