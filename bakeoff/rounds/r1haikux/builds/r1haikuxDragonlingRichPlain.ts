import * as THREE from "three";

export const meta = {
  name: "Teal Hatchling",
  description:
    "A proud baby dragon with teal scales, a buttery belly, soft orange back spines, oversized amber-membrane wings it cannot fly with yet, a toothy grin and a smoke wisp, sitting beside its speckled, half-broken egg.",
};

type P3 = [number, number, number];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const FWD = V(0, 0, 1);

const EGG_R = 0.105; // egg half-width (m)
const EGG_H = 0.26; // egg height (m)

/** Egg profile. phi = polar angle from the top pole (0) to the bottom pole (PI). */
function eggPoint(phi: number) {
  return {
    r: EGG_R * Math.sin(phi) * (1 - 0.14 * Math.cos(phi)),
    y: (EGG_H / 2) * Math.cos(phi),
  };
}

/** Seeded PRNG (mulberry32): every build is identical. */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function babyDragon(): THREE.Object3D {
  const rand = makeRng(7319);
  const root = new THREE.Group();
  root.name = "teal-hatchling";

  // ---------- materials: one per colour, shared ----------
  const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  const M = {
    teal: std(0x2fa596),
    tealDark: std(0x1b6e66),
    belly: std(0xf2d687),
    spine: std(0xf59a45, { roughness: 0.5 }),
    bone: std(0xfff4df, { roughness: 0.4 }),
    eye: std(0xffa720, { roughness: 0.2, emissive: 0x3a1c00, emissiveIntensity: 0.6 }),
    pupil: std(0x140b05, { roughness: 0.3 }),
    cheek: std(0xf29c82),
    mouth: std(0x6b2233),
    tongue: std(0xe0707a),
    nostril: std(0x2a1812),
    membrane: std(0xffb35c, {
      roughness: 0.35,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
      emissive: 0x2a1200,
      emissiveIntensity: 0.35,
    }),
    smoke: std(0xe9edf0, { roughness: 1, transparent: true, opacity: 0.5, depthWrite: false }),
    shell: std(0xf1e4c8, { roughness: 0.5, side: THREE.DoubleSide }),
    speckle: std(0x7a4e2e),
  };

  // ---------- helpers ----------
  const blob = (
    parent: THREE.Object3D,
    c: P3,
    r: P3,
    m: THREE.Material,
    seg = 14,
    rot?: P3,
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.7))),
      m,
    );
    mesh.position.set(c[0], c[1], c[2]);
    mesh.scale.set(r[0], r[1], r[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(mesh);
    return mesh;
  };

  const ball = (parent: THREE.Object3D, c: THREE.Vector3, r: number, m: THREE.Material, seg = 10) =>
    blob(parent, [c.x, c.y, c.z], [r, r, r], m, seg);

  // tapered cylinder from a (radius ra) to b (radius rb)
  const tube = (
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    m: THREE.Material,
    seg = 10,
  ) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), m);
    mesh.position.copy(a).addScaledVector(d, 0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(mesh);
    return mesh;
  };

  // pointed spine / claw / tooth
  const spike = (
    parent: THREE.Object3D,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r: number,
    m: THREE.Material,
  ) => {
    const dn = dir.clone().normalize();
    const tip = base.clone().addScaledVector(dn, len);
    return tube(parent, base, tip, r, r * 0.1, m, 7);
  };

  // spine sitting on a sagittal ellipse (x = 0) of centre (cy, cz) and radii (ry, rz)
  const ridge = (
    parent: THREE.Object3D,
    cy: number,
    cz: number,
    ry: number,
    rz: number,
    th: number,
    len: number,
    rad: number,
    m: THREE.Material,
  ) => {
    const base = V(0, cy + ry * Math.cos(th) * 0.95, cz - rz * Math.sin(th) * 0.95);
    const n = V(0, Math.cos(th) / ry, -Math.sin(th) / rz).normalize();
    const dir = n.add(V(0, 0.35, 0)).normalize();
    spike(parent, base, dir, len, rad, m);
  };

  // Egg shell piece: lathe-like grid from a pole down to a jagged rim.
  const shellGeo = (pole: number, rim: number[], segV: number) => {
    const segU = rim.length;
    const rows = segV + 1;
    const pos: number[] = [];
    for (let j = 0; j < segU; j++) {
      const th = (j / segU) * Math.PI * 2;
      for (let i = 0; i <= segV; i++) {
        const phi = pole + (rim[j] - pole) * (i / segV);
        const { r, y } = eggPoint(phi);
        pos.push(r * Math.cos(th), y, r * Math.sin(th));
      }
    }
    const id = (j: number, i: number) => (j % segU) * rows + i;
    const build = (index: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(index);
      g.computeVertexNormals();
      return g;
    };
    const index: number[] = [];
    for (let j = 0; j < segU; j++) {
      for (let i = 0; i < segV; i++) {
        const a = id(j, i);
        const b = id(j + 1, i);
        const c = id(j + 1, i + 1);
        const d = id(j, i + 1);
        index.push(a, d, b, b, d, c);
      }
    }
    let g = build(index);
    // make sure normals face outward (winding depends on which pole we start from)
    const Pa = g.attributes.position as THREE.BufferAttribute;
    const Na = g.attributes.normal as THREE.BufferAttribute;
    let dot = 0;
    for (let k = 0; k < Pa.count; k++) {
      dot += Pa.getX(k) * Na.getX(k) + Pa.getY(k) * Na.getY(k) + Pa.getZ(k) * Na.getZ(k);
    }
    if (dot < 0) {
      const flipped: number[] = [];
      for (let k = 0; k < index.length; k += 3) flipped.push(index[k], index[k + 2], index[k + 1]);
      g = build(flipped);
    }
    return g;
  };

  const speckleGeo = new THREE.SphereGeometry(1, 6, 4);
  const addSpeckles = (
    parent: THREE.Object3D,
    count: number,
    cosMin: number,
    cosMax: number,
    sMin: number,
    sMax: number,
  ) => {
    for (let k = 0; k < count; k++) {
      const phi = Math.acos(cosMin + rand() * (cosMax - cosMin));
      const th = rand() * Math.PI * 2;
      const { r, y } = eggPoint(phi);
      const x = r * Math.cos(th);
      const z = r * Math.sin(th);
      const n = V(x / (EGG_R * EGG_R), y / ((EGG_H / 2) ** 2), z / (EGG_R * EGG_R)).normalize();
      const s = sMin + rand() * (sMax - sMin);
      const m = new THREE.Mesh(speckleGeo, M.speckle);
      m.position.set(x, y, z).addScaledVector(n, s * 0.25);
      m.scale.set(s, s, s * 0.4);
      m.quaternion.setFromUnitVectors(FWD, n);
      parent.add(m);
    }
  };

  // =========================================================
  // DRAGON (modelled at design scale, then scaled to cat size)
  // =========================================================
  const D = new THREE.Group();
  D.name = "dragon";
  D.scale.setScalar(0.72);
  root.add(D);

  // torso, hips and buttery belly
  blob(D, [0, 0.18, 0], [0.165, 0.19, 0.155], M.teal, 20);
  blob(D, [0, 0.1, 0.02], [0.155, 0.1, 0.14], M.teal, 20);
  blob(D, [0, 0.19, 0.085], [0.11, 0.15, 0.08], M.belly, 18);
  blob(D, [0, 0.1, 0.1], [0.1, 0.07, 0.07], M.belly, 16);

  // neck
  tube(D, V(0, 0.3, 0.05), V(0, 0.45, 0.1), 0.095, 0.078, M.teal, 14);
  ball(D, V(0, 0.31, 0.05), 0.1, M.teal, 14);

  // head
  blob(D, [0, 0.5, 0.12], [0.12, 0.11, 0.12], M.teal, 20); // cranium
  blob(D, [0, 0.49, 0.25], [0.07, 0.05, 0.1], M.teal, 18); // snout
  blob(D, [0, 0.4, 0.2], [0.065, 0.03, 0.1], M.belly, 16); // lower jaw
  blob(D, [0, 0.43, 0.235], [0.058, 0.02, 0.085], M.mouth, 12); // open grin
  blob(D, [0, 0.415, 0.27], [0.03, 0.01, 0.04], M.tongue, 10); // tongue

  // toothy grin: upper teeth hang from the lip, lower teeth point up
  for (let k = 0; k < 8; k++) {
    const psi = -1.3 + (k / 7) * 2.6;
    const cA = Math.cos(-0.9);
    const sA = Math.sin(-0.9);
    const base = V(
      0.07 * cA * Math.sin(psi) * 0.98,
      0.49 + 0.05 * sA,
      0.25 + 0.1 * cA * Math.cos(psi) * 0.98,
    );
    const len = 0.02 - 0.006 * (psi / 1.3) ** 2;
    spike(D, base, V(0, -1, 0.15), len, 0.0085, M.bone);
  }
  for (let k = 0; k < 7; k++) {
    const psi = -1.1 + (k / 6) * 2.2;
    const cA = Math.cos(0.8);
    const sA = Math.sin(0.8);
    const base = V(
      0.065 * cA * Math.sin(psi) * 0.98,
      0.4 + 0.03 * sA - 0.002,
      0.2 + 0.1 * cA * Math.cos(psi) * 0.98,
    );
    spike(D, base, V(0, 1, 0.1), 0.016, 0.0075, M.bone);
  }

  // eyes, brows, horns, nostrils, cheeks
  for (const s of [-1, 1]) {
    const ex = s * 0.078;
    const ey = 0.55;
    const ez = 0.19;
    blob(D, [ex, ey, ez], [0.044, 0.044, 0.044], M.eye, 16); // big amber eye
    blob(D, [ex, ey, ez + 0.042], [0.012, 0.026, 0.008], M.pupil, 8); // slit pupil
    blob(D, [ex + 0.014, ey + 0.016, ez + 0.04], [0.01, 0.01, 0.01], M.bone, 8); // glint
    blob(D, [s * 0.078, 0.6, 0.18], [0.05, 0.014, 0.032], M.tealDark, 12, [0, 0, s * 0.25]); // proud brow
    blob(D, [s * 0.03, 0.5, 0.336], [0.008, 0.006, 0.008], M.nostril, 8);
    blob(D, [s * 0.08, 0.47, 0.21], [0.032, 0.024, 0.032], M.cheek, 12);
    tube(D, V(s * 0.065, 0.585, 0.085), V(s * 0.088, 0.66, 0.035), 0.025, 0.006, M.bone, 10); // stubby horn
  }

  // head crest and neck spines
  for (const th of [0.5, 0.95, 1.4]) ridge(D, 0.5, 0.12, 0.11, 0.12, th, 0.034, 0.011, M.spine);
  for (const t of [0.25, 0.55, 0.85]) {
    const base = V(0, 0.3 + 0.15 * t, 0.05 + 0.05 * t - 0.075);
    spike(D, base, V(0, 0.5, -0.8), 0.04, 0.012, M.spine);
  }

  // row of soft orange spines down the back
  [0.3, 0.6, 0.9, 1.2, 1.5, 1.8].forEach((th, i) =>
    ridge(D, 0.18, 0, 0.19, 0.155, th, 0.05 - i * 0.0045, 0.0165 - i * 0.0013, M.spine),
  );

  // front arms with paws resting near the knees
  for (const s of [-1, 1]) {
    const sh = V(s * 0.12, 0.27, 0.03);
    const el = V(s * 0.15, 0.19, 0.09);
    const wr = V(s * 0.12, 0.13, 0.17);
    ball(D, sh, 0.04, M.teal);
    tube(D, sh, el, 0.04, 0.032, M.teal, 12);
    ball(D, el, 0.033, M.teal);
    tube(D, el, wr, 0.032, 0.026, M.teal, 12);
    blob(D, [s * 0.118, 0.115, 0.2], [0.036, 0.026, 0.042], M.belly, 12);
    for (const dx of [-0.013, 0, 0.013]) {
      spike(D, V(s * 0.118 + dx, 0.11, 0.232), V(0, -0.2, 1), 0.018, 0.0065, M.bone);
    }
  }

  // sitting hind legs: chubby thigh, folded shin, flat foot
  for (const s of [-1, 1]) {
    blob(D, [s * 0.125, 0.09, 0.07], [0.08, 0.075, 0.1], M.teal, 18);
    const knee = V(s * 0.125, 0.075, 0.175);
    const ankle = V(s * 0.12, 0.034, 0.225);
    tube(D, knee, ankle, 0.046, 0.036, M.teal, 12);
    ball(D, ankle, 0.036, M.teal);
    blob(D, [s * 0.12, 0.03, 0.262], [0.05, 0.026, 0.07], M.teal, 14);
    for (const dx of [-0.02, 0, 0.02]) {
      ball(D, V(s * 0.12 + dx, 0.022, 0.32), 0.015, M.tealDark, 8);
      spike(D, V(s * 0.12 + dx, 0.02, 0.33), V(0, -0.1, 1), 0.016, 0.005, M.bone);
    }
  }

  // oversized wings, half-open, amber membrane between the fingers
  for (const s of [-1, 1]) {
    const wp = (x: number, y: number) => V(s * x, y, -0.03);
    const sh = wp(0.1, 0.3);
    const el = wp(0.25, 0.42);
    const wr = wp(0.4, 0.37);
    const f1 = wp(0.56, 0.25);
    const f2 = wp(0.5, 0.1);
    const f3 = wp(0.37, 0.05);
    const flank = wp(0.14, 0.26);
    const hip = wp(0.13, 0.15);

    const shape = new THREE.Shape();
    shape.moveTo(hip.x, hip.y);
    shape.lineTo(flank.x, flank.y);
    shape.lineTo(sh.x, sh.y);
    shape.lineTo(el.x, el.y);
    shape.lineTo(wr.x, wr.y);
    shape.lineTo(f1.x, f1.y);
    const scallop = (a: THREE.Vector3, b: THREE.Vector3, k: number) => {
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      const c = mid.clone().addScaledVector(new THREE.Vector3().subVectors(wr, mid), k);
      shape.quadraticCurveTo(c.x, c.y, b.x, b.y);
    };
    scallop(f1, f2, 0.35);
    scallop(f2, f3, 0.35);
    scallop(f3, hip, 0.2);
    const membraneGeo = new THREE.ShapeGeometry(shape, 1);
    membraneGeo.translate(0, 0, -0.036);
    D.add(new THREE.Mesh(membraneGeo, M.membrane));

    // leading arm and fingers
    tube(D, sh, el, 0.028, 0.022, M.tealDark, 10);
    tube(D, el, wr, 0.022, 0.016, M.tealDark, 10);
    ball(D, sh, 0.034, M.teal);
    ball(D, el, 0.024, M.tealDark);
    ball(D, wr, 0.02, M.tealDark);
    for (const f of [f1, f2, f3]) {
      tube(D, wr, f, 0.012, 0.005, M.tealDark, 8);
      spike(D, f, f.clone().sub(wr), 0.03, 0.007, M.bone);
    }
    spike(D, wr, V(s * 0.3, 1, 0.45), 0.035, 0.009, M.bone); // thumb claw
  }

  // chubby tail curling out to the dragon's right
  const tail = new THREE.CatmullRomCurve3([
    V(0, 0.12, -0.1),
    V(-0.03, 0.1, -0.2),
    V(-0.1, 0.07, -0.29),
    V(-0.19, 0.045, -0.335),
    V(-0.28, 0.035, -0.31),
    V(-0.34, 0.03, -0.24),
  ]);
  const TN = 7;
  const tailR = (t: number) => THREE.MathUtils.lerp(0.072, 0.024, Math.pow(t, 0.8));
  for (let i = 0; i < TN; i++) {
    const t = i / (TN - 1);
    const p = tail.getPointAt(t);
    const r = tailR(t);
    blob(D, [p.x, p.y, p.z], [r, r * 0.92, r], M.teal, 14);
  }
  for (let i = 1; i <= 5; i++) {
    const t = i / 6;
    const p = tail.getPointAt(t);
    const tg = tail.getTangentAt(t);
    const dir = UP.clone().multiplyScalar(0.9).addScaledVector(tg, -0.35);
    spike(D, V(p.x, p.y + tailR(t) * 0.7, p.z), dir, 0.03 * (1 - t * 0.5), 0.011, M.spine);
  }

  // spade at the tail tip (flat blade standing in the tail's vertical plane)
  const spadeShape = new THREE.Shape();
  spadeShape.moveTo(0, 0.05);
  spadeShape.quadraticCurveTo(0.02, 0.02, 0.03, 0.0);
  spadeShape.quadraticCurveTo(0.03, -0.03, 0.01, -0.03);
  spadeShape.quadraticCurveTo(0.0, -0.02, 0, -0.012);
  spadeShape.quadraticCurveTo(0.0, -0.02, -0.01, -0.03);
  spadeShape.quadraticCurveTo(-0.03, -0.03, -0.03, 0.0);
  spadeShape.quadraticCurveTo(-0.02, 0.02, 0, 0.05);
  const spadeGeo = new THREE.ExtrudeGeometry(spadeShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
    curveSegments: 6,
  });
  spadeGeo.translate(0, 0, -0.004);
  const spade = new THREE.Mesh(spadeGeo, M.spine);
  {
    const tEnd = tail.getTangentAt(1).normalize();
    const pEnd = tail.getPointAt(1);
    const Yp = tEnd.clone().addScaledVector(UP, -tEnd.dot(UP)).normalize();
    const Xp = UP.clone();
    const Zp = new THREE.Vector3().crossVectors(Xp, Yp);
    const bm = new THREE.Matrix4().makeBasis(Xp, Yp, Zp);
    bm.setPosition(pEnd.clone().addScaledVector(Yp, 0.02));
    spade.applyMatrix4(bm);
  }
  D.add(spade);

  // smoke wisp curling out of the left nostril (+X side)
  for (let k = 1; k <= 7; k++) {
    const x = 0.03 + 0.014 * k + 0.01 * Math.sin(k * 1.2);
    const y = 0.5 + 0.024 * k;
    const z = 0.345 + 0.01 * k - 0.0012 * k * k;
    const r = 0.006 + 0.0022 * k;
    blob(D, [x, y, z], [r, r * 0.9, r], M.smoke, 8);
  }

  // =========================================================
  // EGG: the bottom half still standing, the top cracked off
  // =========================================================
  const egg = new THREE.Group();
  egg.name = "egg";
  egg.position.set(0.3, EGG_H / 2, 0.2);
  root.add(egg);

  const bottomRim = Array.from({ length: 48 }, () => 1.2 + (rand() - 0.5) * 0.36);
  egg.add(new THREE.Mesh(shellGeo(Math.PI, bottomRim, 20), M.shell));
  addSpeckles(egg, 110, -0.95, 0.15, 0.0035, 0.0075);

  // broken top piece, tipped on its side beside the bottom half
  const cap = new THREE.Group();
  cap.name = "shell-cap";
  const capRim = Array.from({ length: 36 }, () => 1.05 + (rand() - 0.5) * 0.3);
  cap.add(new THREE.Mesh(shellGeo(0, capRim, 14), M.shell));
  addSpeckles(cap, 45, 0.72, 0.995, 0.0035, 0.007);
  cap.position.set(0.16, 0, 0.42);
  cap.rotation.set(0, 0.6, -1.35);
  root.add(cap);

  // a couple of shell chips on the floor
  const chipAt = (x: number, z: number) => {
    const shape = new THREE.Shape();
    const n = 5;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rand() * 0.4;
      const rr = 0.012 + rand() * 0.012;
      if (k === 0) shape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else shape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    shape.closePath();
    const g = new THREE.ShapeGeometry(shape, 1);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, M.shell);
    m.position.set(x, 0.002, z);
    m.rotation.y = rand() * Math.PI * 2;
    root.add(m);
  };
  chipAt(0.44, 0.3);
  chipAt(0.3, 0.4);

  // ---------- settle on the floor and centre on x = 0 ----------
  root.updateMatrixWorld(true);
  const capBox = new THREE.Box3().setFromObject(cap, true);
  cap.position.y -= capBox.min.y;

  root.updateMatrixWorld(true);
  const dragonBox = new THREE.Box3().setFromObject(D, true);
  D.position.y -= dragonBox.min.y;

  root.updateMatrixWorld(true);
  const all = new THREE.Box3().setFromObject(root, true);
  const centre = all.getCenter(new THREE.Vector3());
  root.position.set(-centre.x, -all.min.y, 0);
  root.updateMatrixWorld(true);

  return root;
}
