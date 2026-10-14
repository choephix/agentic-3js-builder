import * as THREE from "three";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo: a dusty pink-tan shell of nine movable bands between a scapular and a pelvic shield, a pointed snout, tall leathery ears, clawed feet, a tapering banded tail and pale coarse hairs poking out between the bands.",
};

const Y_AXIS = new THREE.Vector3(0, 1, 0);

// ---------- seeded randomness ----------
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- shared helpers ----------
function ellipsoid(rx: number, ry: number, rz: number, w = 12, h = 8): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

// ---------- shell parameters (metres) ----------
const SH = { L: 0.23, W: 0.12, H: 0.08, yc: 0.08, p: 0.75 }; // half length, half width, height, centre height, boxiness
const NB = 9; // movable bands
const GAP = 0.0025; // gap between plates
const B0 = 0.1; // z of the first band boundary (front)
const BN = -0.08; // z of the last band boundary (rear)
const PITCH = (B0 - BN) / NB;
const boundary = (k: number) => B0 - k * PITCH;
const T0 = -0.25; // cross-section angles, from one lower skirt over the top to the other
const T1 = Math.PI + 0.25;

const profile = (z: number) => Math.pow(Math.max(0, 1 - (z / SH.L) ** 2), 0.25);
const sp = (v: number, p: number) => Math.sign(v) * Math.pow(Math.abs(v), p);

function surf(z: number, t: number, k = 1): THREE.Vector3 {
  const f = profile(z) * k;
  return new THREE.Vector3(
    SH.W * f * sp(Math.cos(t), SH.p),
    SH.yc + SH.H * f * sp(Math.sin(t), SH.p),
    z,
  );
}

function surfNormal(z: number, t: number): THREE.Vector3 {
  const e = 1e-3;
  const p = surf(z, t);
  const dz = surf(z + e, t).sub(surf(z - e, t));
  const dt = surf(z, t + e).sub(surf(z, t - e));
  const n = new THREE.Vector3().crossVectors(dt, dz);
  if (n.dot(new THREE.Vector3(p.x, p.y - SH.yc, 0)) < 0) n.negate();
  return n.normalize();
}

// A patch of the shell between two z values (front z0 -> rear z1) and two cross-section angles.
function patch(
  z0: number,
  z1: number,
  t0: number,
  t1: number,
  bulge: number,
  k: number,
  nu: number,
  nv: number,
): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= nu; i++) {
    const u = i / nu;
    const z = z0 + (z1 - z0) * u;
    // each plate swells a little in its middle so the bands read as ridges
    const kk = k * (1 + bulge * Math.sin(Math.PI * u));
    for (let j = 0; j <= nv; j++) {
      const t = t0 + (t1 - t0) * (j / nv);
      const p = surf(z, t, kk);
      pos.push(p.x, p.y, p.z);
      uv.push(t * 1.1, z * 10);
    }
  }
  const row = nv + 1;
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = i * row + j;
      const b = (i + 1) * row + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------- canvas texture for the plates (speckle and pits) ----------
function makeShellTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const g = cv.getContext("2d");
  if (!g) return null;
  const r = makeRng(77);
  g.fillStyle = "#e6e6e6";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const v = Math.floor(150 + r() * 105);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(r() * 256, r() * 256, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  g.fillStyle = "rgba(70,58,58,0.3)";
  for (let i = 0; i < 260; i++) {
    g.beginPath();
    g.arc(r() * 256, r() * 256, 0.7 + r() * 1.5, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- the model ----------
export default function build(): THREE.Object3D {
  const rnd = makeRng(9);
  const plateMap = makeShellTexture();

  const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o });

  const M = {
    shield: std(0xd8ad98, { map: plateMap }),
    bandA: std(0xcb9e88, { map: plateMap }),
    bandB: std(0xb68873, { map: plateMap }),
    inner: std(0x6f4b47, { roughness: 0.9 }),
    belly: std(0xe9cdbd, { roughness: 0.85 }),
    leg: std(0xb78d7b, { roughness: 0.7 }),
    claw: std(0xf1e6d2, { roughness: 0.45 }),
    ear: std(0xa0695f, { roughness: 0.85 }),
    eye: std(0x120d0e, { roughness: 0.25 }),
    glint: std(0xffffff, { roughness: 0.2 }),
    nose: std(0x2d2123, { roughness: 0.6 }),
    hair: std(0xf4ecdd, { roughness: 0.95 }),
    tailA: std(0xc89f8a, { map: plateMap }),
    tailB: std(0xa37868, { map: plateMap }),
  };

  const at = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return m;
  };

  const root = new THREE.Group();

  // ---- shell ----
  const shell = new THREE.Group();
  root.add(shell);
  const ZF = SH.L * 0.97;
  const ZB = -SH.L * 0.97;

  // dark inner skin, visible through the gaps between plates
  shell.add(at(patch(SH.L * 0.99, -SH.L * 0.99, -0.32, Math.PI + 0.32, 0, 0.955, 14, 30), M.inner));

  // scapular (front) shield
  shell.add(at(patch(ZF, boundary(0) + GAP / 2, T0, T1, 0.035, 1, 10, 32), M.shield));

  // the nine movable bands, alternating two tones
  for (let k = 0; k < NB; k++) {
    const z0 = boundary(k) - GAP / 2;
    const z1 = boundary(k + 1) + GAP / 2;
    shell.add(at(patch(z0, z1, T0, T1, 0.09, 1, 6, 32), k % 2 ? M.bandB : M.bandA));
  }

  // pelvic (rear) shield
  shell.add(at(patch(boundary(NB) - GAP / 2, ZB, T0, T1, 0.035, 1, 10, 32), M.shield));

  // soft pale belly under the shell
  root.add(at(ellipsoid(0.1, 0.04, 0.22, 14, 10), M.belly, 0, 0.07, 0));

  // ---- coarse pale hairs poking out of the gaps between bands ----
  const hairG = new THREE.CylinderGeometry(0.0006, 0.0017, 1, 4, 1).translate(0, 0.5, 0);
  for (let k = 0; k <= NB; k++) {
    for (let h = 0; h < 6; h++) {
      const z = boundary(k) + (rnd() - 0.5) * 0.0015;
      const t = T0 + 0.35 + rnd() * (T1 - T0 - 0.7);
      const n = surfNormal(z, t);
      const base = surf(z, t).addScaledVector(n, -0.0015);
      const jitter = new THREE.Vector3(
        (rnd() - 0.5) * 0.4,
        (rnd() - 0.5) * 0.4,
        -0.45 + (rnd() - 0.5) * 0.3,
      );
      const dir = n.add(jitter).normalize();
      const hair = at(hairG, M.hair, base.x, base.y, base.z);
      hair.quaternion.setFromUnitVectors(Y_AXIS, dir);
      hair.scale.set(1, 0.018 + rnd() * 0.016, 1);
      shell.add(hair);
    }
  }

  // ---- head ----
  const head = new THREE.Group();
  head.position.set(0, 0.11, 0.24);
  head.rotation.x = 0.16; // nose a little down
  root.add(head);

  // domed head shield
  head.add(at(ellipsoid(0.058, 0.048, 0.072, 14, 10), M.shield));

  // pointed, flattened snout
  const snoutG = new THREE.CylinderGeometry(0.011, 0.044, 0.16, 7, 1, false);
  snoutG.rotateX(Math.PI / 2); // tip towards +Z
  snoutG.scale(1, 0.85, 1);
  snoutG.translate(0, -0.004, 0.115);
  head.add(at(snoutG, M.shield));

  // nose tip
  head.add(at(new THREE.SphereGeometry(0.0115, 8, 6), M.nose, 0, -0.007, 0.19));

  // beady eyes, tall leathery ears
  const eyeG = new THREE.SphereGeometry(0.0074, 8, 6);
  const glintG = new THREE.SphereGeometry(0.0022, 5, 4);
  const earG = ellipsoid(0.008, 0.042, 0.022, 8, 6);
  for (const sx of [1, -1]) {
    head.add(at(eyeG, M.eye, sx * 0.043, 0.017, 0.04));
    const g = new THREE.Vector3(sx * 0.5, 0.35, 0.5).normalize().multiplyScalar(0.0066);
    head.add(at(glintG, M.glint, sx * 0.043 + g.x, 0.017 + g.y, 0.04 + g.z));

    const ear = at(earG, M.ear, sx * 0.038, 0.052, -0.03);
    ear.rotation.set(-0.25, 0, -sx * 0.2); // lean back and outward
    head.add(ear);
  }

  // ---- legs (trot: one diagonal pair reaching forward, the other pushing back) ----
  const upperG = new THREE.CylinderGeometry(0.019, 0.015, 0.03, 7).translate(0, -0.015, 0);
  const lowerG = new THREE.CylinderGeometry(0.015, 0.012, 0.026, 7).translate(0, -0.013, 0);
  const footG = ellipsoid(0.022, 0.009, 0.033, 10, 7).translate(0, -0.004, 0.009);
  const clawG = new THREE.ConeGeometry(0.0032, 0.014, 5).rotateX(1.9); // tip forward and down
  const CLAWS = [-0.0185, -0.0062, 0.0062, 0.0185];

  const leg = (x: number, z: number, swing: number, knee: number): THREE.Group => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.065, z);
    hip.rotation.x = swing;
    hip.add(at(upperG, M.leg));

    const lower = new THREE.Group();
    lower.position.y = -0.03;
    lower.rotation.x = knee;
    lower.add(at(lowerG, M.leg));

    const ankle = new THREE.Group();
    ankle.position.y = -0.026;
    ankle.add(at(footG, M.leg));
    for (const cx of CLAWS) ankle.add(at(clawG, M.claw, cx, -0.0105, 0.034));
    lower.add(ankle);

    hip.add(lower);
    return hip;
  };

  root.add(leg(0.07, 0.11, -0.55, 0.3)); // front left, reaching
  root.add(leg(-0.07, -0.1, -0.5, 0.3)); // rear right, reaching
  root.add(leg(-0.07, 0.11, 0.15, -0.1)); // front right, pushing
  root.add(leg(0.07, -0.1, 0.15, -0.1)); // rear left, pushing

  // ---- long banded tail tapering to a point ----
  const tail = new THREE.Group();
  root.add(tail);
  const tailPt = (s: number) =>
    new THREE.Vector3(0, 0.095 - 0.06 * Math.pow(s, 1.5), -0.17 - 0.36 * s);
  const tailR = (s: number) => 0.032 * Math.pow(1 - s, 0.85) + 0.0016;
  const TN = 14;
  for (let k = 0; k < TN; k++) {
    const s0 = k / TN;
    const s1 = (k + 1) / TN;
    const p0 = tailPt(s0);
    const p1 = tailPt(s1);
    const d = p1.clone().sub(p0);
    const len = d.length();
    d.normalize();
    // each ring flares slightly at its base, like overlapping armour
    const g = new THREE.CylinderGeometry(tailR(s1) * 0.98, tailR(s0) * 1.12, len * 0.8, 8, 1, false);
    const m = new THREE.Mesh(g, k % 2 === 0 ? M.tailA : M.tailB);
    m.position.copy(p0).add(p1).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(Y_AXIS, d);
    tail.add(m);
  }

  // ---- stand on the floor ----
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root, true);
  root.position.y -= box.min.y;

  return root;
}
