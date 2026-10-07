```ts
import * as THREE from "three";

export const meta = {
  name: "Red Panda",
  description:
    "A stylized low-poly red panda standing at rest: faceted rust-orange body with fur-streak textures, dark legs and belly, white puffy cheeks and muzzle, tear-mark face stripes, big white-lined ears, and a bushy ringed tail with a dark tip.",
};

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function furTexture(base: string, light: string, dark: string, seed: number): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext("2d");
  if (!g) return null;
  const r = makeRng(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  g.lineCap = "round";
  for (let i = 0; i < 520; i++) {
    const x = r() * S;
    const y = r() * S;
    const len = 5 + r() * 14;
    const dx = (r() - 0.5) * 3;
    g.strokeStyle = r() < 0.5 ? light : dark;
    g.globalAlpha = 0.18 + r() * 0.3;
    g.lineWidth = 1 + r() * 1.6;
    for (const ox of [-S, 0, S]) {
      for (const oy of [-S, 0, S]) {
        g.beginPath();
        g.moveTo(x + ox, y + oy);
        g.lineTo(x + ox + dx, y + oy + len);
        g.stroke();
      }
    }
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(2, 2);
  return tex;
}

type Opts = { map?: THREE.Texture | null; rough?: number; flat?: boolean; metal?: number };
function mat(color: string, o: Opts = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: o.map ? new THREE.Color(0xffffff) : new THREE.Color(color),
    map: o.map ?? null,
    roughness: o.rough ?? 0.92,
    metalness: o.metal ?? 0,
    flatShading: o.flat ?? true,
  });
}

type V3 = [number, number, number];

export default function build(): THREE.Object3D {
  const rand = makeRng(20240611);
  const root = new THREE.Group();
  root.name = "RedPanda";

  // ---------- palette ----------
  const rust = mat("#c4531f", { map: furTexture("#c4531f", "#e0753a", "#9c3a16", 11) });
  const rustHead = mat("#d1612a", { map: furTexture("#d1612a", "#e8854a", "#a8421a", 17) });
  const rustLight = mat("#e0702c");
  const rustDeep = mat("#a53f18");
  const tan = mat("#e9a65e", { map: furTexture("#e9a65e", "#f6c98c", "#cf8c46", 23) });
  const tip = mat("#3a2016");
  const dark = mat("#33201a", { map: furTexture("#33201a", "#523226", "#1f110d", 31) });
  const belly = mat("#46281c", { map: furTexture("#46281c", "#5c3828", "#2e1a12", 53) });
  const white = mat("#f5efe4", { map: furTexture("#f5efe4", "#ffffff", "#ddd2bd", 47) });
  const cream = mat("#f6f0e5");
  const eyePatch = mat("#4a2012");
  const tear = mat("#8a3418");
  const black = mat("#0e0a09", { rough: 0.15, flat: false });
  const noseMat = mat("#1a1212", { rough: 0.3, flat: false });
  const claw = mat("#d8cfba");
  const whisker = mat("#efe9dc", { flat: false });
  const shine = mat("#ffffff", { rough: 0.3, flat: false });

  // ---------- shared geometry ----------
  const Y = new THREE.Vector3(0, 1, 0);
  const Zax = new THREE.Vector3(0, 0, 1);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const sphereGeo = new THREE.SphereGeometry(1, 10, 7);
  const smallSphere = new THREE.SphereGeometry(1, 8, 6);
  const coneGeo = new THREE.ConeGeometry(1, 1, 5);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const earGeo = new THREE.CylinderGeometry(0.34, 1, 1, 8);

  // ---------- helpers ----------
  function put(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: V3,
    s: V3,
    r: V3 = [0, 0, 0]
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    mesh.rotation.set(r[0], r[1], r[2]);
    parent.add(mesh);
    return mesh;
  }

  function limb(
    parent: THREE.Object3D,
    m: THREE.Material,
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    seg = 7
  ): THREE.Mesh {
    const len = a.distanceTo(b);
    const geo = new THREE.CylinderGeometry(rb, ra, len, seg);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y, b.clone().sub(a).normalize());
    parent.add(mesh);
    return mesh;
  }

  function tuft(
    parent: THREE.Object3D,
    m: THREE.Material,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    r: number,
    h: number
  ): THREE.Mesh {
    const d = dir.clone().normalize();
    const mesh = new THREE.Mesh(coneGeo, m);
    mesh.scale.set(r, h, r);
    mesh.position.copy(base).addScaledVector(d, h / 2);
    mesh.quaternion.setFromUnitVectors(Y, d);
    parent.add(mesh);
    return mesh;
  }

  function scatter(
    parent: THREE.Object3D,
    c: V3,
    r: V3,
    n: number,
    mats: THREE.Material[],
    rs: [number, number],
    hs: [number, number],
    filter: (v: THREE.Vector3) => boolean,
    back = 0.8
  ) {
    let made = 0;
    let tries = 0;
    while (made < n && tries < n * 60) {
      tries++;
      const v = V(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      const l = v.length();
      if (l > 1 || l < 0.2) continue;
      v.divideScalar(l);
      if (!filter(v)) continue;
      const p = V(c[0] + v.x * r[0], c[1] + v.y * r[1], c[2] + v.z * r[2]);
      const nrm = V(v.x / r[0], v.y / r[1], v.z / r[2]).normalize();
      const dir = nrm
        .clone()
        .add(V((rand() - 0.5) * 0.4, (rand() - 0.5) * 0.3, -back))
        .normalize();
      const h = hs[0] + rand() * (hs[1] - hs[0]);
      const rad = rs[0] + rand() * (rs[1] - rs[0]);
      const base = p.clone().addScaledVector(dir, -h * 0.3);
      tuft(parent, mats[Math.floor(rand() * mats.length)], base, dir, rad, h);
      made++;
    }
  }

  // ======================================================
  // BODY
  // ======================================================
  put(root, sphereGeo, rust, [0, 0.18, -0.03], [0.1, 0.095, 0.22]); // torso
  put(root, sphereGeo, rust, [0, 0.185, 0.115], [0.095, 0.09, 0.09]); // shoulders
  put(root, sphereGeo, rust, [0, 0.19, -0.16], [0.1, 0.095, 0.1]); // rump
  put(root, sphereGeo, belly, [0, 0.135, -0.02], [0.086, 0.06, 0.19]); // dark belly
  put(root, sphereGeo, belly, [0, 0.14, 0.15], [0.07, 0.07, 0.075]); // dark chest
  put(root, sphereGeo, rust, [0, 0.225, 0.2], [0.07, 0.065, 0.07]); // neck

  const furMats = [rustLight, rustDeep, rust];
  const notBelly = (v: THREE.Vector3) => v.y > -0.15;
  scatter(root, [0, 0.18, -0.03], [0.1, 0.095, 0.22], 70, furMats, [0.011, 0.016], [0.035, 0.055], notBelly);
  scatter(root, [0, 0.19, -0.16], [0.1, 0.095, 0.1], 30, furMats, [0.011, 0.016], [0.035, 0.055], notBelly);
  scatter(root, [0, 0.185, 0.115], [0.095, 0.09, 0.09], 20, furMats, [0.011, 0.015], [0.03, 0.05], notBelly);
  scatter(root, [0, 0.225, 0.2], [0.07, 0.065, 0.07], 12, furMats, [0.01, 0.014], [0.03, 0.045], (v) => v.y > 0.1);

  // ======================================================
  // LEGS
  // ======================================================
  for (const s of [-1, 1]) {
    // ---- front ----
    const fx = s * 0.066;
    put(root, sphereGeo, rust, [s * 0.083, 0.165, 0.12], [0.04, 0.06, 0.07]);
    limb(root, dark, V(fx, 0.16, 0.12), V(fx, 0.03, 0.138), 0.044, 0.032, 7);
    put(root, sphereGeo, dark, [fx, 0.02, 0.152], [0.036, 0.022, 0.052]);
    for (let k = -1; k <= 1; k++) {
      const tz = k === 0 ? 0.198 : 0.193;
      put(root, smallSphere, dark, [fx + k * 0.017, 0.013, tz], [0.0125, 0.011, 0.015]);
      tuft(root, claw, V(fx + k * 0.017, 0.009, tz + 0.01), V(0, -0.25, 1), 0.0045, 0.014);
    }
    scatter(root, [s * 0.083, 0.165, 0.12], [0.04, 0.06, 0.07], 8, furMats, [0.01, 0.013], [0.03, 0.04], (v) => v.x * s > 0.2);

    // ---- hind ----
    const hx = s * 0.076;
    put(root, sphereGeo, rust, [s * 0.082, 0.14, -0.15], [0.042, 0.08, 0.095]); // thigh
    limb(root, dark, V(hx, 0.115, -0.125), V(hx, 0.04, -0.195), 0.042, 0.03, 7);
    put(root, sphereGeo, dark, [hx, 0.02, -0.15], [0.034, 0.022, 0.07]); // long foot
    for (let k = -1; k <= 1; k++) {
      const tz = k === 0 ? -0.078 : -0.083;
      put(root, smallSphere, dark, [hx + k * 0.016, 0.013, tz], [0.012, 0.011, 0.015]);
      tuft(root, claw, V(hx + k * 0.016, 0.009, tz + 0.01), V(0, -0.25, 1), 0.0045, 0.014);
    }
    scatter(root, [s * 0.082, 0.14, -0.15], [0.042, 0.08, 0.095], 12, furMats, [0.01, 0.013], [0.03, 0.045], (v) => v.y > -0.2);
  }

  // ======================================================
  // HEAD
  // ======================================================
  const head = new THREE.Group();
  head.name = "Head";
  head.position.set(0, 0.262, 0.268);
  root.add(head);

  const HR = { x: 0.082, y: 0.066, z: 0.072 };
  put(head, sphereGeo, rustHead, [0, 0, 0], [HR.x, HR.y, HR.z]);

  // stick a flattened ellipsoid onto the skull surface
  function patch(
    m: THREE.Material,
    x: number,
    y: number,
    sx: number,
    sy: number,
    sz: number,
    off = 0,
    roll = 0,
    geo: THREE.BufferGeometry = sphereGeo
  ) {
    const zz = HR.z * Math.sqrt(Math.max(1 - (x / HR.x) ** 2 - (y / HR.y) ** 2, 0.03));
    const n = V(x / (HR.x * HR.x), y / (HR.y * HR.y), zz / (HR.z * HR.z)).normalize();
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, zz).addScaledVector(n, off);
    mesh.quaternion
      .setFromUnitVectors(Zax, n)
      .multiply(new THREE.Quaternion().setFromAxisAngle(Zax, roll));
    mesh.scale.set(sx, sy, sz);
    head.add(mesh);
    return mesh;
  }

  const mz = (x: number, y: number) =>
    0.056 + 0.04 * Math.sqrt(Math.max(0, 1 - (x / 0.036) ** 2 - ((y + 0.026) / 0.027) ** 2));

  // muzzle, chin, nose, mouth
  put(head, sphereGeo, white, [0, -0.026, 0.056], [0.036, 0.027, 0.04]);
  put(head, sphereGeo, white, [0, -0.05, 0.04], [0.026, 0.014, 0.03]);
  put(head, smallSphere, noseMat, [0, -0.0165, mz(0, -0.0165) + 0.0015], [0.0175, 0.013, 0.012]);
  put(head, boxGeo, black, [0, -0.0375, mz(0, -0.0375) + 0.0005], [0.003, 0.014, 0.003]);
  for (const s of [-1, 1]) {
    put(
      head,
      boxGeo,
      black,
      [s * 0.0085, -0.0445, mz(s * 0.0085, -0.0445) + 0.0005],
      [0.0165, 0.003, 0.003],
      [0, s * 0.45, -s * 0.4]
    );
  }

  for (const s of [-1, 1]) {
    // puffy cheeks
    put(head, sphereGeo, white, [s * 0.062, -0.018, 0.012], [0.04, 0.035, 0.04]);
    for (let k = 0; k < 4; k++) {
      tuft(
        head,
        cream,
        V(s * 0.088, -0.004 - k * 0.013, 0.016 - k * 0.011),
        V(s * 1, -0.2 - k * 0.25, -0.45),
        0.0145,
        0.04
      );
    }
    tuft(head, cream, V(s * 0.014, -0.058, 0.04), V(s * 0.2, -1, -0.35), 0.012, 0.03);

    // eye patch, eye, highlight
    patch(eyePatch, s * 0.035, 0.013, 0.018, 0.023, 0.01, -0.001, -s * 0.25);
    patch(black, s * 0.034, 0.012, 0.0095, 0.0105, 0.0085, 0.004, 0, smallSphere);
    patch(shine, s * 0.0365, 0.0165, 0.0033, 0.0033, 0.0033, 0.0105, 0, smallSphere);
    // brow spot
    patch(cream, s * 0.041, 0.043, 0.013, 0.009, 0.008, 0, s * 0.1);
    // tear stripe
    patch(tear, s * 0.039, -0.014, 0.0055, 0.024, 0.008, 0, -s * 0.22);

    // whiskers
    const dirs = [V(s * 0.9, 0.12, 0.35), V(s * 1, -0.05, 0.1), V(s * 0.9, -0.25, -0.1)];
    for (let k = 0; k < 3; k++) {
      const a = V(s * 0.03, -0.03 - k * 0.004, 0.07);
      const b = a.clone().addScaledVector(dirs[k].clone().normalize(), 0.055);
      limb(head, whisker, a, b, 0.0009, 0.0005, 3);
    }

    // ears
    const ear = new THREE.Group();
    ear.position.set(s * 0.058, 0.05, -0.006);
    ear.rotation.set(0.12, s * 0.28, -s * 0.4);
    head.add(ear);
    put(ear, earGeo, tip, [0, -0.002, -0.009], [0.031, 0.066, 0.015]); // dark back
    put(ear, earGeo, rustHead, [0, 0, 0], [0.037, 0.07, 0.0185]); // outer
    put(ear, earGeo, cream, [0, -0.003, 0.0085], [0.027, 0.058, 0.0135]); // white inner
    for (let k = -1; k <= 1; k++) {
      tuft(ear, cream, V(k * 0.012, -0.022, 0.018), V(k * 0.35, 0.9, 0.5), 0.007, 0.03);
    }
  }

  // tufts on back of head between the ears
  scatter(
    head,
    [0, 0, 0],
    [HR.x, HR.y, HR.z],
    14,
    furMats,
    [0.01, 0.013],
    [0.03, 0.04],
    (v) => v.y > 0.35 && v.z < 0.1,
    0.7
  );

  // ======================================================
  // TAIL (ringed, bushy)
  // ======================================================
  const tailPts = [
    V(0, 0.205, -0.2),
    V(0, 0.218, -0.3),
    V(0.004, 0.205, -0.4),
    V(0.028, 0.175, -0.49),
    V(0.07, 0.14, -0.57),
    V(0.115, 0.11, -0.62),
  ];
  const curve = new THREE.CatmullRomCurve3(tailPts, false, "centripetal");
  const prof: [number, number][] = [
    [0, 0.046],
    [0.2, 0.061],
    [0.42, 0.074],
    [0.7, 0.07],
    [0.88, 0.058],
    [1, 0.034],
  ];
  const radiusAt = (t: number) => {
    for (let i = 0; i < prof.length - 1; i++) {
      const [t0, r0] = prof[i];
      const [t1, r1] = prof[i + 1];
      if (t <= t1) return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
    }
    return prof[prof.length - 1][1];
  };

  const N = 14;
  for (let i = 0; i < N; i++) {
    const t0 = i / N;
    const t1 = (i + 1) / N;
    const isA = i % 2 === 0;
    const ext = isA ? 0.14 : 0;
    const ta = Math.max(0, t0 - ext / N);
    const tb = Math.min(1, t1 + ext / N);
    const a = curve.getPointAt(ta);
    const b = curve.getPointAt(tb);
    const k = isA ? 1 : 0.955;
    const ringMat = i >= N - 2 ? tip : isA ? rust : tan;
    limb(root, ringMat, a, b, radiusAt(ta) * k, radiusAt(tb) * k, 8);

    // side and top fluff on visible rings
    if (i >= 2 && i < N - 1) {
      const tm = (i + 0.5) / N;
      const P = curve.getPointAt(tm);
      const T = curve.getTangentAt(tm).normalize();
      const u = new THREE.Vector3().crossVectors(T, Y).normalize();
      const w = new THREE.Vector3().crossVectors(T, u).normalize();
      const rr = radiusAt(tm) * k;
      const outs = [u, u.clone().multiplyScalar(-1), w];
      for (const o of outs) {
        const base = P.clone().addScaledVector(o, rr * 0.88);
        const d = T.clone().multiplyScalar(0.85).addScaledVector(o, 0.5);
        tuft(root, ringMat, base, d, 0.012, 0.034);
      }
    }
  }

  // dark rounded tip + tuft
  {
    const endP = curve.getPointAt(1);
    const endT = curve.getTangentAt(1).normalize();
    const cap = new THREE.Mesh(smallSphere, tip);
    cap.position.copy(endP);
    cap.scale.set(0.034, 0.046, 0.034);
    cap.quaternion.setFromUnitVectors(Y, endT);
    root.add(cap);
    const u = new THREE.Vector3().crossVectors(endT, Y).normalize();
    const w = new THREE.Vector3().crossVectors(endT, u).normalize();
    for (let k = 0; k < 7; k++) {
      const ang = (k / 7) * Math.PI * 2;
      const rad = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang));
      const base = endP.clone().addScaledVector(rad, 0.02).addScaledVector(endT, 0.01);
      const d = endT.clone().multiplyScalar(0.9).addScaledVector(rad, 0.45);
      tuft(root, tip, base, d, 0.012, 0.04);
    }
  }

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return root;
}
```