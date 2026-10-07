```ts
import * as THREE from "three";

export const meta = {
  name: "Nine-Banded Armadillo",
  description:
    "A stylized low-poly nine-banded armadillo: shingled carapace bands with pale rims, tiled shoulder and hip shields, a ringed tapering tail, tall ears, a long pink snout and digging claws.",
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void, rx: number, ry: number) {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, ry);
  return tex;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = rng(1337);

  // ---------- textures ----------
  const shieldTex = makeCanvas(
    256,
    (c, s) => {
      c.fillStyle = "#5e4537";
      c.fillRect(0, 0, s, s);
      const cols = 4,
        rows = 2;
      const w = s / cols,
        h = s / rows;
      for (let r = 0; r < rows + 1; r++) {
        for (let k = -1; k < cols + 1; k++) {
          const cx = k * w + (r % 2 ? w / 2 : 0) + w / 2;
          const cy = r * h + h / 2 - (r === rows ? s : 0);
          c.fillStyle = "#8a6a57";
          c.beginPath();
          c.ellipse(cx, cy, w * 0.42, h * 0.42, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = "#a88a72";
          c.beginPath();
          c.ellipse(cx - w * 0.05, cy - h * 0.06, w * 0.26, h * 0.26, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = "#c2a58a";
          c.beginPath();
          c.ellipse(cx - w * 0.1, cy - h * 0.12, w * 0.09, h * 0.08, 0, 0, Math.PI * 2);
          c.fill();
        }
      }
    },
    8,
    1
  );
  const bandTex = makeCanvas(
    128,
    (c, s) => {
      c.fillStyle = "#4f392d";
      c.fillRect(0, 0, s, s);
      const cols = 2;
      const w = s / cols;
      for (let k = 0; k < cols; k++) {
        const x = k * w;
        c.fillStyle = "#7d5f4d";
        c.beginPath();
        c.moveTo(x + w * 0.1, s);
        c.lineTo(x + w * 0.9, s);
        c.lineTo(x + w * 0.75, 0);
        c.lineTo(x + w * 0.25, 0);
        c.closePath();
        c.fill();
        c.fillStyle = "#9b7b65";
        c.fillRect(x + w * 0.35, s * 0.15, w * 0.3, s * 0.7);
      }
    },
    14,
    1
  );

  // ---------- materials ----------
  const shieldMat = new THREE.MeshStandardMaterial({
    color: shieldTex ? 0xffffff : 0x8a6a57,
    map: shieldTex ?? undefined,
    roughness: 0.75,
    metalness: 0.05,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const bandMat = new THREE.MeshStandardMaterial({
    color: bandTex ? 0xffffff : 0x7d5f4d,
    map: bandTex ?? undefined,
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const bandMat2 = new THREE.MeshStandardMaterial({
    color: bandTex ? 0xe6d6c8 : 0x6e5242,
    map: bandTex ?? undefined,
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd9bf9b, roughness: 0.6, flatShading: true });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a99c, roughness: 0.85, flatShading: true });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0xb07a70, roughness: 0.85, flatShading: true });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x8e5a55, roughness: 0.5, flatShading: true });
  const clawMat = new THREE.MeshStandardMaterial({ color: 0x3b2e28, roughness: 0.4, flatShading: true });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x120d0b, roughness: 0.2 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, emissive: 0x333333 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xefe2cf, roughness: 0.9, flatShading: true });

  const add = (m: THREE.Object3D, parent: THREE.Object3D = root) => {
    parent.add(m);
    return m;
  };

  // shell segment along Z, arc centred on +Y
  function seg(z0: number, z1: number, r0: number, r1: number, arc: number, mat: THREE.Material, cy: number, radial = 16) {
    const g = new THREE.CylinderGeometry(r1, r0, z1 - z0, radial, 1, true, Math.PI - arc / 2, arc);
    g.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(g, mat);
    m.position.set(0, cy, (z0 + z1) / 2);
    return m;
  }
  function rim(z: number, r: number, tube: number, arc: number, mat: THREE.Material, cy: number) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 4, 18, arc), mat);
    m.rotation.z = Math.PI / 2 - arc / 2;
    m.position.set(0, cy, z);
    return m;
  }

  const CY = 0.15;
  const ARC = (240 * Math.PI) / 180;

  // ---------- body core ----------
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), skinMat);
  belly.scale.set(0.115, 0.075, 0.22);
  belly.position.set(0, 0.12, -0.02);
  add(belly);

  // ---------- pelvic shield ----------
  const pelvic: [number, number][] = [
    [-0.255, 0.05],
    [-0.235, 0.09],
    [-0.2, 0.118],
    [-0.155, 0.132],
    [-0.1, 0.139],
  ];
  for (let i = 0; i < pelvic.length - 1; i++) {
    add(seg(pelvic[i][0], pelvic[i + 1][0], pelvic[i][1], pelvic[i + 1][1], ARC, shieldMat, CY));
  }
  const rearCap = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 6), shieldMat);
  rearCap.scale.set(1, 1, 0.45);
  rearCap.position.set(0, CY, -0.252);
  add(rearCap);
  add(rim(-0.1, 0.14, 0.004, ARC, rimMat, CY));

  // ---------- nine bands ----------
  const nb = 9;
  const bz0 = -0.1,
    bz1 = 0.062;
  const bw = (bz1 - bz0) / nb;
  for (let i = 0; i < nb; i++) {
    const z0 = bz0 + i * bw;
    const z1 = z0 + bw + 0.002;
    const bulge = 0.003 * Math.sin((i / (nb - 1)) * Math.PI);
    add(seg(z0, z1, 0.145 + bulge, 0.136 + bulge, ARC - 0.08, i % 2 ? bandMat2 : bandMat, CY));
    add(rim(z0 + 0.001, 0.146 + bulge, 0.0028, ARC - 0.08, rimMat, CY));
    // little bristles poking from under band edges
    for (const sx of [-1, 1]) {
      if (rand() < 0.75) {
        const h = new THREE.Mesh(new THREE.ConeGeometry(0.0018, 0.035 + rand() * 0.02, 3), hairMat);
        const ang = ARC / 2 - 0.08;
        h.position.set(sx * Math.sin(ang) * 0.14, CY + Math.cos(ang) * 0.14 - 0.012, z0 + bw / 2);
        h.rotation.z = sx * (Math.PI - 0.35 - rand() * 0.2);
        h.rotation.x = (rand() - 0.5) * 0.4;
        add(h);
      }
    }
  }

  // ---------- shoulder shield ----------
  const shoulder: [number, number][] = [
    [0.06, 0.141],
    [0.1, 0.137],
    [0.15, 0.123],
    [0.19, 0.099],
    [0.215, 0.066],
  ];
  for (let i = 0; i < shoulder.length - 1; i++) {
    add(seg(shoulder[i][0], shoulder[i + 1][0], shoulder[i][1], shoulder[i + 1][1], ARC, shieldMat, CY));
  }
  add(rim(0.062, 0.143, 0.004, ARC, rimMat, CY));
  add(rim(0.214, 0.067, 0.004, ARC, rimMat, CY));
  add(rim(-0.254, 0.051, 0.004, ARC, rimMat, CY));

  // shield skirt edge beads (lower edges)
  const edgeBead = new THREE.SphereGeometry(0.006, 5, 3);
  const edgeAng = ARC / 2;
  const profile = (z: number): number => {
    const pts = z < 0 ? pelvic : shoulder;
    for (let i = 0; i < pts.length - 1; i++) {
      if (z >= pts[i][0] && z <= pts[i + 1][0]) {
        const t = (z - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      }
    }
    return 0.14;
  };
  const beadZs = [-0.23, -0.2, -0.17, -0.14, -0.11, 0.075, 0.105, 0.135, 0.165, 0.193];
  for (const z of beadZs) {
    const r = profile(z);
    for (const sx of [-1, 1]) {
      const b = new THREE.Mesh(edgeBead, rimMat);
      b.position.set(sx * Math.sin(edgeAng) * r, CY + Math.cos(edgeAng) * r, z);
      add(b);
    }
  }

  // neck
  const neck = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 7), skinMat);
  neck.scale.set(1, 0.9, 1);
  neck.position.set(0, 0.135, 0.19);
  add(neck);

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 0.14, 0.2);
  head.rotation.x = 0.33;
  root.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 7), skinMat);
  skull.scale.set(1, 0.85, 1.1);
  skull.position.set(0, 0, 0.02);
  add(skull, head);

  const snoutG = new THREE.CylinderGeometry(0.014, 0.043, 0.15, 8, 1);
  snoutG.rotateX(Math.PI / 2);
  const snout = new THREE.Mesh(snoutG, skinMat);
  snout.position.set(0, -0.006, 0.095);
  add(snout, head);

  // head shield
  const hs1 = seg(0.0, 0.07, 0.05, 0.04, (160 * Math.PI) / 180, shieldMat, 0.002, 10);
  add(hs1, head);
  const hs2 = seg(0.07, 0.14, 0.04, 0.021, (150 * Math.PI) / 180, shieldMat, -0.004, 10);
  add(hs2, head);
  add(rim(0.0, 0.05, 0.003, (160 * Math.PI) / 180, rimMat, 0.002), head);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 5), noseMat);
  nose.scale.set(1.05, 0.8, 0.8);
  nose.position.set(0, -0.006, 0.172);
  add(nose, head);
  for (const sx of [-1, 1]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.004, 5, 3), eyeMat);
    n.position.set(sx * 0.006, -0.006, 0.184);
    add(n, head);
  }
  // mouth line
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.002, 0.09), skinDark);
  mouth.position.set(0, -0.026, 0.1);
  mouth.rotation.x = -0.2;
  add(mouth, head);

  // eyes
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), eyeMat);
    e.position.set(sx * 0.036, 0.008, 0.05);
    add(e, head);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 5, 3), whiteMat);
    hl.position.set(sx * 0.042, 0.013, 0.055);
    add(hl, head);
    const lid = new THREE.Mesh(new THREE.TorusGeometry(0.0095, 0.002, 3, 10, Math.PI), skinDark);
    lid.position.set(sx * 0.037, 0.009, 0.05);
    lid.rotation.y = sx * 1.2;
    add(lid, head);
  }

  // ears
  for (const sx of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(sx * 0.03, 0.035, -0.004);
    ear.rotation.set(-0.45, 0, -sx * 0.4);
    head.add(ear);
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), skinMat);
    outer.scale.set(1, 1, 0.4);
    outer.position.y = 0.03;
    add(outer, ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.045, 6), skinDark);
    inner.scale.set(1, 1, 0.3);
    inner.position.set(0, 0.025, 0.006);
    add(inner, ear);
  }

  // ---------- legs ----------
  const legs: { x: number; z: number; front: boolean }[] = [
    { x: 0.075, z: 0.125, front: true },
    { x: -0.075, z: 0.125, front: true },
    { x: 0.08, z: -0.16, front: false },
    { x: -0.08, z: -0.16, front: false },
  ];
  for (const L of legs) {
    const sx = Math.sign(L.x);
    const leg = new THREE.Group();
    leg.position.set(L.x, 0, L.z);
    root.add(leg);

    const thigh = new THREE.Mesh(new THREE.SphereGeometry(L.front ? 0.034 : 0.04, 8, 6), skinMat);
    thigh.scale.set(0.9, 1.1, 1);
    thigh.position.set(0, 0.1, 0);
    add(thigh, leg);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.02, 0.09, 7), skinMat);
    shin.position.set(sx * 0.006, 0.055, 0);
    shin.rotation.z = -sx * 0.12;
    add(shin, leg);
    // leg scale bands
    for (let k = 0; k < 3; k++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.024 - k * 0.0015, 0.0025, 3, 10), bandMat);
      r.rotation.x = Math.PI / 2;
      r.position.set(sx * 0.005, 0.085 - k * 0.022, 0);
      add(r, leg);
    }

    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 5), skinDark);
    foot.scale.set(1, 0.45, 1.35);
    foot.position.set(sx * 0.01, 0.0115, 0.012);
    add(foot, leg);

    const nClaws = L.front ? 4 : 5;
    const clawLen = L.front ? 0.032 : 0.02;
    for (let c = 0; c < nClaws; c++) {
      const t = nClaws === 1 ? 0 : c / (nClaws - 1) - 0.5;
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.0045, clawLen, 4), clawMat);
      claw.rotation.x = Math.PI / 2 + 0.35;
      claw.rotation.z = -t * 0.5;
      claw.position.set(sx * 0.01 + t * 0.036, 0.0075, 0.042 + clawLen * 0.3 - Math.abs(t) * 0.012);
      add(claw, leg);
    }
  }

  // ---------- tail ----------
  const P0 = new THREE.Vector3(0, 0.135, -0.255);
  const P1 = new THREE.Vector3(0, 0.08, -0.42);
  const P2 = new THREE.Vector3(0, 0.014, -0.57);
  const bez = (t: number) =>
    new THREE.Vector3()
      .addScaledVector(P0, (1 - t) * (1 - t))
      .addScaledVector(P1, 2 * (1 - t) * t)
      .addScaledVector(P2, t * t);
  const NT = 12;
  const up = new THREE.Vector3(0, 1, 0);
  const zAx = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < NT; i++) {
    const a = bez(i / NT);
    const b = bez((i + 1) / NT);
    const ra = 0.034 * (1 - i / NT) + 0.005;
    const rb = 0.034 * (1 - (i + 1) / NT) + 0.005;
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    dir.normalize();
    const s = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra + 0.002, len * 1.02, 8, 1), i % 2 ? bandMat2 : bandMat);
    s.position.copy(a).add(b).multiplyScalar(0.5);
    s.quaternion.setFromUnitVectors(up, dir);
    add(s);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(ra + 0.002, 0.0025, 3, 10), rimMat);
    ring.position.copy(a).addScaledVector(dir, 0.003);
    ring.quaternion.setFromUnitVectors(zAx, dir);
    add(ring);
  }
  const tipDir = new THREE.Vector3().subVectors(P2, bez(0.95)).normalize();
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.02, 6), bandMat);
  tip.position.copy(P2).addScaledVector(tipDir, 0.009);
  tip.quaternion.setFromUnitVectors(up, tipDir);
  add(tip);

  return root;
}
```