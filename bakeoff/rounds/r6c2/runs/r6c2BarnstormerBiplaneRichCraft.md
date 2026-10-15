1. **Cowl read as a hay bale.** It was mostly brass and sat close to the real hay bale in colour, so the engine looked like a barrel. I repainted it red with a cream band and a brass front lip, which matches the fuselage and reads as a radial engine cowl.
2. **Bear passenger buried under the upper wing and struts.** I raised the bear's head and made it bigger, with the face decal, goggles and ears rescaled to match. It now shows in the three-quarter and front views.
3. **Exhaust pipes ended in a bare stub** that looked like sticks poking out of the cowl. I added a flared stack to each one.
4. **The airfield lacked a small story in the front-right corner.** I added a red toolbox with a lid, handle, brass latch and a spanner, plus an oil can with a spout, which suits the whimsical barnstormer scene.

## Edits

<<<<<<< SEARCH
const COWL = paint((_p, _n, s) => (s[0] > 0.66 ? RED : s[0] > 0.6 ? CREAM : BRASS_BODY));
=======
  const COWL = paint((_p, _n, s) => (s[0] > 0.6 ? BRASS_BODY : s[0] > 0.3 && s[0] < 0.38 ? CREAM : s[0] < 0.06 ? CREAM : RED));
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ------------------------------------------------------------ wings
=======
  for (const s of [1, -1]) {
    put(new THREE.ConeGeometry(0.1, 0.2, 8), EXH, { at: P(s * 0.58, 1.42, 0.38), dir: [0, 0, 1], flat: true });
    put(new THREE.TorusGeometry(0.07, 0.018, 5, 8), BRASSC, { at: P(s * 0.58, 1.42, 0.3), dir: [0, 0, 1], axis: "z" });
  }

  // ------------------------------------------------------------ wings
>>>>>>> REPLACE

<<<<<<< SEARCH
  const Bc: V = [0, yB + 0.36, zb + 0.02];
=======
  const Bc: V = [0, yB + 0.42, zb + 0.02];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bearHead = put(sph(0.22, 12, 9), BEAR, { at: Bc });
=======
  const bearHead = put(sph(0.25, 12, 9), BEAR, { at: Bc });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + 0.22], dir: [0, 0, 1], size: [0.38, 0.38], bone: body });
=======
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + 0.25], dir: [0, 0, 1], size: [0.44, 0.44], bone: body });
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(sph(0.04, 6, 4), INK, { at: [0, Bc[1] - 0.022, Bc[2] + 0.225] });
=======
  put(sph(0.04, 6, 4), INK, { at: [0, Bc[1] - 0.03, Bc[2] + 0.255] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(sph(0.085, 7, 5), BEAR, { at: [s * 0.15, Bc[1] + 0.16, Bc[2] - 0.02], flat: true });
    put(sph(0.05, 6, 4), TAN, { at: [s * 0.15, Bc[1] + 0.16, Bc[2] + 0.03], flat: true });
=======
    put(sph(0.095, 7, 5), BEAR, { at: [s * 0.18, Bc[1] + 0.19, Bc[2] - 0.02], flat: true });
    put(sph(0.055, 6, 4), TAN, { at: [s * 0.18, Bc[1] + 0.19, Bc[2] + 0.035], flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const at = new THREE.Vector3(...Bc).addScaledVector(d, 0.22);
=======
    const at = new THREE.Vector3(...Bc).addScaledVector(d, 0.25);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // hay bale
=======
  // toolbox and oil can
  put(new THREE.BoxGeometry(0.46, 0.2, 0.22), RED, { at: P(2.3, 0.1, 2.6), rotation: [0, -20, 0] });
  put(new THREE.BoxGeometry(0.48, 0.05, 0.24), CREAM, { at: P(2.3, 0.225, 2.6), rotation: [0, -20, 0] });
  put(new THREE.BoxGeometry(0.2, 0.03, 0.04), STEEL, { at: P(2.3, 0.27, 2.6), rotation: [0, -20, 0] });
  put(new THREE.BoxGeometry(0.06, 0.06, 0.02), BRASSC, { at: P(2.34, 0.12, 2.5), rotation: [0, -20, 0] });
  rod(P(2.7, 0.015, 2.35), P(2.95, 0.015, 2.5), 0.015, STEEL, { sides: 5 });
  put(cyl(0.07, 0.07, 0.16, 8), TEAL, { at: P(2.65, 0.08, 2.8), flat: true });
  put(new THREE.ConeGeometry(0.035, 0.1, 6), BRASSC, { at: P(2.65, 0.21, 2.8), flat: true });
  rod(P(2.65, 0.2, 2.8), P(2.76, 0.26, 2.8), 0.012, BRASSC, { sides: 4 });

  // hay bale
>>>>>>> REPLACE