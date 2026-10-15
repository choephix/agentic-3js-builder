Each change below was made as an edit to the module, in the art director's order.

1. **Face and tusks:** The skull is now `[0.18, 0.18, 0.19]`. The lower jaw is a 0.24 m box and the muzzle is wider, blended with overlapping faceted cheek volumes. The nose projects about 15% less. A continuous dark mouth blob fills the gap between the lips. Eyes, lids and brows moved forward. Tusks run through the requested points, taper from 0.04 m to a point, and their tips sit outside the eyes. The ear lobes were re-seated on the larger head, and the jaw opens a little more.
2. **Mohawk:** Eight stations, with the crown highest and the neck stations at about 40–55% height. Each station is a central wedge (0.065 m wide, tapering, base buried 0.015 m) with two shorter blades splayed ±20°. The foremost root is well behind the brow.
3. **Shoulders and hump:** The hump is re-centred and reshaped to `[0.30, 0.15, 0.22]`. The upper torso is broadened, the traps are enlarged and pulled into the torso mass, and `shP` moves inward to `s*0.34`. The pauldron is re-seated and enlarged on the new shoulder.
4. **Hands:** Two broad fingers (±0.045 m, 0.04 radius, 0.175 m long, with knuckle blobs) plus an outward-angled thumb. The palm is thicker, with finger roots sunk into its lower edge, and the claws are longer.
5. **Loincloth:** A custom three-section textured mesh, 0.30 m wide and 0.43 m long, with front and back layers 8 mm apart. Its whole top edge sits under the belt. It leans forward over the thighs and bows 0.04 m, and the hem returns slightly. The ragged outline comes from the texture alpha.
6. **Fetishes:** The waist fetishes anchor on `beltPath` points with their cords embedded in the belt. The necklace skull hangs from `collar.at(0)` by a leather rod and ring. The earrings pass through a new skin lobe about 0.04 m below the ear outline. Chest and belt feathers are wider, face +Z and fan out with a yaw spread.
7. **Setting:**
   - The totem is rebuilt at 70% and moved behind and beside the arm.
   - The cauldron is rebuilt at 80%.
   - Reeds are cut to 15 and 0.42 m tall, moved clear of hands and feet.
   - The rune glow drops to 0.4.
   - The base grows to radius 1.3 to hold the shifted props.
   - Camera framing belongs to the renderer, so I did not touch it. The smaller totem should free up the crest-to-feet framing.
8. **Colour:**
   - Spot cover drops to 0.13, with stronger marks on the back and outer limbs.
   - The warm belly colour is now placed by region: throat, chest, abdomen and inner limbs.
   - Body warts drop to 8, kept off the front and the head's face.
   - Fetish-eye glow drops to 0.6.

## Edits

<<<<<<< SEARCH
const BELLY = mottle("#a7c47c", "#c3d68c", { size: 0.1, seed: 5 });
=======
const BELLY = mottle("#b9c07a", "#d0d28c", { size: 0.12, seed: 5 });
>>>>>>> REPLACE

<<<<<<< SEARCH
const SKIN_BASE = countershade(spots(HIDE, "#2a5e4b", { size: 0.07, amount: 0.3, seed: 8 }), BELLY, {
  level: -0.3,
  soft: 0.28,
});
=======
const SKIN_BASE = spots(HIDE, "#2a5e4b", { size: 0.09, amount: 0.13, seed: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const c = SKIN_BASE.at(p, n);
=======
  const base0 = SKIN_BASE.at(p, n);
  const front =
    smoothstep(0.15, 0.5, n.z) * smoothstep(0.92, 1.05, p.y) * smoothstep(1.64, 1.52, p.y) * smoothstep(0.4, 0.3, Math.abs(p.x));
  const inner = smoothstep(0.35, 0.8, -Math.sign(p.x) * n.x) * smoothstep(0.08, 0.15, Math.abs(p.x)) * smoothstep(1.55, 1.4, p.y);
  const warm = Math.min(1, Math.max(front, inner * 0.85));
  const backMark =
    Math.max(smoothstep(0.2, 0.8, n.y), smoothstep(0.15, 0.7, -n.z), smoothstep(0.55, 0.95, Math.abs(n.x))) *
    smoothstep(0.57, 0.68, noise(p, 0.08, 17));
  const c = mix(mix(base0, "#2a5e4b", backMark * 0.6), BELLY.at(p, n), warm * 0.9);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rim = smoothstep(1.0, 1.25, Math.hypot(p.x, p.z)) * 0.35;
=======
  const rim = smoothstep(1.1, 1.35, Math.hypot(p.x, p.z)) * 0.35;
>>>>>>> REPLACE

<<<<<<< SEARCH
      if (o.eye) glow(e, 1.5);
=======
      if (o.eye) glow(e, 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const feathers = (pts: V[], bone: Joint, size: [number, number], flow: V = [0, 0, 1]) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      FEATHER,
      { size, lean: 180, flow, bone, vary: 0.2, spin: 5, rng: R, sink: 0 },
    );
=======
  const feathers = (pts: V[], bone: Joint, size: [number, number], flow: V = [0, 0, 1], spread = 0) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      FEATHER,
      {
        size,
        lean: 180,
        flow: (_f: unknown, i: number): V => {
          const a = ((i - (pts.length - 1) / 2) * spread * Math.PI) / 180;
          return [flow[0] * Math.cos(a) + flow[2] * Math.sin(a), 0, -flow[0] * Math.sin(a) + flow[2] * Math.cos(a)];
        },
        bone,
        vary: 0.2,
        spin: 5,
        rng: R,
        sink: 0,
      },
    );

  // Thin two-layer cloth panel hanging from y = 0 (top edge), drawn in local space with +z outward.
  const clothGeo = (w: number, len: number, prof: number[], th: number) => {
    const rows = prof.length - 1;
    const cols = 6;
    const pa: number[] = [];
    const ua: number[] = [];
    const idx: number[] = [];
    const nv = (rows + 1) * (cols + 1);
    for (let layer = 0; layer < 2; layer++) {
      const off = layer === 0 ? th / 2 : -th / 2;
      for (let r = 0; r <= rows; r++)
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const sag = 0.02 * Math.pow(Math.abs(u - 0.5) * 2, 2);
          pa.push((u - 0.5) * w, -(r / rows) * len, prof[r] - sag + off);
          ua.push(u, 1 - r / rows);
        }
    }
    for (let layer = 0; layer < 2; layer++)
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const a0 = layer * nv + r * (cols + 1) + c;
          const a1 = a0 + 1;
          const d0 = a0 + cols + 1;
          const d1 = d0 + 1;
          if (layer === 0) idx.push(a0, d0, d1, a0, d1, a1);
          else idx.push(a0, d1, d0, a0, a1, d1);
        }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(ua, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
    feathers([[x - 0.02 * k, y - 0.3 * k, z], [x + 0.02 * k, y - 0.3 * k, z]], bone, [0.035 * k, 0.12 * k]);
=======
    feathers(
      [[x - 0.035 * k, y - 0.3 * k, z], [x, y - 0.31 * k, z], [x + 0.035 * k, y - 0.3 * k, z]],
      bone,
      [0.06 * k, 0.13 * k],
      [0, 0, 1],
      25,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const torso = b.sweep(spine, ramp([[0, 0.2, 0.17], [0.35, 0.19, 0.16], [0.75, 0.31, 0.23], [1, 0.29, 0.2]]), {
=======
  const torso = b.sweep(spine, ramp([[0, 0.2, 0.17], [0.35, 0.19, 0.16], [0.7, 0.3, 0.22], [0.85, 0.33, 0.24], [1, 0.32, 0.23]]), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hump = blob(SKIN, chestJ, [0, 1.62, 0.08], [0.27, 0.2, 0.2]);
  const trapL = blob(SKIN, chestJ, [0.17, 1.62, 0.22], [0.14, 0.1, 0.13]);
  const trapR = blob(SKIN, chestJ, [-0.17, 1.62, 0.22], [0.14, 0.1, 0.13]);
=======
  const hump = blob(SKIN, chestJ, [0, 1.57, 0.1], [0.3, 0.15, 0.22]);
  const trapL = blob(SKIN, chestJ, [0.2, 1.58, 0.18], [0.17, 0.12, 0.16]);
  const trapR = blob(SKIN, chestJ, [-0.2, 1.58, 0.18], [0.17, 0.12, 0.16]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const skullP = b.part(sphereG(10, 8), SKIN, { bone: head, at: HC, scale: [0.15, 0.16, 0.175] });
  const skullBack = blob(SKIN, head, hc(0, 0.02, -0.08), [0.14, 0.15, 0.12]);
=======
  const skullP = b.part(sphereG(10, 8), SKIN, { bone: head, at: HC, scale: [0.18, 0.18, 0.19] });
  const skullBack = blob(SKIN, head, hc(0, 0.02, -0.08), [0.16, 0.16, 0.14]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    cheeks.push(blob(SKIN, head, hc(s * 0.11, -0.04, 0.09), [0.06, 0.05, 0.06]));
=======
    cheeks.push(blob(SKIN, head, hc(s * 0.12, -0.05, 0.1), [0.08, 0.065, 0.08], { flat: true }));
    blob(SKIN, head, hc(s * 0.1, -0.03, 0.17), [0.06, 0.05, 0.06], { flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod(hc(s * 0.135, 0.075, 0.09), hc(s * 0.025, 0.048, 0.165), 0.037, { color: SKIN, bone: head });
=======
    b.rod(hc(s * 0.14, 0.085, 0.07), hc(s * 0.03, 0.06, 0.185), 0.04, { color: SKIN, bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const eye = blob(AMBER, head, hc(s * 0.075, 0.03, 0.13), 0.032);
=======
    const eye = blob(AMBER, head, hc(s * 0.08, 0.03, 0.165), 0.034);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(sphereG(6, 4), INK, { bone: head, at: hc(s * 0.075, 0.03, 0.157), scale: [0.0048, 0.022, 0.0066] });
=======
    b.part(sphereG(6, 4), INK, { bone: head, at: hc(s * 0.08, 0.03, 0.192), scale: [0.005, 0.023, 0.0066] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(SKIN, head, hc(s * 0.075, 0.049, 0.139), [0.036, 0.018, 0.03]); // heavy lid
=======
    blob(SKIN, head, hc(s * 0.08, 0.054, 0.172), [0.04, 0.02, 0.034]); // heavy lid
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob("#1d3b30", head, hc(s * 0.022, -0.062, 0.272), [0.012, 0.01, 0.01]);
=======
    blob("#1d3b30", head, hc(s * 0.02, -0.06, 0.262), [0.012, 0.01, 0.01]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(hc(s * 0.045, -0.078, 0.17), [0, -1, 0], 0.055, 0.015, { color: BONE, bone: head });
=======
    b.spike(hc(s * 0.05, -0.08, 0.2), [0, -1, 0], 0.05, 0.014, { color: BONE, bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.frustumBox(hc(0, -0.015, 0.07), hc(0, -0.05, 0.2), [0.2, 0.12], [0.15, 0.09], { color: SKIN, bone: head });
  b.sweep(bezier(hc(0, 0.025, 0.17), hc(0, 0.04, 0.3), hc(0, -0.055, 0.275)), [0.05, 0.03], {
=======
  b.frustumBox(hc(0, -0.015, 0.07), hc(0, -0.05, 0.2), [0.24, 0.13], [0.17, 0.1], { color: SKIN, bone: head });
  blob(SKIN, head, hc(0, -0.02, 0.2), [0.07, 0.05, 0.05], { flat: true });
  b.sweep(bezier(hc(0, 0.03, 0.17), hc(0, 0.045, 0.26), hc(0, -0.05, 0.24)), [0.048, 0.03], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  blob(MOUTH, head, hc(0, -0.1, 0.08), [0.09, 0.025, 0.1]);
  b.frustumBox(hc(0, -0.14, -0.02), hc(0, -0.15, 0.17), [0.2, 0.07], [0.18, 0.07], { color: SKIN, bone: jaw });
  blob(SKIN, jaw, hc(0, -0.16, 0.15), [0.08, 0.05, 0.06]);
=======
  blob(MOUTH, head, hc(0, -0.105, 0.12), [0.12, 0.03, 0.13]);
  b.frustumBox(hc(0, -0.14, -0.04), hc(0, -0.15, 0.2), [0.24, 0.075], [0.2, 0.075], { color: SKIN, bone: jaw });
  blob(SKIN, jaw, hc(0, -0.165, 0.18), [0.1, 0.05, 0.07]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const x = (i - 1.5) * 0.035;
    b.spike(hc(x, -0.108, 0.17), [0, 1, 0], 0.03, 0.01, { color: BONE_D, bone: jaw });
=======
    const x = (i - 1.5) * 0.04;
    b.spike(hc(x, -0.108, 0.19), [0, 1, 0], 0.03, 0.01, { color: BONE_D, bone: jaw });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const path = bezier(hc(s * 0.075, -0.135, 0.12), hc(s * 0.125, -0.15, 0.245), hc(s * 0.115, -0.015, 0.275));
    b.sweep(path, [0.034, 0.004], { color: TUSKP, bone: jaw, caps: { start: "flat", end: "point" } });
    b.part(new THREE.TorusGeometry(0.027, 0.0075, 5, 8), RED, {
=======
    const path = bezier(hc(s * 0.095, -0.135, 0.14), hc(s * 0.18, -0.15, 0.3), hc(s * 0.16, 0.1, 0.32));
    b.sweep(path, [0.04, 0.003], { color: TUSKP, bone: jaw, caps: { start: "flat", end: "point" } });
    b.part(new THREE.TorusGeometry(0.034, 0.008, 5, 8), RED, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.TorusGeometry(0.024, 0.006, 5, 8), GOLD, {
=======
    b.part(new THREE.TorusGeometry(0.027, 0.006, 5, 8), GOLD, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tp = bezier(hc(s * 0.025, -0.19, 0.15), hc(s * 0.04, -0.27, 0.18), hc(s * 0.03, -0.35, 0.16));
=======
    const tp = bezier(hc(s * 0.05, -0.18, 0.17), hc(s * 0.07, -0.27, 0.2), hc(s * 0.055, -0.35, 0.18));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const earAt = v3(hc(s * 0.13, 0.01, -0.02));
=======
    const earAt = v3(hc(s * 0.165, 0.02, -0.02));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const lobe = earAt.clone().addScaledVector(xd, 0.09).add(new THREE.Vector3(0, -0.05, 0));
    b.part(new THREE.TorusGeometry(0.028, 0.007, 5, 8), GOLD, { bone: head, at: arr(lobe) });
=======
    const lobe = earAt.clone().addScaledVector(xd, 0.05).add(new THREE.Vector3(0, -0.06, 0));
    blob(SKIN, head, arr(lobe), [0.022, 0.03, 0.016]);
    b.part(new THREE.TorusGeometry(0.024, 0.006, 5, 8), GOLD, {
      bone: head,
      at: arr(lobe.clone().add(new THREE.Vector3(0, -0.012, 0))),
      dir: arr(xd),
      axis: "z",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.decal([skullP, ...cheeks], FACEPAINT, { at: hc(0, 0.005, 0.17), dir: [0, 0, 1], size: [0.31, 0.18] });
=======
  b.decal([skullP, ...cheeks], FACEPAINT, { at: hc(0, 0.01, 0.19), dir: [0, 0, 1], size: [0.36, 0.21] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const h of b.surface([skullP, skullBack]).scatter(7, { rng: R, minDist: 0.06, filter: (x) => x.n.z > -0.2 }))
=======
  for (const h of b.surface([skullP, skullBack]).scatter(4, { rng: R, minDist: 0.08, filter: (x) => x.n.y > 0.35 }))
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.pose(jaw, { axis: [1, 0, 0], deg: 5 });
=======
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0.7, 0.5], [0.65, 0.8], [0.6, 1.0], [0.55, 1.1], [0.5, 1.12], [0.45, 1.05], [0.4, 1.0],
    [0.34, 0.95], [0.28, 0.9], [0.22, 0.85], [0.16, 0.78], [0.1, 0.68], [0.04, 0.55],
=======
    [0.62, 0.8], [0.54, 1.05], [0.46, 1.1], [0.38, 0.7], [0.3, 0.52], [0.22, 0.46], [0.15, 0.42], [0.08, 0.36],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const onHead = z >= 0.4;
=======
    const onHead = z >= 0.36;
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const [dx, dz, kk] of [[0, 0, 1], [0.034, 0.012, 0.74], [-0.034, -0.012, 0.74]]) {
      const h = surf.ray([dx, 3, z + dz], [0, -1, 0]);
=======
    for (const [dx, kk, tilt] of [[0, 1, 0], [0.032, 0.68, 1], [-0.032, 0.68, -1]]) {
      const h = surf.ray([dx, 3, z], [0, -1, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [dx, h.at.y, z + dz],
        x: [0, 0, -1],
        thickness: [0.032, 0.008],
=======
        at: [dx, h.at.y + 0.015, z],
        x: [0, 0, -1],
        y: [Math.sin(tilt * 0.349), Math.cos(tilt * 0.349), 0],
        thickness: tilt ? [0.04, 0.01] : [0.065, 0.012],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const dp = bezier(hc(s * 0.08, -0.03, -0.15), hc(s * 0.17, -0.12, -0.18), [s * 0.17, 1.45, 0.3]);
=======
    const dp = bezier(hc(s * 0.12, -0.01, -0.15), hc(s * 0.2, -0.12, -0.18), [s * 0.2, 1.47, 0.28]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(SKIN, wrist, arr(palm), [0.088, 0.085, 0.052]);
=======
    blob(SKIN, wrist, arr(palm), [0.095, 0.09, 0.065]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(ch, [r, r * 0.65], { color: SKIN, sides: 6 });
      b.spike(arr(p2), arr(d1), 0.055, r * 0.55, { color: CLAW, bone: ch.joints[1] });
=======
      b.sweep(ch, [r, r * 0.65], { color: SKIN, sides: 6 });
      blob(SKIN, wrist, arr(p0), r * 1.2);
      blob(SKIN, ch.joints[1], arr(p1), r * 0.9);
      b.spike(arr(p2), arr(d1), 0.07, r * 0.5, { color: CLAW, bone: ch.joints[1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-1.5, -0.5, 0.5, 1.5].forEach((u, i) => {
      const p0 = palm.clone().addScaledVector(dir, 0.06).addScaledVector(X, u * 0.037);
      const d0 = dir.clone().addScaledVector(X, u * 0.2).add(new THREE.Vector3(0, 0, 0.1)).normalize();
      finger(`finger${S}${i + 1}`, p0, d0, 0.08, 0.07, 0.03);
    });
    const t0 = palm.clone().addScaledVector(dir, 0.02).add(new THREE.Vector3(-s * 0.08, 0, 0.02));
    const td = new THREE.Vector3(-s * 0.6, -0.5, 0.45).normalize();
    finger(`thumb${S}`, t0, td, 0.07, 0.065, 0.034);
=======
    [-1, 1].forEach((u, i) => {
      const p0 = palm.clone().addScaledVector(dir, 0.065).addScaledVector(X, u * 0.045);
      const d0 = dir.clone().addScaledVector(X, u * 0.16).add(new THREE.Vector3(0, 0, 0.1)).normalize();
      finger(`finger${S}${i + 1}`, p0, d0, 0.095, 0.08, 0.04);
    });
    const t0 = palm.clone().addScaledVector(dir, 0.02).add(new THREE.Vector3(-s * 0.09, 0, 0.02));
    const td = new THREE.Vector3(-s * 0.85, -0.4, 0.4).normalize();
    finger(`thumb${S}`, t0, td, 0.075, 0.07, 0.04);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const ax = new THREE.Vector3(s * 0.55, 1, 0.1).normalize();
    const c = sh.clone().addScaledVector(ax, 0.08);
=======
    const ax = new THREE.Vector3(s * 0.62, 1, 0.05).normalize();
    const c = sh.clone().addScaledVector(ax, 0.07);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [[0, 0], [0.17, 0], [0.18, 0.025], [0.14, 0.085], [0.07, 0.13], [0, 0.145]],
=======
      [[0, 0], [0.19, 0], [0.2, 0.025], [0.16, 0.09], [0.08, 0.14], [0, 0.155]],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const shP: V = [s * 0.37, 1.5, 0.15];
    const handP: V = [s * 0.72, 0.64, 0.28];
=======
    const shP: V = [s * 0.34, 1.5, 0.15];
    const handP: V = [s * 0.66, 0.64, 0.3];
>>>>>>> REPLACE

<<<<<<< SEARCH
    // loincloth front
    b.cards([frame(arr(bf.at.clone().add(new THREE.Vector3(0, 0.02, 0.05))), [0, 1, 0])], CLOTH, {
      size: [0.32, 0.46],
      lean: 150,
      flow: [0, 0, 1],
      sink: 0,
      bone: spine.joints[0],
    });
  }
  const bb = torsoSurf.ray([0, 1.02, -1.2], [0, 0, 1]);
  if (bb) {
    b.cards([frame(arr(bb.at.clone().add(new THREE.Vector3(0, 0.02, -0.05))), [0, 1, 0])], CLOTH, {
      size: [0.34, 0.5],
      lean: 150,
      flow: [0, 0, -1],
      sink: 0,
      bone: spine.joints[0],
    });
  }
=======
    // loincloth front: top edge tucked under the belt, bowed, weighted hem
    b.part(clothGeo(0.3, 0.43, [0, 0.085, 0.13, 0.125], 0.008), "#ffffff", {
      bone: spine.joints[0],
      at: [0, bf.at.y - 0.03, bf.at.z + 0.022],
      texture: CLOTH,
    });
  }
  const bb = torsoSurf.ray([0, 1.02, -1.2], [0, 0, 1]);
  if (bb) {
    b.part(clothGeo(0.32, 0.45, [0, 0.03, 0, -0.06], 0.008), "#ffffff", {
      bone: spine.joints[0],
      at: [0, bb.at.y - 0.03, bb.at.z - 0.022],
      rotation: [0, 180, 0],
      texture: CLOTH,
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  fetish([0.2, 1.0, 0.1], spine.joints[0]);
  fetish([-0.2, 1.0, 0.1], spine.joints[0], 0.9);
=======
  const beltAt = (target: V): V => {
    const q = pos(beltPath.at(beltPath.closestT(target)));
    return [q.x, q.y + 0.008, q.z + 0.02];
  };
  fetish(beltAt([0.2, 1.0, 0.2]), spine.joints[0]);
  fetish(beltAt([-0.2, 1.0, 0.2]), spine.joints[0], 0.9);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const h of bodySurf.scatter(20, { rng: R, minDist: 0.1, filter: (x) => x.n.y > -0.2 }))
=======
  for (const h of bodySurf.scatter(8, { rng: R, minDist: 0.2, filter: (x) => x.n.y > -0.2 && x.n.z < 0.35 }))
>>>>>>> REPLACE

<<<<<<< SEARCH
  const pend = pos(collar.at(0));
  skull([pend.x, pend.y - 0.07, pend.z + 0.05], [0, -0.2, 1], 0.12, spine.joints[1], { eye: GLOWG });
  feathers([[pend.x - 0.05, pend.y - 0.14, pend.z + 0.05], [pend.x + 0.05, pend.y - 0.14, pend.z + 0.05]], spine.joints[1], [0.04, 0.14]);
=======
  const pend = pos(collar.at(0));
  const crownP: V = [pend.x, pend.y - 0.03, pend.z + 0.03];
  skull([pend.x, pend.y - 0.095, pend.z + 0.03], [0, -0.2, 1], 0.12, spine.joints[1], { eye: GLOWG });
  b.rod(arr(pend), crownP, 0.008, { color: LEATHER_D, bone: spine.joints[1] });
  b.part(new THREE.TorusGeometry(0.016, 0.005, 5, 8), LEATHER_D, { bone: spine.joints[1], at: crownP });
  feathers(
    [[pend.x - 0.045, pend.y - 0.13, pend.z + 0.04], [pend.x, pend.y - 0.14, pend.z + 0.04], [pend.x + 0.045, pend.y - 0.13, pend.z + 0.04]],
    spine.joints[1],
    [0.07, 0.15],
    [0, 0, 1],
    25,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const r = 1.2 + 0.05 * Math.sin(3 * a + 0.5) + 0.035 * Math.sin(7 * a + 1.2);
=======
    const r = 1.3 + 0.05 * Math.sin(3 * a + 0.5) + 0.035 * Math.sin(7 * a + 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
      texture: RUNES,
    }),
    1.2,
=======
      texture: RUNES,
    }),
    0.4,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const TX = 0.8;
  const TZ = -0.72;
  const yaw = -48;
  const ya = (yaw * Math.PI) / 180;
  b.part(new THREE.CylinderGeometry(0.09, 0.11, 1.5, 8), WOODP, { bone: base, at: [TX, G + 0.75, TZ] });
  const faces = [TOTEM_TROLL, TOTEM_BIRD, TOTEM_SPIRIT];
  faces.forEach((tex, i) => {
    b.part(new THREE.BoxGeometry(0.34, 0.3, 0.34), "#ffffff", {
      bone: base,
      at: [TX, G + 0.5 + i * 0.32, TZ],
      rotation: [0, yaw, 0],
      texture: tex,
    });
  });
  for (const y of [0.34, 0.66, 0.98, 1.3])
    b.part(new THREE.BoxGeometry(0.39, 0.035, 0.39), RED_D, { bone: base, at: [TX, G + y, TZ], rotation: [0, yaw, 0] });
  for (const y of [0.2, 1.42])
    b.part(new THREE.TorusGeometry(0.105, 0.014, 5, 10), LEATHER, { bone: base, at: [TX, G + y, TZ], rotation: [90, 0, 0] });
  // wings
  const xd: V = [Math.cos(ya), 0, -Math.sin(ya)];
  for (const s of [1, -1])
    b.extrude(
      [[0.14, 0.04], [0.5, 0.2, "sharp"], [0.42, 0.02], [0.46, -0.1, "sharp"], [0.34, -0.06], [0.3, -0.2, "sharp"], [0.14, -0.1]],
      { at: [TX, G + 0.82, TZ], x: [xd[0] * s, 0, xd[2] * s], y: [0, 1, 0], thickness: 0.03, color: WINGP, bone: base },
    );
  // crowning skull, horns and feathers
  const face: V = [-0.75, 0, 0.66];
  const crown = skull([TX, G + 1.5, TZ], face, 0.24, base, { eye: GLOWG });
  const hornTips: V[] = [];
  for (const s of [1, -1]) {
    const hp = bezier(crown.L(s * 0.45, 0.2, 0), crown.L(s * 0.85, 0.3, -0.05), crown.L(s * 0.8, 0.95, 0));
    b.sweep(hp, [0.034, 0.004], { color: BONE_D, bone: base });
    hornTips.push(arr(pos(hp.at(0.75))));
  }
  feathers(hornTips, base, [0.07, 0.3]);
  feathers([crown.L(0, 0.55, -0.3), crown.L(0.2, 0.5, -0.3), crown.L(-0.2, 0.5, -0.3)], base, [0.07, 0.3], [0, 0, 1]);
  // fetishes hanging from the wings
  for (const s of [1, -1]) {
    const wp = [TX + xd[0] * s * 0.4, G + 0.8, TZ + xd[2] * s * 0.4] as V;
    fetish([wp[0], wp[1] - 0.02, wp[2]], base, 0.9);
  }
  // skull-and-bone pile at the foot
  skull([TX - 0.22, G + 0.055, TZ + 0.3], [-0.6, 0, 0.8], 0.1, base);
  boneRod([TX - 0.35, G + 0.025, TZ + 0.1], [TX - 0.1, G + 0.025, TZ + 0.38], 0.014, base);
=======
  const TS = 0.7;
  const TX = 0.88;
  const TZ = -0.52;
  const yaw = -48;
  const ya = (yaw * Math.PI) / 180;
  const ty = (y: number) => G + y * TS;
  const sc = (o: Outline): Outline =>
    o.map((p) => (p.length === 3 ? [p[0] * TS, p[1] * TS, "sharp"] : [p[0] * TS, p[1] * TS])) as Outline;
  b.part(new THREE.CylinderGeometry(0.09 * TS, 0.11 * TS, 1.5 * TS, 8), WOODP, { bone: base, at: [TX, ty(0.75), TZ] });
  const faces = [TOTEM_TROLL, TOTEM_BIRD, TOTEM_SPIRIT];
  faces.forEach((tex, i) => {
    b.part(new THREE.BoxGeometry(0.34 * TS, 0.3 * TS, 0.34 * TS), "#ffffff", {
      bone: base,
      at: [TX, ty(0.5 + i * 0.32), TZ],
      rotation: [0, yaw, 0],
      texture: tex,
    });
  });
  for (const y of [0.34, 0.66, 0.98, 1.3])
    b.part(new THREE.BoxGeometry(0.39 * TS, 0.035 * TS, 0.39 * TS), RED_D, { bone: base, at: [TX, ty(y), TZ], rotation: [0, yaw, 0] });
  for (const y of [0.2, 1.42])
    b.part(new THREE.TorusGeometry(0.105 * TS, 0.014 * TS, 5, 10), LEATHER, { bone: base, at: [TX, ty(y), TZ], rotation: [90, 0, 0] });
  // wings
  const xd: V = [Math.cos(ya), 0, -Math.sin(ya)];
  for (const s of [1, -1])
    b.extrude(
      sc([[0.14, 0.04], [0.5, 0.2, "sharp"], [0.42, 0.02], [0.46, -0.1, "sharp"], [0.34, -0.06], [0.3, -0.2, "sharp"], [0.14, -0.1]]),
      { at: [TX, ty(0.82), TZ], x: [xd[0] * s, 0, xd[2] * s], y: [0, 1, 0], thickness: 0.03 * TS, color: WINGP, bone: base },
    );
  // crowning skull, horns and feathers
  const face: V = [-0.75, 0, 0.66];
  const crown = skull([TX, ty(1.5), TZ], face, 0.24 * TS, base, { eye: GLOWG });
  const hornTips: V[] = [];
  for (const s of [1, -1]) {
    const hp = bezier(crown.L(s * 0.45, 0.2, 0), crown.L(s * 0.85, 0.3, -0.05), crown.L(s * 0.8, 0.95, 0));
    b.sweep(hp, [0.034 * TS, 0.004], { color: BONE_D, bone: base });
    hornTips.push(arr(pos(hp.at(0.75))));
  }
  feathers(hornTips, base, [0.07 * TS, 0.3 * TS]);
  feathers([crown.L(0, 0.55, -0.3), crown.L(0.2, 0.5, -0.3), crown.L(-0.2, 0.5, -0.3)], base, [0.07 * TS, 0.3 * TS], [0, 0, 1]);
  // fetishes hanging from the wings
  for (const s of [1, -1]) {
    const wp = [TX + xd[0] * s * 0.4 * TS, ty(0.8), TZ + xd[2] * s * 0.4 * TS] as V;
    fetish([wp[0], wp[1] - 0.02 * TS, wp[2]], base, 0.9 * TS);
  }
  // skull-and-bone pile at the foot
  skull([TX - 0.22 * TS, G + 0.04, TZ + 0.3 * TS], [-0.6, 0, 0.8], 0.1 * TS, base);
  boneRod([TX - 0.35 * TS, G + 0.02, TZ + 0.1 * TS], [TX - 0.1 * TS, G + 0.02, TZ + 0.38 * TS], 0.012, base);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const CX = -0.82;
  const CZ = -0.55;
  b.lathe([[0, 0.06], [0.15, 0.03], [0.27, 0.1], [0.33, 0.22], [0.32, 0.34], [0.28, 0.4], [0, 0.4]], {
    at: [CX, G, CZ],
    segments: 10,
    color: POTP,
    bone: base,
  });
  b.part(new THREE.TorusGeometry(0.29, 0.032, 5, 12), IRON, { bone: base, at: [CX, G + 0.4, CZ], rotation: [90, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.265, 0.265, 0.012, 12), "#6dd36a", { bone: base, at: [CX, G + 0.403, CZ] }), 1.3);
  for (const a of [0, 120, 240]) {
    const r = (a * Math.PI) / 180;
    b.part(new THREE.CylinderGeometry(0.03, 0.045, 0.1, 5), IRON, { bone: base, at: [CX + Math.cos(r) * 0.22, G + 0.04, CZ + Math.sin(r) * 0.22] });
    glow(
      b.part(new THREE.ConeGeometry(0.05, 0.14, 5), "#9dff7a", {
        bone: base,
        at: [CX + Math.cos(r + 1.0) * 0.12, G + 0.08, CZ + Math.sin(r + 1.0) * 0.12],
      }),
      1.2,
    );
  }
  for (const s of [1, -1])
    b.part(new THREE.TorusGeometry(0.05, 0.01, 5, 8), IRON, { bone: base, at: [CX + s * 0.33, G + 0.34, CZ], rotation: [0, 90, 0] });
  b.rod([CX + 0.08, G + 0.38, CZ + 0.02], [CX - 0.22, G + 0.9, CZ + 0.14], 0.018, { color: WOODP, bone: base });
  for (const [dx, dy, dz, r] of [[0.08, 0.46, 0.05, 0.035], [-0.1, 0.5, -0.08, 0.026], [0.02, 0.58, -0.02, 0.02], [-0.04, 0.7, 0.06, 0.016]] as number[][])
    glow(b.part(sphereG(6, 4), GLOWG, { bone: base, at: [CX + dx, G + dy, CZ + dz], scale: [r, r, r] }), 1.4);
=======
  const CS = 0.8;
  const CX = -0.82;
  const CZ = -0.55;
  const cy = (y: number) => G + y * CS;
  b.lathe(
    ([[0, 0.06], [0.15, 0.03], [0.27, 0.1], [0.33, 0.22], [0.32, 0.34], [0.28, 0.4], [0, 0.4]] as Array<[number, number]>).map(
      ([x, y]) => [x * CS, y * CS] as [number, number],
    ),
    {
      at: [CX, G, CZ],
      segments: 10,
      color: POTP,
      bone: base,
    },
  );
  b.part(new THREE.TorusGeometry(0.29 * CS, 0.032 * CS, 5, 12), IRON, { bone: base, at: [CX, cy(0.4), CZ], rotation: [90, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.265 * CS, 0.265 * CS, 0.012, 12), "#6dd36a", { bone: base, at: [CX, cy(0.403), CZ] }), 1.3);
  for (const a of [0, 120, 240]) {
    const r = (a * Math.PI) / 180;
    b.part(new THREE.CylinderGeometry(0.03 * CS, 0.045 * CS, 0.1 * CS, 5), IRON, {
      bone: base,
      at: [CX + Math.cos(r) * 0.22 * CS, cy(0.04), CZ + Math.sin(r) * 0.22 * CS],
    });
    glow(
      b.part(new THREE.ConeGeometry(0.05 * CS, 0.14 * CS, 5), "#9dff7a", {
        bone: base,
        at: [CX + Math.cos(r + 1.0) * 0.12 * CS, cy(0.08), CZ + Math.sin(r + 1.0) * 0.12 * CS],
      }),
      1.2,
    );
  }
  for (const s of [1, -1])
    b.part(new THREE.TorusGeometry(0.05 * CS, 0.01 * CS, 5, 8), IRON, { bone: base, at: [CX + s * 0.33 * CS, cy(0.34), CZ], rotation: [0, 90, 0] });
  b.rod([CX + 0.08 * CS, cy(0.38), CZ + 0.02 * CS], [CX - 0.22 * CS, cy(0.9), CZ + 0.14 * CS], 0.016, { color: WOODP, bone: base });
  for (const [dx, dy, dz, r] of [[0.08, 0.46, 0.05, 0.035], [-0.1, 0.5, -0.08, 0.026], [0.02, 0.58, -0.02, 0.02], [-0.04, 0.7, 0.06, 0.016]] as number[][])
    glow(b.part(sphereG(6, 4), GLOWG, { bone: base, at: [CX + dx * CS, cy(dy), CZ + dz * CS], scale: [r * CS, r * CS, r * CS] }), 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 26; i++) reedFrames.push(frame(polar(122 + i * 4.4, 1.08 + 0.1 * R()), [0, 1, 0]));
  for (let j = 0; j < 5; j++) {
    reedFrames.push(frame(polar(66 + j * 6, 1.1 + 0.08 * R()), [0, 1, 0]));
    reedFrames.push(frame(polar(294 - j * 6, 1.1 + 0.08 * R()), [0, 1, 0]));
  }
  b.cards(reedFrames, REED, { size: [0.1, 0.7], lean: 4, bend: 16, vary: 0.4, spin: 80, rng: R, cross: true, bone: base });
=======
  for (let i = 0; i < 12; i++) reedFrames.push(frame(polar(148 + i * 6.5, 1.2 + 0.08 * R()), [0, 1, 0]));
  for (const a of [112, 120, 128]) reedFrames.push(frame(polar(a, 1.27 + 0.05 * R()), [0, 1, 0]));
  b.cards(reedFrames, REED, { size: [0.07, 0.42], lean: 4, bend: 16, vary: 0.3, spin: 80, rng: R, cross: true, bone: base });
>>>>>>> REPLACE