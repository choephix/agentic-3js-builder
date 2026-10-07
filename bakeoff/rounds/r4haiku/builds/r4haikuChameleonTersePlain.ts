import * as THREE from "three";

export const meta = {
  name: "Chameleon",
  description:
    "A stylised chameleon with a banded green body, tall casque, gold turret eyes, an orange dorsal crest and a curled prehensile tail, gripping a twig on a fallen branch.",
};

type P3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Seeded PRNG (mulberry32) so every build is identical. */
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Skin: transverse bands and scattered spots, drawn on a canvas (browser only). */
function skinTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const W = 256;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  if (!g) return null;
  const rand = makeRng(11);

  g.fillStyle = "#3bb35b";
  g.fillRect(0, 0, W, H);

  // Rows wrap around the body, so texture v runs nose -> tail.
  const bars = 6;
  for (let i = 0; i < bars; i++) {
    const y = ((i + 0.5) / bars) * H;
    g.fillStyle = i % 2 === 0 ? "#e6d84a" : "#1f8f86";
    g.fillRect(0, y - 15, W, 30);
  }

  const spots = ["#e6d84a", "#1f8f86", "#2f6fd1", "#a6e35a"];
  for (let i = 0; i < 320; i++) {
    g.fillStyle = spots[Math.floor(rand() * spots.length)];
    g.beginPath();
    g.arc(rand() * W, rand() * H, 1 + rand() * 3, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Bark: longitudinal streaks, drawn on a canvas (browser only). */
function barkTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const W = 128;
  const H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  if (!g) return null;
  const rand = makeRng(5);

  g.fillStyle = "#6e4a2c";
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    g.strokeStyle = rand() < 0.5 ? "#3f2a18" : "#8f6640";
    g.lineWidth = 1 + rand() * 2.5;
    const x = rand() * W;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + (rand() - 0.5) * 10, H);
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 3);
  return tex;
}

/** Ellipsoid. With poleZ the poles run along Z, so texture bands wrap the body. */
function ellipsoid(
  mat: THREE.Material,
  r: P3,
  p: THREE.Vector3,
  seg: number,
  poleZ = false
): THREE.Mesh {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.75)));
  if (poleZ) g.rotateX(Math.PI / 2);
  g.scale(r[0], r[1], r[2]);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(p);
  return m;
}

function ball(mat: THREE.Material, r: number, p: THREE.Vector3, seg = 10): THREE.Mesh {
  return ellipsoid(mat, [r, r, r], p, seg);
}

/** Tapered cylinder from a (radius ra) to b (radius rb). */
function bone(
  mat: THREE.Material,
  a: THREE.Vector3,
  b: THREE.Vector3,
  ra: number,
  rb: number,
  seg = 8
): THREE.Mesh {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), mat);
  mesh.position.addVectors(a, b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  return mesh;
}

export default function createChameleon(): THREE.Object3D {
  const rand = makeRng(2024);
  const root = new THREE.Group();
  root.name = "chameleon";

  const skinTex = skinTexture();
  const barkTex = barkTexture();

  const M = {
    skin: new THREE.MeshStandardMaterial({
      map: skinTex,
      color: skinTex ? 0xffffff : 0x3bb35b,
      roughness: 0.5,
    }),
    limb: new THREE.MeshStandardMaterial({ color: 0x2a8f6b, roughness: 0.5 }),
    toe: new THREE.MeshStandardMaterial({ color: 0x23402f, roughness: 0.6 }),
    crest: new THREE.MeshStandardMaterial({ color: 0xf29a2e, roughness: 0.45 }),
    throat: new THREE.MeshStandardMaterial({ color: 0xff4f8b, roughness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xf4c430, roughness: 0.25 }),
    rim: new THREE.MeshStandardMaterial({ color: 0xe0432c, roughness: 0.4 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.3 }),
    tailA: new THREE.MeshStandardMaterial({ color: 0x3fbf5f, roughness: 0.5 }),
    tailB: new THREE.MeshStandardMaterial({ color: 0xe6d84a, roughness: 0.5 }),
    bark: new THREE.MeshStandardMaterial({
      map: barkTex,
      color: barkTex ? 0xffffff : 0x6e4a2c,
      roughness: 0.9,
    }),
    knot: new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.9 }),
    leafA: new THREE.MeshStandardMaterial({ color: 0x6cc04a, roughness: 0.6 }),
    leafB: new THREE.MeshStandardMaterial({ color: 0x4fa83a, roughness: 0.6 }),
  };

  // ---- fallen branch lying on the floor (lowest point at y = 0) ----
  const BR_R = 0.03;
  const branchGeo = new THREE.CylinderGeometry(BR_R, BR_R, 0.66, 14, 1);
  branchGeo.rotateX(Math.PI / 2); // axis now runs along Z
  const branch = new THREE.Mesh(branchGeo, M.bark);
  branch.position.set(0, BR_R, 0);
  root.add(branch);

  for (const [x, y, z, r] of [
    [0.03, 0.02, -0.2, 0.011],
    [-0.027, 0.036, 0.25, 0.013],
    [-0.012, 0.058, -0.29, 0.01],
  ] as const) {
    root.add(ellipsoid(M.knot, [r, r * 0.8, r * 1.3], v3(x, y, z), 8));
  }

  // side twig with a few leaves
  root.add(bone(M.bark, v3(0.02, 0.05, -0.2), v3(0.085, 0.165, -0.25), 0.0065, 0.0028, 6));
  const leaves: [number, number, number, THREE.Material][] = [
    [0.105, 0.178, -0.25, M.leafA],
    [0.068, 0.192, -0.276, M.leafB],
    [0.13, 0.15, -0.262, M.leafB],
  ];
  for (const [x, y, z, m] of leaves) {
    const leaf = ellipsoid(m, [0.04, 0.0035, 0.017], v3(x, y, z), 8);
    leaf.rotation.set((rand() - 0.5) * 0.5, rand() * Math.PI * 2, (rand() - 0.5) * 0.6);
    root.add(leaf);
  }

  // ---- body, head, casque, snout ----
  root.add(ellipsoid(M.skin, [0.04, 0.064, 0.095], v3(0, 0.135, 0.02), 28, true));
  root.add(ellipsoid(M.skin, [0.034, 0.042, 0.052], v3(0, 0.158, 0.13), 22, true));
  root.add(ellipsoid(M.skin, [0.027, 0.03, 0.04], v3(0, 0.15, 0.18), 16, true));

  const casque = ellipsoid(M.skin, [0.024, 0.042, 0.046], v3(0, 0.2, 0.108), 18, true);
  casque.rotation.x = -0.4; // leans back
  root.add(casque);

  // throat sac under the chin
  root.add(ellipsoid(M.throat, [0.022, 0.026, 0.024], v3(0, 0.118, 0.16), 14));

  // small rostral spike
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.0065, 0.024, 8), M.crest);
  spike.rotation.x = Math.PI / 2; // apex toward +Z
  spike.position.set(0, 0.162, 0.212);
  root.add(spike);

  // turret eyes: gold ball, red eyelid ring, dark pupil
  for (const s of [-1, 1]) {
    root.add(ball(M.gold, 0.019, v3(s * 0.036, 0.168, 0.135), 12));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.0185, 0.0045, 8, 20), M.rim);
    rim.rotation.y = Math.PI / 2;
    rim.position.set(s * 0.043, 0.168, 0.135);
    root.add(rim);
    root.add(ball(M.pupil, 0.0085, v3(s * 0.05, 0.168, 0.137), 8));
  }

  // ---- legs: hip -> knee -> ankle -> zygodactyl foot clasping the branch ----
  const addFoot = (F: THREE.Vector3) => {
    root.add(ellipsoid(M.limb, [0.0085, 0.0065, 0.0125], F, 10));
    // toes fan from the pad down onto the branch surface
    const dir = v3(F.x, F.y - BR_R, 0).normalize();
    const k = BR_R + 0.002;
    for (const dz of [-0.0065, -0.0022, 0.0022, 0.0065]) {
      const a = v3(F.x, F.y, F.z + dz);
      const b = v3(dir.x * k, BR_R + dir.y * k, F.z + dz);
      root.add(bone(M.toe, a, b, 0.0028, 0.0018, 6));
    }
  };

  const legs: { hip: P3; knee: P3; ankle: P3; foot: P3 }[] = [
    {
      hip: [0.03, 0.14, 0.06],
      knee: [0.068, 0.11, 0.07],
      ankle: [0.03, 0.085, 0.088],
      foot: [0.02, 0.07, 0.092],
    },
    {
      hip: [0.03, 0.135, -0.05],
      knee: [0.07, 0.1, -0.03],
      ankle: [0.03, 0.082, -0.035],
      foot: [0.02, 0.07, -0.032],
    },
  ];
  for (const L of legs) {
    for (const s of [-1, 1]) {
      const at = (p: P3) => v3(s * p[0], p[1], p[2]);
      const knee = at(L.knee);
      const ankle = at(L.ankle);
      root.add(bone(M.limb, at(L.hip), knee, 0.011, 0.0088));
      root.add(bone(M.limb, knee, ankle, 0.0088, 0.0066));
      root.add(ball(M.limb, 0.0095, knee));
      root.add(ball(M.limb, 0.0068, ankle));
      addFoot(at(L.foot));
    }
  }

  // ---- prehensile tail: tapering curl behind the body ----
  const TC = v3(0, 0.128, -0.115);
  const SEG = 30;
  const tp: THREE.Vector3[] = [];
  const tr: number[] = [];
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG;
    const th = t * Math.PI * 1.7;
    const r = 0.042 - 0.02 * t;
    tp.push(v3(0, TC.y + r * Math.sin(th), TC.z + r * Math.cos(th)));
    tr.push(0.02 - 0.0135 * t);
  }
  for (let i = 0; i < SEG; i++) {
    const m = Math.floor(i / 3) % 2 === 0 ? M.tailA : M.tailB;
    root.add(bone(m, tp[i], tp[i + 1], tr[i], tr[i + 1], 8));
  }
  root.add(ball(M.tailA, tr[SEG], tp[SEG], 6));

  // ---- dorsal crest: tapering spikes down the back, tallest mid-body ----
  const SPINES = 10;
  for (let i = 0; i < SPINES; i++) {
    const z = 0.07 - i * 0.015;
    const u = (z - 0.02) / 0.095;
    const yTop = 0.135 + 0.064 * Math.sqrt(Math.max(0, 1 - u * u));
    const h = 0.012 + 0.013 * Math.sin((Math.PI * (i + 0.5)) / SPINES);
    const spine = new THREE.Mesh(new THREE.ConeGeometry(0.0075, h, 6), M.crest);
    spine.position.set(0, yTop + h * 0.4 - 0.002, z);
    spine.rotation.x = -0.3; // sweeps backward
    root.add(spine);
  }

  return root;
}
