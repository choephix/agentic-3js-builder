1. **Characters were too small and hidden.** The pilot and the bear are the whimsical hook, but they were tiny under the upper wing. I'm enlarging both heads about 25–30% and raising them slightly, with the cap, goggles, ears and face decals rescaled to match. The next render should show a bigger moustached pilot face and a bigger bear face above the cockpit rims.
2. **The propeller blade crossed the bear's face in the front view.** I'm rotating the prop so the blades sit near-horizontal, tilted slightly. The next front render should show the bear's face clear, with the prop reading as a classic two-blade prop across the cowl.
3. **The bunting floated in front of the wing tips.** I'm moving its anchor line to sit on the upper wing's leading edge. The next render should show the string hanging from the wing, not off its tips.

<<<<<<< SEARCH
  const Hc: V = [0, yP + 0.66, zp + 0.03];
  const headP = put(sph(0.25, 12, 9), SKIN, { at: Hc });
  b.decal(headP, FACE, { at: [0, Hc[1], Hc[2] + 0.25], dir: [0, 0, 1], size: [0.4, 0.4], bone: body });
  put(new THREE.SphereGeometry(0.272, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.38), LEATH, { at: Hc, flat: true });
  {
    const pts: V[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      pts.push([Math.sin(a) * 0.268, Hc[1] + 0.1, Hc[2] + Math.cos(a) * 0.268]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.022, { color: LEATH2, bone: body, sides: 5 });
  }
  put(sph(0.05, 6, 4), RED, { at: [0, Hc[1] + 0.27, Hc[2]] });
  const lensAt: V[] = [];
  for (const s of [1, -1]) {
    put(sph(1, 8, 6), LEATH, { at: [s * 0.26, Hc[1] - 0.04, Hc[2]], scale: [0.045, 0.1, 0.1], flat: true });
    const d = new THREE.Vector3(s * 0.36, 0.64, 0.68).normalize();
    const at = new THREE.Vector3(...Hc).addScaledVector(d, 0.268);
=======
  const HP = 0.32;
  const Hc: V = [0, yP + 0.72, zp + 0.03];
  const headP = put(sph(HP, 12, 9), SKIN, { at: Hc });
  b.decal(headP, FACE, { at: [0, Hc[1], Hc[2] + HP], dir: [0, 0, 1], size: [0.52, 0.52], bone: body });
  put(new THREE.SphereGeometry(HP * 1.09, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.38), LEATH, { at: Hc, flat: true });
  {
    const pts: V[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      pts.push([Math.sin(a) * HP * 1.07, Hc[1] + 0.12, Hc[2] + Math.cos(a) * HP * 1.07]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.026, { color: LEATH2, bone: body, sides: 5 });
  }
  put(sph(0.06, 6, 4), RED, { at: [0, Hc[1] + HP * 1.09, Hc[2]] });
  const lensAt: V[] = [];
  for (const s of [1, -1]) {
    put(sph(1, 8, 6), LEATH, { at: [s * HP * 1.04, Hc[1] - 0.05, Hc[2]], scale: [0.055, 0.12, 0.12], flat: true });
    const d = new THREE.Vector3(s * 0.36, 0.64, 0.68).normalize();
    const at = new THREE.Vector3(...Hc).addScaledVector(d, HP * 1.07);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const Bc: V = [0, yB + 0.36, zb + 0.02];
  const bearHead = put(sph(0.26, 12, 9), BEAR, { at: Bc });
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + 0.26], dir: [0, 0, 1], size: [0.45, 0.45], bone: body });
  for (const s of [1, -1]) {
    put(sph(0.1, 7, 5), BEAR, { at: [s * 0.18, Bc[1] + 0.19, Bc[2] - 0.02], flat: true });
    put(sph(0.058, 6, 4), TAN, { at: [s * 0.18, Bc[1] + 0.19, Bc[2] + 0.04], flat: true });
    const d = new THREE.Vector3(s * 0.3, 0.75, 0.55).normalize();
    const at = new THREE.Vector3(...Bc).addScaledVector(d, 0.26);
=======
  const HB = 0.34;
  const Bc: V = [0, yB + 0.44, zb + 0.02];
  const bearHead = put(sph(HB, 12, 9), BEAR, { at: Bc });
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + HB], dir: [0, 0, 1], size: [0.6, 0.6], bone: body });
  for (const s of [1, -1]) {
    put(sph(0.13, 7, 5), BEAR, { at: [s * 0.24, Bc[1] + 0.25, Bc[2] - 0.02], flat: true });
    put(sph(0.075, 6, 4), TAN, { at: [s * 0.24, Bc[1] + 0.25, Bc[2] + 0.06], flat: true });
    const d = new THREE.Vector3(s * 0.3, 0.75, 0.55).normalize();
    const at = new THREE.Vector3(...Bc).addScaledVector(d, HB);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const a = 0.35 + k * Math.PI;
=======
    const a = 1.1 + k * Math.PI;
>>>>>>> REPLACE

<<<<<<< SEARCH
        bp.push([s * x, 3.0 + G + 0.02 - 0.4 * (1 - u * u), 1.2]);
=======
        bp.push([s * x, 3.0 + G - 0.02 - 0.4 * (1 - u * u), 1.1]);
>>>>>>> REPLACE