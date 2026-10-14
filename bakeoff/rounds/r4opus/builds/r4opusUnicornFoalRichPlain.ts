import * as THREE from "three";

export const meta = {
  name: "Newborn Unicorn Foal",
  description:
    "A wobbly-legged newborn unicorn foal with a pearly lilac-shimmer coat, fluffy pastel mane and tail, a small spiralled gold horn, big long-lashed eyes, silver hooves and a daisy chain around its neck.",
};

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = mulberry32(20240611);
  const root = new THREE.Group();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const FWD = V(0, 0, 1);

  // ---------- coat texture: pearly white with lilac / pink shimmer ----------
  function coatTexture(): THREE.Texture | null {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = "#fbf8ff";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 45; i++) {
      const x = rand() * 256, y = rand() * 256, r = 18 + rand() * 50;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      const col = rand() < 0.65 ? "rgba(206,186,245,0.32)" : "rgba(250,206,232,0.28)";
      grd.addColorStop(0, col);
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    for (let i = 0; i < 260; i++) {
      g.fillStyle = rand() < 0.55 ? "rgba(255,255,255,0.95)" : "rgba(190,170,240,0.55)";
      const s = 1 + rand() * 1.6;
      g.fillRect(rand() * 256, rand() * 256, s, s);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  // ---------- materials ----------
  const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, flatShading: true, ...o });

  const coat = std("#ffffff", { map: coatTexture(), roughness: 0.42, metalness: 0.08 });
  const coatLilac = std("#e7dafb", { roughness: 0.4, metalness: 0.1 });
  const muzzleMat = std("#f4d4ea", { roughness: 0.5 });
  const pink = std("#f7b0cf", { roughness: 0.85 });
  const mint = std("#a9e9cf", { roughness: 0.85 });
  const lavender = std("#c6aef2", { roughness: 0.85 });
  const gold = std("#e6b440", { metalness: 0.65, roughness: 0.3 });
  const goldLight = std("#ffd978", { metalness: 0.55, roughness: 0.28 });
  const silver = std("#dde2ec", { metalness: 0.6, roughness: 0.25 });
  const eyeMat = std("#160f22", { roughness: 0.12, flatShading: false });
  const irisMat = std("#3d2a63", { roughness: 0.15, flatShading: false });
  const shine = std("#ffffff", { emissive: "#ffffff", emissiveIntensity: 0.8, flatShading: false });
  const lashMat = std("#24192f", { roughness: 0.5 });
  const nostrilMat = std("#7a5580", { roughness: 0.6 });
  const petalMat = std("#fffdf4", { roughness: 0.7 });
  const daisyMid = std("#ffc928", { roughness: 0.6 });
  const stemMat = std("#68b956", { roughness: 0.7 });
  const maneMats = [pink, mint, lavender];

  // ---------- shared geometry ----------
  const sph = new THREE.SphereGeometry(1, 10, 8);
  const sphLo = new THREE.SphereGeometry(1, 6, 4);
  const puff = new THREE.IcosahedronGeometry(1, 0);

  function ball(parent: THREE.Object3D, mat: THREE.Material, p: THREE.Vector3,
    sx: number, sy = sx, sz = sx, geo: THREE.BufferGeometry = sph) {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(p);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
  }

  function limb(parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3,
    rA: number, rB: number, mat: THREE.Material, seg = 7) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, len, seg, 1), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(UP, dir.normalize());
    parent.add(m);
    return m;
  }

  const hoofGeo = new THREE.CylinderGeometry(0.031, 0.04, 0.06, 8);
  const coronetGeo = new THREE.TorusGeometry(0.031, 0.006, 4, 10);
  function hoof(p: THREE.Vector3) {
    const h = new THREE.Mesh(hoofGeo, silver);
    h.position.set(p.x, 0.03, p.z + 0.006);
    root.add(h);
    const r = new THREE.Mesh(coronetGeo, coatLilac);
    r.rotation.x = Math.PI / 2;
    r.position.set(p.x, 0.062, p.z + 0.006);
    root.add(r);
  }

  // ---------- body ----------
  ball(root, coat, V(0, 0.8, -0.01), 0.155, 0.165, 0.31);
  ball(root, coat, V(0, 0.82, 0.22), 0.14, 0.17, 0.17); // chest
  ball(root, coat, V(0, 0.84, -0.22), 0.15, 0.15, 0.16); // rump
  ball(root, coatLilac, V(0, 0.69, 0.0), 0.11, 0.06, 0.2); // soft lilac belly

  // ---------- legs (long, knobbly, splayed: wobbly newborn stance) ----------
  for (const s of [1, -1]) {
    const w = s > 0 ? 0.022 : 0.008; // asymmetric wobble
    // front leg
    const top = V(s * 0.085, 0.75, 0.25);
    const knee = V(s * (0.105 + w * 0.5), 0.39, 0.285);
    const fet = V(s * (0.145 + w), 0.11, 0.27);
    const past = V(s * (0.15 + w), 0.06, 0.285);
    ball(root, coat, top.clone().lerp(knee, 0.22), 0.062, 0.12, 0.072);
    limb(root, top, knee, 0.055, 0.032, coat);
    ball(root, coatLilac, knee, 0.04, 0.046, 0.043);
    limb(root, knee, fet, 0.029, 0.025, coat);
    ball(root, coatLilac, fet, 0.033, 0.033, 0.035);
    limb(root, fet, past, 0.026, 0.029, coatLilac);
    hoof(past);

    // hind leg
    const w2 = s > 0 ? 0.004 : 0.024;
    ball(root, coat, V(s * 0.095, 0.8, -0.24), 0.085, 0.15, 0.12);
    const htop = V(s * 0.105, 0.69, -0.22);
    const hock = V(s * (0.12 + w2 * 0.5), 0.41, -0.335);
    const hfet = V(s * (0.145 + w2), 0.11, -0.27);
    const hpast = V(s * (0.15 + w2), 0.06, -0.255);
    limb(root, htop, hock, 0.062, 0.034, coat);
    ball(root, coatLilac, hock, 0.038, 0.045, 0.045);
    limb(root, hock, hfet, 0.03, 0.025, coat);
    ball(root, coatLilac, hfet, 0.033, 0.033, 0.035);
    limb(root, hfet, hpast, 0.026, 0.029, coatLilac);
    hoof(hpast);
  }

  // ---------- neck ----------
  const nA = V(0, 0.86, 0.27), nB = V(0, 1.1, 0.44);
  const nD = new THREE.Vector3().subVectors(nB, nA);
  limb(root, nA, nB, 0.105, 0.075, coat, 8);
  ball(root, coat, V(0, 0.92, 0.3), 0.11, 0.12, 0.12);

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 1.14, 0.47);
  head.rotation.x = 0.55;
  root.add(head);
  ball(head, coat, V(0, 0, 0), 0.085, 0.09, 0.1); // cranium
  ball(head, coat, V(0, -0.05, 0.02), 0.078, 0.07, 0.085); // round cheeks
  ball(head, coat, V(0, -0.022, 0.13), 0.062, 0.058, 0.09); // muzzle
  ball(head, muzzleMat, V(0, -0.025, 0.205), 0.052, 0.05, 0.036); // soft nose
  for (const s of [1, -1]) {
    const n = ball(head, nostrilMat, V(s * 0.023, -0.012, 0.234), 0.008, 0.013, 0.008, sphLo);
    n.rotation.z = s * 0.4;
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0025, 3, 8, Math.PI), nostrilMat);
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, -0.045, 0.228);
  head.add(mouth);

  // eyes
  const lidGeo = new THREE.TorusGeometry(0.034, 0.0065, 4, 12, Math.PI);
  const lashGeo = new THREE.ConeGeometry(0.0035, 0.03, 3);
  for (const s of [1, -1]) {
    const eye = new THREE.Group();
    eye.position.set(s * 0.072, 0.012, 0.048);
    eye.rotation.y = s * 1.12;
    head.add(eye);
    ball(eye, eyeMat, V(0, 0, 0), 0.031, 0.035, 0.018);
    ball(eye, irisMat, V(0, -0.002, 0.012), 0.022, 0.025, 0.008);
    ball(eye, eyeMat, V(0, -0.002, 0.016), 0.013, 0.016, 0.006);
    ball(eye, shine, V(-s * 0.009, 0.013, 0.018), 0.0075, 0.0075, 0.004, sphLo);
    ball(eye, shine, V(s * 0.01, -0.012, 0.017), 0.0038, 0.0038, 0.003, sphLo);
    const lid = new THREE.Mesh(lidGeo, coatLilac);
    lid.position.z = 0.004;
    eye.add(lid);
    // long lashes sweeping to the outer (back) corner
    for (const deg of [18, 40, 62, 84, 106]) {
      const A = (deg * Math.PI) / 180;
      const base = V(s * 0.036 * Math.cos(A), 0.036 * Math.sin(A), 0.008);
      const dir = V(s * Math.cos(A) * 1.1, Math.sin(A) + 0.35, 0.45).normalize();
      const lash = new THREE.Mesh(lashGeo, lashMat);
      lash.quaternion.setFromUnitVectors(UP, dir);
      lash.position.copy(base).addScaledVector(dir, 0.014);
      eye.add(lash);
    }
    // blush
    ball(head, pink, V(s * 0.072, -0.052, 0.085), 0.012, 0.016, 0.024, sphLo);
  }

  // ears
  const earGeo = new THREE.ConeGeometry(0.03, 0.095, 5);
  for (const s of [1, -1]) {
    const ear = new THREE.Mesh(earGeo, coat);
    ear.position.set(s * 0.052, 0.09, -0.035);
    ear.rotation.set(-0.25, 0, -s * 0.38);
    head.add(ear);
    const inner = new THREE.Mesh(earGeo, pink);
    inner.scale.set(0.6, 0.78, 0.45);
    inner.position.set(0, -0.006, 0.014);
    ear.add(inner);
  }

  // horn: gold cone wrapped in a lighter gold spiral
  const horn = new THREE.Group();
  horn.position.set(0, 0.082, 0.04);
  horn.rotation.x = -0.15;
  head.add(horn);
  const hornCone = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.15, 8), gold);
  hornCone.position.y = 0.075;
  horn.add(hornCone);
  const helixPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const r = 0.024 * (1 - t * 0.93) + 0.0015;
    const a = t * Math.PI * 2 * 3.5;
    helixPts.push(V(Math.cos(a) * r, 0.005 + t * 0.135, Math.sin(a) * r));
  }
  horn.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPts), 70, 0.0045, 4, false), goldLight));
  const hornRing = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 4, 10), goldLight);
  hornRing.rotation.x = Math.PI / 2;
  hornRing.position.y = 0.006;
  horn.add(hornRing);

  // forelock
  const forelock: [number, number, number, number][] = [
    [0, 0.08, 0.0, 0.036], [0.028, 0.075, 0.035, 0.03], [-0.028, 0.075, 0.035, 0.03],
    [0.008, 0.062, 0.075, 0.026], [-0.014, 0.05, 0.095, 0.02],
  ];
  forelock.forEach(([x, y, z, r], i) => {
    const m = ball(head, maneMats[i % 3], V(x, y, z), r, r * 0.9, r, puff);
    m.rotation.set(rand() * 6, rand() * 6, rand() * 6);
  });

  // ---------- mane along the neck crest ----------
  const nUp = V(0, nD.z, -nD.y).normalize(); // up-back normal of neck
  const steps = 9;
  for (let i = 0; i < steps; i++) {
    const t = 0.18 + (i / (steps - 1)) * 0.98;
    const r = 0.105 + (0.075 - 0.105) * Math.min(t, 1);
    const p = nA.clone().addScaledVector(nD, t).addScaledVector(nUp, r + 0.004);
    const big = 0.042 + 0.012 * Math.sin((i / (steps - 1)) * Math.PI);
    const m = ball(root, maneMats[i % 3], p, big, big * 0.9, big, puff);
    m.rotation.set(rand() * 6, rand() * 6, rand() * 6);
    for (const s of [1, -1]) {
      const q = p.clone().add(V(s * 0.03, -0.012, (rand() - 0.5) * 0.02));
      const rr = big * (0.7 + rand() * 0.15);
      const sm = ball(root, maneMats[(i + (s > 0 ? 1 : 2)) % 3], q, rr, rr, rr, puff);
      sm.rotation.set(rand() * 6, rand() * 6, rand() * 6);
    }
  }

  // ---------- tail: short fluffy pastel tuft ----------
  limb(root, V(0, 0.9, -0.33), V(0, 0.86, -0.42), 0.038, 0.03, coat, 6);
  const P0 = V(0, 0.88, -0.41), P1 = V(0, 0.86, -0.55), P2 = V(0, 0.62, -0.51);
  for (let k = 0; k < 8; k++) {
    const t = k / 7;
    const p = new THREE.Vector3()
      .addScaledVector(P0, (1 - t) * (1 - t))
      .addScaledVector(P1, 2 * t * (1 - t))
      .addScaledVector(P2, t * t);
    const r = 0.034 + 0.03 * Math.sin(t * Math.PI * 0.85);
    const m = ball(root, maneMats[k % 3], p, r, r, r, puff);
    m.rotation.set(rand() * 6, rand() * 6, rand() * 6);
    if (k > 0 && k < 7) {
      for (const s of [1, -1]) {
        const rr = r * 0.72;
        const sm = ball(root, maneMats[(k + (s > 0 ? 1 : 2)) % 3],
          p.clone().add(V(s * 0.03, (rand() - 0.5) * 0.03, 0.01)), rr, rr, rr, puff);
        sm.rotation.set(rand() * 6, rand() * 6, rand() * 6);
      }
    }
  }

  // ---------- daisy chain ----------
  function daisy(pos: THREE.Vector3, normal: THREE.Vector3, sc = 1) {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.quaternion.setFromUnitVectors(FWD, normal.clone().normalize());
    g.rotateZ(rand() * Math.PI);
    g.scale.setScalar(sc);
    root.add(g);
    ball(g, daisyMid, V(0, 0, 0.004), 0.009, 0.009, 0.006, sphLo);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const pet = ball(g, petalMat, V(Math.cos(a) * 0.016, Math.sin(a) * 0.016, 0), 0.005, 0.0135, 0.0025, sphLo);
      pet.rotation.z = a - Math.PI / 2;
    }
  }

  const cN = nA.clone().addScaledVector(nD, 0.3);
  const ax = V(1, 0, 0);
  const vf = V(0, -nD.z, nD.y).normalize(); // down-forward around neck
  const R = 0.12;
  const loopPt = (phi: number) => {
    const sinp = Math.sin(phi);
    const sag = Math.pow((1 + sinp) / 2, 2);
    return cN.clone()
      .addScaledVector(ax, Math.cos(phi) * R)
      .addScaledVector(vf, sinp * R)
      .add(V(0, -0.06 * sag, -0.02 * sag));
  };
  const loop: THREE.Vector3[] = [];
  for (let i = 0; i < 36; i++) loop.push(loopPt((i / 36) * Math.PI * 2));
  root.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop, true), 90, 0.0038, 4, true), stemMat));

  const nDaisy = 14;
  for (let i = 0; i < nDaisy; i++) {
    const phi = (i / nDaisy) * Math.PI * 2 + 0.11;
    if (Math.sin(phi) < -0.55) continue; // hidden under the mane
    const p = loopPt(phi);
    const n = new THREE.Vector3().addScaledVector(ax, Math.cos(phi)).addScaledVector(vf, Math.sin(phi))
      .add(V(0, 0.25, 0)).normalize();
    daisy(p.addScaledVector(n, 0.004), n, 0.9 + rand() * 0.25);
    // little leaf between daisies
    const phiL = phi + Math.PI / nDaisy;
    const lp = loopPt(phiL);
    const tan = loopPt(phiL + 0.05).sub(loopPt(phiL - 0.05)).normalize();
    const leaf = ball(root, stemMat, lp, 0.007, 0.0025, 0.017, sphLo);
    leaf.quaternion.setFromUnitVectors(FWD, tan);
    leaf.rotateZ(Math.cos(phiL) * 0.8);
  }
  // dangling pendant of daisies resting on the chest
  const front = loopPt(Math.PI / 2);
  const drop = [front, V(0, 0.765, 0.388), V(0, 0.722, 0.372)];
  root.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(drop), 12, 0.0035, 4, false), stemMat));
  daisy(V(0, 0.765, 0.392), V(0, -0.15, 1), 1.0);
  daisy(V(0, 0.72, 0.378), V(0, -0.25, 1), 1.15);

  return root;
}
