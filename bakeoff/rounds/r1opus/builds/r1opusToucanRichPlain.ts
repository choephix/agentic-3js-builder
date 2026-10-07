import * as THREE from "three";

export const meta = {
  name: "Keel-billed Toucan on Mossy Branch",
  description:
    "A stylized low-poly keel-billed toucan perched on a short mossy branch. It has a banded rainbow beak in lime, sky blue and orange with a cherry tip, a glossy black body, a lemon bib and lime eye rings. A pink orchid blooms beside it.",
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = mulberry32(1337);
  const root = new THREE.Group();

  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (color: number, rough = 0.6, metal = 0, flat = true) => {
    const key = `${color}-${rough}-${metal}-${flat}`;
    let m = mats.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, flatShading: flat });
      mats.set(key, m);
    }
    return m;
  };

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D,
    pos: [number, number, number], scale?: [number, number, number], rot?: [number, number, number]) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(...pos);
    if (scale) mesh.scale.set(...scale);
    if (rot) mesh.rotation.set(...rot);
    parent.add(mesh);
    return mesh;
  };

  const Y = new THREE.Vector3(0, 1, 0);
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, m: THREE.Material, parent: THREE.Object3D, seg = 6) => {
    const d = b.clone().sub(a);
    const len = d.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, seg), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y, d.normalize());
    parent.add(mesh);
    return mesh;
  };

  // ---------- Colours ----------
  const black = mat(0x0d0d12, 0.22, 0.15);
  const blackSheen = mat(0x1a1f2e, 0.25, 0.2);
  const yellow = mat(0xffe23a, 0.5);
  const lime = mat(0x8fe03a, 0.4);
  const sky = mat(0x45b8f0, 0.35);
  const orange = mat(0xff8a1e, 0.35);
  const cherry = mat(0xd4142a, 0.35);
  const scarlet = mat(0xff2a1a, 0.5);
  const footBlue = mat(0x3b6fe0, 0.45);
  const eyeDark = mat(0x0a1a10, 0.1, 0.2, false);
  const white = mat(0xffffff, 0.2, 0, false);
  const beakDark = mat(0x22201c, 0.5);
  const cutWood = mat(0xd2a774, 0.8);
  const moss1 = mat(0x4f8a26, 0.9);
  const moss2 = mat(0x7fb83a, 0.9);
  const moss3 = mat(0x356b1e, 0.9);
  const leafGreen = mat(0x2f8a3a, 0.5);
  const pink = mat(0xff7fbf, 0.5);
  const pinkLight = mat(0xffb3dc, 0.5);
  const magenta = mat(0xc2187a, 0.5);
  const orchidYellow = mat(0xffd84a, 0.5);

  // ---------- Bark texture ----------
  let barkMat: THREE.MeshStandardMaterial;
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#6b4a2f"; g.fillRect(0, 0, 128, 64);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = rand() > 0.5 ? "#4a3220" : "#83603e";
      const y = rand() * 64;
      g.fillRect(rand() * 128, y, 20 + rand() * 60, 1 + rand() * 3);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    barkMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, flatShading: true });
  } else {
    barkMat = mat(0x6b4a2f, 0.95);
  }

  // ---------- Branch ----------
  const BR = 0.036;
  const branchGeo = new THREE.CylinderGeometry(BR * 0.92, BR, 0.72, 8, 3);
  const bp = branchGeo.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    const yy = bp.getY(i);
    if (Math.abs(yy) < 0.35) {
      bp.setX(i, bp.getX(i) * (0.93 + rand() * 0.12));
      bp.setZ(i, bp.getZ(i) * (0.93 + rand() * 0.12));
    }
  }
  branchGeo.computeVertexNormals();
  const branch = new THREE.Mesh(branchGeo, [barkMat, cutWood, cutWood]);
  branch.rotation.z = Math.PI / 2;
  branch.position.set(0, BR, 0);
  root.add(branch);
  // growth ring discs on ends
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(BR * 0.5, BR * 0.5, 0.004, 8), mat(0xa77a4c, 0.8), root,
      [s * 0.361, BR, 0], undefined, [0, 0, Math.PI / 2]);
  }
  // side twig
  limb(new THREE.Vector3(-0.2, BR + 0.01, -0.02), new THREE.Vector3(-0.3, 0.14, -0.08), 0.014, 0.007, barkMat, root);
  limb(new THREE.Vector3(-0.3, 0.14, -0.08), new THREE.Vector3(-0.33, 0.18, -0.06), 0.007, 0.004, barkMat, root);
  add(new THREE.SphereGeometry(0.014, 5, 4), leafGreen, root, [-0.335, 0.185, -0.06], [0.6, 1.4, 0.35], [0, 0.4, -0.3]);

  // Moss clumps
  const mossMats = [moss1, moss2, moss3];
  for (let i = 0; i < 34; i++) {
    const x = -0.34 + rand() * 0.68;
    if (Math.abs(x) < 0.05 && rand() < 0.7) continue;
    const ang = (rand() - 0.5) * 2.4;
    const r = 0.009 + rand() * 0.013;
    const m = add(new THREE.IcosahedronGeometry(r, 0), mossMats[i % 3], root,
      [x, BR + Math.cos(ang) * BR * 0.95, Math.sin(ang) * BR * 0.95], [1.3, 0.6, 1.1]);
    m.rotation.set(ang, rand() * 3, 0);
  }
  // Moss tufts / dangles
  for (let i = 0; i < 10; i++) {
    const x = -0.3 + rand() * 0.6;
    const side = rand() > 0.5 ? 1 : -1;
    add(new THREE.ConeGeometry(0.006, 0.03 + rand() * 0.02, 4), moss2, root,
      [x, BR + 0.005, side * BR * 0.95], undefined, [Math.PI, 0, 0]);
  }
  for (let i = 0; i < 8; i++) {
    const x = -0.3 + rand() * 0.6;
    add(new THREE.ConeGeometry(0.003, 0.02, 3), moss3, root,
      [x, BR * 2 + 0.006, (rand() - 0.5) * 0.03], undefined, [(rand() - 0.5) * 0.6, 0, (rand() - 0.5) * 0.6]);
  }

  // ---------- Toucan ----------
  const bird = new THREE.Group();
  root.add(bird);
  const perchY = BR * 2;

  // Feet & legs
  for (const s of [-1, 1]) {
    const x = s * 0.026;
    const ankle = new THREE.Vector3(x, perchY + 0.006, 0);
    limb(ankle, new THREE.Vector3(x * 1.05, perchY + 0.05, -0.008), 0.007, 0.008, footBlue, bird);
    add(new THREE.SphereGeometry(0.009, 6, 5), footBlue, bird, [ankle.x, ankle.y, ankle.z]);
    for (const dz of [1, -1]) {
      for (const dx of [-0.007, 0.007]) {
        const a = new THREE.Vector3(x + dx, perchY + 0.005, 0);
        const b = new THREE.Vector3(x + dx * 1.3, perchY - 0.008, dz * 0.03);
        const c = new THREE.Vector3(x + dx * 1.4, perchY - 0.03, dz * 0.04);
        limb(a, b, 0.0045, 0.004, footBlue, bird, 5);
        limb(b, c, 0.004, 0.003, footBlue, bird, 5);
        limb(c, c.clone().add(new THREE.Vector3(0, -0.008, -dz * 0.004)), 0.0025, 0.0005, beakDark, bird, 4);
      }
    }
  }

  // Tail (behind the branch)
  const tail = new THREE.Group();
  tail.position.set(0, 0.14, -0.06);
  tail.rotation.x = 0.38;
  bird.add(tail);
  add(new THREE.BoxGeometry(0.062, 0.13, 0.016), black, tail, [0, -0.065, 0]);
  add(new THREE.BoxGeometry(0.05, 0.03, 0.017), blackSheen, tail, [0, -0.125, 0.001]);
  add(new THREE.BoxGeometry(0.044, 0.1, 0.012), blackSheen, tail, [0, -0.05, -0.01]);

  // Body
  add(new THREE.SphereGeometry(1, 10, 8), black, bird, [0, 0.205, -0.01], [0.068, 0.115, 0.07], [-0.2, 0, 0]);
  // Scarlet undertail
  add(new THREE.SphereGeometry(1, 8, 6), scarlet, bird, [0, 0.12, -0.045], [0.036, 0.026, 0.032]);
  // Bib + red band
  add(new THREE.SphereGeometry(1, 10, 8), yellow, bird, [0, 0.268, 0.033], [0.057, 0.066, 0.042]);
  add(new THREE.SphereGeometry(1, 10, 6), cherry, bird, [0, 0.212, 0.04], [0.052, 0.011, 0.034]);

  // Wings
  for (const s of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(s * 0.06, 0.225, -0.015);
    w.rotation.set(-0.3, 0, s * 0.14);
    bird.add(w);
    add(new THREE.SphereGeometry(1, 8, 6), blackSheen, w, [0, -0.02, 0], [0.022, 0.095, 0.055]);
    for (let i = 0; i < 4; i++) {
      add(new THREE.BoxGeometry(0.012, 0.05, 0.022), i % 2 ? black : blackSheen, w,
        [s * 0.004, -0.1 - i * 0.008, -0.03 + i * 0.016], undefined, [0.15 * i - 0.2, 0, 0]);
    }
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.335, 0);
  head.rotation.set(-0.12, 0.28, 0);
  bird.add(head);
  add(new THREE.SphereGeometry(0.056, 10, 8), black, head, [0, 0, 0]);
  add(new THREE.SphereGeometry(1, 8, 6), yellow, head, [0, -0.022, 0.03], [0.046, 0.034, 0.03]);
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(1, 8, 6), yellow, head, [s * 0.034, -0.016, 0.028], [0.018, 0.026, 0.024]);
    // lime ring
    add(new THREE.CylinderGeometry(0.018, 0.019, 0.008, 10), lime, head, [s * 0.05, 0.012, 0.02], undefined, [0, 0, Math.PI / 2]);
    add(new THREE.SphereGeometry(0.0095, 8, 6), eyeDark, head, [s * 0.0545, 0.012, 0.021]);
    add(new THREE.SphereGeometry(0.0028, 5, 4), white, head, [s * 0.062, 0.016, 0.024]);
  }

  // Beak
  const L = 0.175;
  const W = 0.046;
  const tUp = (u: number) => { const t = u / L; return 0.047 * (1 - Math.pow(t, 1.5)) - 0.016 * t * t; };
  const bUp = (u: number) => { const t = u / L; return -0.016 * t * t; };
  const bLo = (u: number) => { const t = u / L; return bUp(u) - 0.03 * Math.pow(Math.max(0, 1 - t), 0.9); };
  const taper = (u: number) => 1 - 0.55 * (u / L);

  const beak = new THREE.Group();
  beak.position.set(0, -0.004, 0.042);
  beak.rotation.x = -0.12;
  head.add(beak);

  const beakSeg = (top: (u: number) => number, bot: (u: number) => number, u0: number, u1: number, m: THREE.Material, inset = 0) => {
    const n = 4;
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n; pts.push(new THREE.Vector2(u, top(u))); }
    for (let i = n; i >= 0; i--) { const u = u0 + (u1 - u0) * i / n; pts.push(new THREE.Vector2(u, bot(u))); }
    const width = W - inset;
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: width, bevelEnabled: false, steps: 1 });
    geo.translate(0, 0, -width / 2);
    geo.rotateY(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * taper(p.getZ(i)));
    geo.computeVertexNormals();
    beak.add(new THREE.Mesh(geo, m));
  };
  // upper mandible bands
  beakSeg(tUp, bUp, 0, 0.075, lime);
  beakSeg(tUp, bUp, 0.075, 0.14, orange);
  beakSeg(tUp, bUp, 0.14, L, cherry);
  // lower mandible bands
  const bUpLo = (u: number) => bUp(u) - 0.0005;
  beakSeg(bUpLo, bLo, 0, 0.09, sky);
  beakSeg(bUpLo, bLo, 0.09, 0.14, lime, 0.002);
  beakSeg(bUpLo, bLo, 0.14, L, cherry);
  // culmen stripe accent
  beakSeg((u) => tUp(u) + 0.0015, (u) => tUp(u) - 0.004, 0.005, 0.07, mat(0xb8f060, 0.4), 0.03);
  // dark base band
  add(new THREE.BoxGeometry(W + 0.004, 0.082, 0.006), beakDark, beak, [0, 0.008, 0.001]);
  // serrations along cutting edge
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const u = 0.03 + i * 0.02;
      add(new THREE.ConeGeometry(0.0028, 0.006, 3), beakDark, beak,
        [s * (W / 2) * taper(u), bUp(u) - 0.001, u], undefined, [Math.PI, 0, 0]);
    }
  }
  // nostril hint
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.003, 4, 3), beakDark, beak, [s * 0.016, 0.04, 0.006]);

  // ---------- Orchid ----------
  const orchid = new THREE.Group();
  orchid.position.set(0.2, perchY - 0.004, 0.008);
  root.add(orchid);
  // leaves
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(1, 6, 4), leafGreen, orchid, [s * 0.04, 0.006, 0.012], [0.05, 0.007, 0.018], [0, s * 0.3, s * -0.15]);
  }
  const s0 = new THREE.Vector3(0, 0, 0);
  const s1 = new THREE.Vector3(0.006, 0.05, 0.015);
  const s2 = new THREE.Vector3(0.016, 0.09, 0.035);
  const stemMat = mat(0x4f7a2a, 0.6);
  limb(s0, s1, 0.003, 0.0028, stemMat, orchid, 5);
  limb(s1, s2, 0.0028, 0.0025, stemMat, orchid, 5);
  limb(s2, new THREE.Vector3(0.03, 0.11, 0.05), 0.0025, 0.002, stemMat, orchid, 5);
  add(new THREE.SphereGeometry(0.008, 6, 5), pinkLight, orchid, [0.012, 0.075, 0.03], [0.9, 1.3, 0.9]);
  add(new THREE.SphereGeometry(0.006, 6, 5), pink, orchid, [-0.002, 0.04, 0.012], [0.9, 1.3, 0.9]);

  const flower = new THREE.Group();
  flower.position.set(0.034, 0.112, 0.056);
  flower.rotation.set(-0.15, 0.35, 0);
  orchid.add(flower);
  // sepals (3) and petals (2)
  const petalGeo = new THREE.SphereGeometry(1, 7, 5);
  [Math.PI / 2, Math.PI / 2 + 2.1, Math.PI / 2 - 2.1].forEach((a) => {
    const m = add(petalGeo, pinkLight, flower, [Math.cos(a) * 0.017, Math.sin(a) * 0.017, -0.002], [0.007, 0.018, 0.002]);
    m.rotation.z = a - Math.PI / 2;
  });
  [0.35, Math.PI - 0.35].forEach((a) => {
    const m = add(petalGeo, pink, flower, [Math.cos(a) * 0.018, Math.sin(a) * 0.018, 0], [0.013, 0.02, 0.0025]);
    m.rotation.z = a - Math.PI / 2;
  });
  // labellum
  add(new THREE.SphereGeometry(0.011, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), magenta, flower,
    [0, -0.01, 0.006], [1, 1.1, 1], [Math.PI / 2 + 0.5, 0, 0]);
  add(new THREE.SphereGeometry(0.0045, 6, 4), orchidYellow, flower, [0, 0.002, 0.006]);
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(0.0022, 4, 3), white, flower, [s * 0.004, -0.004, 0.009]);
  }

  return root;
}
