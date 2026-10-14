```ts
import * as THREE from "three";

export const meta = {
  name: "Red Panda",
  description:
    "A stylized low-poly red panda in a neutral standing pose. It has rust fur, a white face mask with dark tear marks, white-rimmed ears, sooty legs and a big ringed tail.",
};

type V3 = [number, number, number];

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function furTexture(rand: () => number): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#e4e4e4";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const len = 5 + rand() * 12;
    const light = rand() < 0.45;
    g.strokeStyle = light ? "#ffffff" : "#9c9c9c";
    g.globalAlpha = 0.2 + rand() * 0.35;
    g.lineWidth = 1 + rand() * 1.8;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + (rand() - 0.5) * 5, y + len * 0.5, x + (rand() - 0.5) * 6, y + len);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = makeRng(1337);
  const fur = furTexture(rand);

  const M = (color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...opts });

  const rust = M("#d84e14", fur ? { map: fur } : {});
  const rustDark = M("#8f2f0c");
  const headOr = M("#e8742f", fur ? { map: fur } : {});
  const tan = M("#f4bd82", fur ? { map: fur } : {});
  const cream = M("#f8f2e7");
  const sooty = M("#2b1914");
  const noseMat = M("#141010", { roughness: 0.4 });
  const eyeMat = M("#0a0707", { roughness: 0.15 });
  const shine = M("#ffffff", { roughness: 0.2 });
  const claw = M("#d8cfc0", { roughness: 0.5 });
  const inner = M("#4a2a1e");
  const tipMat = M("#3a1a10", fur ? { map: fur } : {});

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    parent: THREE.Object3D,
    p: V3,
    r?: V3,
    s?: V3
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    if (r) m.rotation.set(r[0], r[1], r[2]);
    if (s) m.scale.set(s[0], s[1], s[2]);
    parent.add(m);
    return m;
  };

  const UP = new THREE.Vector3(0, 1, 0);
  const stick = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    r0: number,
    r1: number,
    mat: THREE.Material,
    parent: THREE.Object3D,
    seg = 6,
    extra = 0
  ) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len + extra, seg, 1), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(m);
    return m;
  };
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- BODY ----------
  add(new THREE.CapsuleGeometry(0.13, 0.3, 3, 8), rust, root, [0, 0.265, 0], [Math.PI / 2, 0, 0], [1, 1, 0.92]);
  add(new THREE.CapsuleGeometry(0.118, 0.28, 3, 8), sooty, root, [0, 0.24, 0], [Math.PI / 2, 0, 0], [0.95, 1, 0.9]);
  // chest & neck
  add(new THREE.IcosahedronGeometry(0.08, 1), sooty, root, [0, 0.25, 0.25]);
  add(new THREE.IcosahedronGeometry(0.1, 1), rust, root, [0, 0.34, 0.26]);
  // neck ruff tufts
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      add(new THREE.ConeGeometry(0.022, 0.05, 4), rust, root,
        [s * 0.095, 0.33 - i * 0.03, 0.25 - i * 0.02], [0, 0, -s * (Math.PI / 2 + 0.3 + i * 0.3)]);
    }
  }

  // ---------- LEGS ----------
  const paw = (x: number, z: number, len: number) => {
    add(new THREE.SphereGeometry(0.042, 8, 5), sooty, root, [x, 0.022, z + 0.018], undefined, [1, 0.55, len]);
    for (const dx of [-0.018, 0, 0.018]) {
      add(new THREE.ConeGeometry(0.0055, 0.018, 4), claw, root,
        [x + dx, 0.016, z + 0.018 + 0.042 * len - 0.004], [Math.PI / 2 + 0.5, 0, 0]);
    }
  };
  for (const s of [-1, 1]) {
    // front
    add(new THREE.IcosahedronGeometry(0.055, 1), sooty, root, [s * 0.078, 0.215, 0.18]);
    add(new THREE.CylinderGeometry(0.042, 0.034, 0.2, 7), sooty, root, [s * 0.075, 0.13, 0.19]);
    paw(s * 0.075, 0.19, 1.3);
    // back
    add(new THREE.IcosahedronGeometry(0.085, 1), rust, root, [s * 0.07, 0.25, -0.17], undefined, [0.75, 1, 1.1]);
    add(new THREE.IcosahedronGeometry(0.05, 1), sooty, root, [s * 0.08, 0.17, -0.19]);
    add(new THREE.CylinderGeometry(0.046, 0.036, 0.18, 7), sooty, root, [s * 0.08, 0.115, -0.19]);
    paw(s * 0.08, -0.19, 1.45);
  }

  // ---------- HEAD ----------
  const head = new THREE.Group();
  head.position.set(0, 0.41, 0.38);
  head.rotation.set(-0.04, 0.14, 0.08);
  root.add(head);

  add(new THREE.IcosahedronGeometry(0.115, 1), headOr, head, [0, 0, 0], undefined, [1.15, 0.92, 0.95]);
  // muzzle, chin, nose, mouth
  add(new THREE.IcosahedronGeometry(0.055, 1), cream, head, [0, -0.04, 0.09], undefined, [1.0, 0.8, 1]);
  add(new THREE.IcosahedronGeometry(0.03, 1), cream, head, [0, -0.072, 0.08], undefined, [1.3, 0.6, 1]);
  add(new THREE.IcosahedronGeometry(0.02, 0), noseMat, head, [0, -0.025, 0.15], undefined, [1.35, 0.8, 1]);
  add(new THREE.BoxGeometry(0.003, 0.02, 0.004), noseMat, head, [0, -0.047, 0.141]);
  add(new THREE.BoxGeometry(0.032, 0.004, 0.004), noseMat, head, [0, -0.058, 0.137], [0, 0, 0]);

  for (const s of [-1, 1]) {
    // eyes
    add(new THREE.SphereGeometry(0.019, 8, 6), eyeMat, head, [s * 0.048, 0.01, 0.095]);
    add(new THREE.SphereGeometry(0.0055, 5, 4), shine, head, [s * 0.048 + 0.007, 0.018, 0.111]);
    // white brows
    add(new THREE.IcosahedronGeometry(0.03, 1), cream, head, [s * 0.05, 0.045, 0.085], [0, 0, s * 0.25], [1, 0.55, 0.5]);
    // cheeks
    add(new THREE.IcosahedronGeometry(0.05, 1), cream, head, [s * 0.085, -0.04, 0.05], undefined, [1, 0.8, 0.9]);
    // tear marks
    add(new THREE.SphereGeometry(0.02, 6, 5), rustDark, head, [s * 0.056, -0.03, 0.092], [0, 0, s * 0.3], [0.45, 1.4, 0.4]);
    // cheek ruff tufts
    for (let i = 0; i < 3; i++) {
      add(new THREE.ConeGeometry(0.018, 0.045, 4), cream, head,
        [s * 0.13, -0.03 - 0.018 * i, 0.04 - 0.012 * i], [0, 0, -s * (Math.PI / 2 + 0.25 + 0.3 * i)]);
    }
    // whiskers
    for (let i = 0; i < 3; i++) {
      const a = v(s * 0.04, -0.045 - i * 0.008, 0.115);
      const b = v(s * (0.12 + i * 0.01), -0.035 - i * 0.022, 0.13 - i * 0.012);
      stick(a, b, 0.0013, 0.0008, cream, head, 3);
    }
    // ears
    const ear = new THREE.Group();
    ear.position.set(s * 0.085, 0.07, -0.02);
    ear.rotation.set(-0.15, s * 0.2, -s * 0.42);
    head.add(ear);
    const tri = (w: number, h: number, depth: number) => {
      const sh = new THREE.Shape();
      sh.moveTo(-w / 2, 0);
      sh.lineTo(w / 2, 0);
      sh.quadraticCurveTo(w * 0.15, h * 0.8, 0, h);
      sh.quadraticCurveTo(-w * 0.15, h * 0.8, -w / 2, 0);
      return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 3 });
    };
    add(tri(0.1, 0.092, 0.012), cream, ear, [0, 0, 0]);
    add(tri(0.09, 0.084, 0.012), rustDark, ear, [0, 0.002, -0.01]);
    add(tri(0.06, 0.058, 0.006), inner, ear, [0, 0.01, 0.011]);
    add(new THREE.ConeGeometry(0.012, 0.035, 4), cream, ear, [-0.012, 0.022, 0.018], [0, 0, 0.3]);
    add(new THREE.ConeGeometry(0.012, 0.035, 4), cream, ear, [0.012, 0.022, 0.018], [0, 0, -0.3]);
  }

  // ---------- TAIL ----------
  const curve = new THREE.CatmullRomCurve3([
    v(0, 0.28, -0.2),
    v(0.01, 0.32, -0.38),
    v(0.04, 0.35, -0.55),
    v(0.07, 0.33, -0.72),
    v(0.08, 0.27, -0.86),
  ]);
  const bands: [THREE.Material, number][] = [
    [rust, 1.2], [tan, 0.6], [rust, 1.0], [tan, 0.6], [rust, 1.0], [tan, 0.6],
    [rust, 0.95], [tan, 0.55], [rust, 0.9], [tan, 0.5], [rust, 0.8], [tipMat, 0.9],
  ];
  const total = bands.reduce((a, b) => a + b[1], 0);
  const rad = (t: number) => 0.042 + 0.048 * Math.sin(Math.PI * (0.12 + 0.78 * t));
  let acc = 0;
  bands.forEach(([mat, w], bi) => {
    const t0 = acc / total;
    const t1 = (acc + w) / total;
    acc += w;
    const isTan = mat === tan;
    const isTip = bi === bands.length - 1;
    const sub = 2;
    for (let k = 0; k < sub; k++) {
      const ta = t0 + ((t1 - t0) * k) / sub;
      const tb = t0 + ((t1 - t0) * (k + 1)) / sub;
      const bump = isTan ? 0.006 : 0;
      let r0 = rad(ta) + bump;
      let r1 = rad(tb) + bump;
      if (isTip) {
        r0 *= 1 - 0.3 * (k / sub);
        r1 *= 1 - 0.3 * ((k + 1) / sub);
      }
      stick(curve.getPointAt(ta), curve.getPointAt(tb), r0, r1, mat, root, 9, 0.014);
    }
  });
  // tail tip cap
  {
    const end = curve.getPointAt(1);
    const dir = curve.getTangentAt(1).normalize();
    const rEnd = rad(1) * 0.7;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(rEnd, 0.06, 9), tipMat);
    cap.quaternion.setFromUnitVectors(UP, dir);
    cap.position.copy(end).addScaledVector(dir, 0.028);
    root.add(cap);
  }

  return root;
}
```