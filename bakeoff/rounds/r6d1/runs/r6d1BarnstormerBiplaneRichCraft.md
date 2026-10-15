1. **Pilot head jammed into the upper wing.** The head top sat at the wing's underside, which is why the pilot barely shows in any view. I'm seating him 0.14 m deeper in the cockpit. The next render should show a clear gap between his helmet and the wing, with goggles and moustache visible.
2. **Bunting hid both characters.** The strand ran across the middle of the wing at z=1.2, right in front of the faces. I'm splitting it into two outboard strands on each side that start at x=1.0, leaving the centre open. The next render should show the pilot and bear unobstructed from the front.
3. **Bear too small and low.** I'm enlarging his head by about 18%, raising him slightly, and moving the ears, goggles and face decal to match. He should now read as a character in the three-quarter view.
4. **Cowl read as a hay bale.** The all-gilt noisy paint looked like straw. It becomes a red body with a cream rear band and a gilt nose ring. The next render should show a clearly metal-and-paint engine nose, distinct from the real hay bale.
5. **Windsock pole overlapped the tail in the side view.** I'm moving it behind and left of the tail, pointing the sock back toward the plane. The tail and rudder should read cleanly from the side.

<<<<<<< SEARCH
  const COWL = paint((_p, _n, s) => (s[0] > 0.66 ? RED : GILT));
=======
  const COWL = paint((_p, _n, s) => (s[0] > 0.6 ? GILT : s[0] < 0.1 ? CREAM : RED));
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
    groups.forEach((fr, k) => b.cards(fr, FLAGS[k], { size: [0.2, 0.26], lean: 180, flow: [0, 0, 1], bone: body }));
=======
    for (const s of [1, -1]) {
      const bp: V[] = [];
      for (let i = 0; i <= 8; i++) {
        const x = 1.05 + (2.65 * i) / 8;
        const u = (x - 2.375) / 1.325;
        bp.push([s * x, 3.0 + G + 0.02 - 0.4 * (1 - u * u), 1.2]);
      }
      const bpath = catmull(bp);
      b.sweep(bpath, 0.012, { color: INK, bone: body, sides: 4 });
      const groups: any[][] = [[], [], []];
      for (let i = 1; i <= 11; i++) groups[i % 3].push(frame(bpath.at(i / 12), [0, 1, 0]));
      groups.forEach((fr, k) => b.cards(fr, FLAGS[k], { size: [0.2, 0.26], lean: 180, flow: [0, 0, 1], bone: body }));
    }
>>>>>>> REPLACE
<<<<<<< SEARCH
  const yP = topY(zp);
=======
  const yP = topY(zp) - 0.14;
>>>>>>> REPLACE
<<<<<<< SEARCH
  const yB = topY(zb);
=======
  const yB = topY(zb) + 0.06;
>>>>>>> REPLACE
<<<<<<< SEARCH
  const bearHead = put(sph(0.22, 12, 9), BEAR, { at: Bc });
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + 0.22], dir: [0, 0, 1], size: [0.38, 0.38], bone: body });
  put(sph(0.04, 6, 4), INK, { at: [0, Bc[1] - 0.022, Bc[2] + 0.225] });
=======
  const bearHead = put(sph(0.26, 12, 9), BEAR, { at: Bc });
  b.decal(bearHead, BEARFACE, { at: [0, Bc[1], Bc[2] + 0.26], dir: [0, 0, 1], size: [0.45, 0.45], bone: body });
>>>>>>> REPLACE
<<<<<<< SEARCH
    put(sph(0.085, 7, 5), BEAR, { at: [s * 0.15, Bc[1] + 0.16, Bc[2] - 0.02], flat: true });
    put(sph(0.05, 6, 4), TAN, { at: [s * 0.15, Bc[1] + 0.16, Bc[2] + 0.03], flat: true });
    const d = new THREE.Vector3(s * 0.3, 0.75, 0.55).normalize();
    const at = new THREE.Vector3(...Bc).addScaledVector(d, 0.22);
=======
    put(sph(0.1, 7, 5), BEAR, { at: [s * 0.18, Bc[1] + 0.19, Bc[2] - 0.02], flat: true });
    put(sph(0.058, 6, 4), TAN, { at: [s * 0.18, Bc[1] + 0.19, Bc[2] + 0.04], flat: true });
    const d = new THREE.Vector3(s * 0.3, 0.75, 0.55).normalize();
    const at = new THREE.Vector3(...Bc).addScaledVector(d, 0.26);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const wx = 3.0;
    const wz = -3.0;
=======
    const wx = -2.6;
    const wz = -3.6;
>>>>>>> REPLACE
<<<<<<< SEARCH
    const d = new THREE.Vector3(-0.8, -0.15, 0.55).normalize();
=======
    const d = new THREE.Vector3(0.8, -0.15, -0.3).normalize();
>>>>>>> REPLACE