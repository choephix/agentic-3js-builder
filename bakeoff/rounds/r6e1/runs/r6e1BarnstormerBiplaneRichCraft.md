1. **Identity and form.**
   - **Cues.** The biplane itself reads: two cream wings with checkered tips, struts and wires, a radial engine and a bunting-draped airfield. Its two characters do not, and they are the whimsy. The pilot (moustache, goggles, waving arm) and the bear passenger are small, and the pilot's face is hidden behind the front cockpit, the bear and the windscreens. The bear is also buried under the upper wing, and the prop blade crosses the faces in the front view.
   - **Fix.** I raise the upper wing to 3.25 with longer struts and cabane, and cut a notch in its centre trailing edge so the cockpits are open from above. I move the bear back into the notch, grow both heads about 20% (goggles, helmet, ears and face decals follow), and turn the prop to a near-horizontal rest pose.
   - **Where it shows.** The front and three-quarter views show both faces clear of the prop and wing. The top view shows the bear and pilot through the notch.
2. **Soundness.** The cabane struts move so they clear the bear, and the tank moves forward so it does not hang over the notch. The bunting is rebuilt as two swags on the wing's leading edge, so it no longer runs across the characters. The front view shows a clean centre line, and the swags read from the three-quarter view.
3. **Composition.** With the heads larger and the centre clear, the characters become the focal point. The base and props stay as they were.
4. **Finish.** The finish stays as built, including the glow lights and the checkered tips. The raised wing gets its emblem decals and nav lights re-seated at the new height.

## Edits

<<<<<<< SEARCH
const G = 0.126; // top of the grass base
=======
const G = 0.126; // top of the grass base
const UY = 3.25; // upper wing height
>>>>>>> REPLACE

<<<<<<< SEARCH
  const wingOutline = (span: number, half: number): [number, number][] => [
=======
  const wingOutline = (span: number, half: number, notch = false): [number, number][] => [
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-span + 0.8, -half],
    [span - 0.8, -half],
=======
    [-span + 0.8, -half],
    ...(notch
      ? ([
          [-0.5, -half],
          [-0.5, -0.1],
          [0.5, -0.1],
          [0.5, -half],
        ] as [number, number][])
      : []),
    [span - 0.8, -half],
>>>>>>> REPLACE

<<<<<<< SEARCH
    { y: 3.0, z: 0.4, span: 4.1, half: 0.7, tip: RED, tag: "U", ail: TEAL },
=======
    { y: UY, z: 0.4, span: 4.1, half: 0.7, tip: RED, tag: "U", ail: TEAL },
>>>>>>> REPLACE

<<<<<<< SEARCH
    const plate = b.extrude(wingOutline(w.span, w.half), {
=======
    const plate = b.extrude(wingOutline(w.span, w.half, w.tag === "U"), {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(wingParts[0], EMBLEM, { at: P(s * 2.7, 3.0 + 0.08, 0.35), dir: [0, 1, 0], up: [0, 0, 1], size: [0.9, 0.9], bone: body });
=======
    b.decal(wingParts[0], EMBLEM, { at: P(s * 2.7, UY + 0.08, 0.35), dir: [0, 1, 0], up: [0, 0, 1], size: [0.9, 0.9], bone: body });
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(sph(1, 12, 8), RED, { at: P(0, 3.0 + 0.2, 0.4), scale: [0.42, 0.15, 0.4], flat: true });
  put(cyl(0.07, 0.07, 0.05, 8), BRASSC, { at: P(0, 3.0 + 0.36, 0.4) });
=======
  put(sph(1, 12, 8), RED, { at: P(0, UY + 0.2, 0.75), scale: [0.42, 0.15, 0.34], flat: true });
  put(cyl(0.07, 0.07, 0.05, 8), BRASSC, { at: P(0, UY + 0.36, 0.75) });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(put(sph(0.08, 6, 4), s > 0 ? "#ff4d4d" : "#4dff9a", { at: P(s * 4.08, 3.0, 0.4), flat: true }), 1.4);
=======
    glow(put(sph(0.08, 6, 4), s > 0 ? "#ff4d4d" : "#4dff9a", { at: P(s * 4.08, UY, 0.4), flat: true }), 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const yU = 3.0 - 0.02;
=======
  const yU = UY - 0.02;
>>>>>>> REPLACE

<<<<<<< SEARCH
    rod(P(s * 0.4, 1.85, 0.8), P(s * 0.55, 2.98, 0.75), [0.05, 0.045], WOOD);
    rod(P(s * 0.34, 1.9, 0.1), P(s * 0.55, 2.98, 0.1), [0.05, 0.045], WOOD);
    rod(P(s * 0.55, 2.95, 0.75), P(s * 1.9, yL, 0.4), 0.012, INK, { sides: 4 });
=======
    rod(P(s * 0.4, 1.85, 0.8), P(s * 0.62, UY - 0.02, 0.75), [0.05, 0.045], WOOD);
    rod(P(s * 0.5, 1.9, -0.12), P(s * 0.62, UY - 0.02, -0.1), [0.05, 0.045], WOOD);
    rod(P(s * 0.62, UY - 0.05, 0.75), P(s * 1.9, yL, 0.4), 0.012, INK, { sides: 4 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const a = 0.35 + k * Math.PI;
=======
    const a = 1.25 + k * Math.PI;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const Hc: V = [0, yP + 0.66, zp + 0.03];
  const headP = put(sph(0.25, 12, 9), SKIN, { at: Hc });
  b.decal(headP, FACE, { at: [0, Hc[1], Hc[2] + 0.25], dir: [0, 0, 1], size: [0.4, 0.4], bone: body });
  put(new THREE.SphereGeometry(0.272, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.38), LEATH, { at: Hc, flat: true });
=======
  const Hc: V = [0, yP + 0.7, zp + 0.03];
  const headP = put(sph(0.3, 12, 9), SKIN, { at: Hc });
  b.decal(headP, FACE, { at: [0, Hc[1], Hc[2] + 0.3], dir: [0, 0, 1], size: [0.48, 0.48], bone: body });
  put(new THREE.SphereGeometry(0.325, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.38), LEATH, { at: Hc, flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
      pts.push([Math.sin(a) * 0.268, Hc[1] + 0.1, Hc[2] + Math.cos(a) * 0.268]);
=======
      pts.push([Math.sin(a) * 0.32, Hc[1] + 0.12, Hc[2] + Math.cos(a) * 0.32]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(sph(0.05, 6, 4), RED, { at: [0, Hc[1] + 0.27, Hc[2]] });
=======
  put(sph(0.06, 6, 4), RED, { at: [0, Hc[1] + 0.33, Hc[2]] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(sph(1, 8, 6), LEATH, { at: [s * 0.26, Hc[1] - 0.04, Hc[2]], scale: [0.045, 0.1, 0.1], flat: true });
=======
    put(sph(1, 8, 6), LEATH, { at: [s * 0.31, Hc[1] - 0.04, Hc[2]], scale: [0.055, 0.12, 0.12], flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const at = new THREE.Vector3(...Hc).addScaledVector(d, 0.268);
    put(cyl(0.085, 0.085, 0.07, 10), BRASSC, { at: arr(at), dir: arr(d), flat: true });
=======
    const at = new THREE.Vector3(...Hc).addScaledVector(d, 0.32);
    put(cyl(0.1, 0.1, 0.07, 10), BRASSC, { at: arr(at), dir: arr(d), flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(cyl(0.062, 0.062, 0.08, 10), "#7fd6e8", { at: arr(lens), dir: arr(d), flat: true });
=======
    put(cyl(0.075, 0.075, 0.08, 10), "#7fd6e8", { at: arr(lens), dir: arr(d), flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const zb = 0.3;
=======
  const zb = 0.05;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const Bc: V = [0, yB + 0.36, zb + 0.02];
  const bearHead = put(sph(0.22, 12, 9), BEAR, { at: Bc });
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + 0.22], dir: [0, 0, 1], size: [0.38, 0.38], bone: body });
  put(sph(0.04, 6, 4), INK, { at: [0, Bc[1] - 0.022, Bc[2] + 0.225] });
=======
  const Bc: V = [0, yB + 0.4, zb + 0.02];
  const bearHead = put(sph(0.27, 12, 9), BEAR, { at: Bc });
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + 0.27], dir: [0, 0, 1], size: [0.46, 0.46], bone: body });
  put(sph(0.045, 6, 4), INK, { at: [0, Bc[1] - 0.03, Bc[2] + 0.272] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(sph(0.085, 7, 5), BEAR, { at: [s * 0.15, Bc[1] + 0.16, Bc[2] - 0.02], flat: true });
    put(sph(0.05, 6, 4), TAN, { at: [s * 0.15, Bc[1] + 0.16, Bc[2] + 0.03], flat: true });
    const d = new THREE.Vector3(s * 0.3, 0.75, 0.55).normalize();
    const at = new THREE.Vector3(...Bc).addScaledVector(d, 0.22);
=======
    put(sph(0.1, 7, 5), BEAR, { at: [s * 0.19, Bc[1] + 0.2, Bc[2] - 0.02], flat: true });
    put(sph(0.06, 6, 4), TAN, { at: [s * 0.19, Bc[1] + 0.2, Bc[2] + 0.04], flat: true });
    const d = new THREE.Vector3(s * 0.3, 0.75, 0.55).normalize();
    const at = new THREE.Vector3(...Bc).addScaledVector(d, 0.27);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const bp: V[] = [];
    for (let i = 0; i <= 14; i++) {
      const x = -3.4 + (6.8 * i) / 14;
      bp.push([x, 3.0 + G + 0.02 - 0.45 * (1 - (x / 3.4) ** 2), 1.2]);
    }
    const bpath = catmull(bp);
    b.sweep(bpath, 0.012, { color: INK, bone: body, sides: 4 });
    const groups: any[][] = [[], [], []];
    for (let i = 1; i <= 23; i++) groups[i % 3].push(frame(bpath.at(i / 24), [0, 1, 0]));
=======
    const groups: any[][] = [[], [], []];
    for (const s of [1, -1]) {
      const bp: V[] = [];
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        bp.push([s * (0.9 + 2.5 * u), UY + G - 0.1 - 0.34 * Math.sin(Math.PI * u), 1.12]);
      }
      const bpath = catmull(bp);
      b.sweep(bpath, 0.012, { color: INK, bone: body, sides: 4 });
      for (let i = 1; i <= 11; i++) groups[(i + (s > 0 ? 0 : 1)) % 3].push(frame(bpath.at(i / 12), [0, 1, 0]));
    }
>>>>>>> REPLACE