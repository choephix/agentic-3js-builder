import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description:
    "A Slavic folk-art log hut standing on two giant feathered chicken legs, with a konyok-crowned ridge, painted platbands, sun emblems, a skull-lit porch and a mossy forest-floor base.",
};

// ---------- palette ----------
const LOGS = ["#8a5a32", "#7a4c28", "#9c6c3c", "#6e4424"];
const DARKWOOD = "#4a3020";
const PLANK = "#b98a52";
const RED = "#b5302a";
const TEAL = "#2f7f78";
const GOLD = "#e5b039";
const ORANGE = "#d9742a";
const CREAMC = "#f0e0b8";
const IRON = "#34323a";
const GLASS = "#ffc65a";
const RUF = "#a8482a";
const RUF2 = "#c9712f";
const FCREAM = "#ecd3a0";
const FDARK = "#5b2a1c";
const LEG = "#e0a92e";
const LEGD = "#b9791e";
const CLAW = "#3a2a22";
const BONE = "#eee6cf";
const MOSS = "#5f8f3c";
const MOSS2 = "#44702e";
const SHINGLES = [TEAL, RED, GOLD];
const G = 0.12; // ground top
const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "babaYagaHut" });
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- helpers ----------
  const box = (c: number[], s: number[], color: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { at: c, rotation: rot });
  const cylAlong = (c: number[], dir: number[], len: number, r: number, color: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: c, dir });
  const sph = (c: number[] | THREE.Vector3, r: number, color: string, scale?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: c, scale, flat: true });

  type Face = { o: number[]; u: number[]; out: number[] };
  const fpt = (f: Face, du: number, dv: number, dd: number) => [
    f.o[0] + f.u[0] * du + f.out[0] * dd,
    dv,
    f.o[2] + f.u[2] * du + f.out[2] * dd,
  ];
  const fbox = (f: Face, du: number, dv: number, dd: number, wu: number, wv: number, th: number, color: string, rot?: number[]) =>
    box(
      fpt(f, du, dv, dd),
      [
        Math.abs(f.u[0]) * wu + Math.abs(f.out[0]) * th,
        wv,
        Math.abs(f.u[2]) * wu + Math.abs(f.out[2]) * th,
      ],
      color,
      rot,
    );
  const fflower = (f: Face, du: number, dv: number, dd: number, r: number, petal: string, center: string, n = 6) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const ru = Math.cos(a), rv = Math.sin(a);
      const dir = [f.u[0] * ru, rv, f.u[2] * ru];
      b.part(new THREE.SphereGeometry(1, 6, 4), petal, {
        at: fpt(f, du + ru * r * 0.62, dv + rv * r * 0.62, dd),
        dir,
        up: f.out,
        scale: [r * 0.3, r * 0.45, r * 0.22],
      });
    }
    b.part(new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.03, 8), center, {
      at: fpt(f, du, dv, dd + 0.012),
      dir: f.out,
    });
  };
  const CREST = [
    [-0.5, 0], [0.5, 0], [0.5, 0.2], [0.33, 0.3], [0.33, 0.55], [0.15, 0.7], [0, 1], [-0.15, 0.7], [-0.33, 0.55], [-0.33, 0.3], [-0.5, 0.2],
  ];
  const crest = (f: Face, du: number, dv: number, dd: number, w: number, h: number, color: string) =>
    b.extrude(
      CREST.map(([x, y]) => [x * w, y * h] as [number, number]),
      { at: fpt(f, du, dv, dd), x: f.u, y: [0, 1, 0], thickness: 0.06, color },
    );
  const sawOutline = (L: number, n: number, d0: number, d1: number) => {
    const w = L / n;
    const pts: [number, number, "sharp"?][] = [[0, 0], [L, 0], [L, d0]];
    for (let i = n - 1; i >= 0; i--) {
      pts.push([i * w + w / 2, d1, "sharp"]);
      pts.push([i * w, d0, "sharp"]);
    }
    // remove duplicate last point equal to [0,d0] handled by loop; ensure unique
    return pts as any;
  };

  // ---------- ground base ----------
  b.part(new THREE.CylinderGeometry(3.95, 4.05, 0.06, 18), "#4a3a2a", { at: [0, 0.03, 0.4], flat: true });
  b.part(new THREE.CylinderGeometry(3.8, 3.95, 0.06, 18), "#5d8a3e", { at: [0, 0.09, 0.4], flat: true });
  for (let i = 0; i < 22; i++) {
    const a = R() * Math.PI * 2, rr = 2.2 + R() * 1.5;
    const x = Math.cos(a) * rr, z = 0.4 + Math.sin(a) * rr;
    b.spike([x, G - 0.01, z], [R() * 0.4 - 0.2, 1, R() * 0.4 - 0.2], 0.2 + R() * 0.18, 0.045, { color: i % 2 ? MOSS : MOSS2 });
  }
  for (const [x, z, s] of [[-2.7, 1.2, 1], [2.9, 0.2, 0.8], [-2.1, -1.8, 1.2], [1.9, 2.6, 0.7]]) {
    sph([x, G + 0.05 * s, z], 0.22 * s, "#7c7a78", [1.2, 0.7, 1]);
    sph([x + 0.12 * s, G + 0.12 * s, z + 0.05], 0.1 * s, MOSS, [1.2, 0.5, 1]);
  }
  for (const [x, z, s] of [[-1.7, 2.3, 1], [2.2, 1.7, 0.8], [-2.4, 0.1, 0.7], [1.5, -2.3, 0.9]]) {
    cylAlong([x, G + 0.09 * s, z], [0, 1, 0], 0.18 * s, 0.045 * s, CREAMC, 6);
    b.part(new THREE.SphereGeometry(0.14 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), RED, { at: [x, G + 0.17 * s, z], flat: true });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.57 + 0.4;
      sph([x + Math.cos(a) * 0.07 * s, G + 0.26 * s, z + Math.sin(a) * 0.07 * s], 0.02 * s, "#ffffff");
    }
  }

  // ---------- chicken legs ----------
  function fluff(a: THREE.Vector3, e: THREE.Vector3, r0: number, r1: number, rows: number, per: number, len: number, cols: string[]) {
    const d = e.clone().sub(a).normalize();
    const ax = Math.abs(d.x) < 0.9 ? V(1, 0, 0) : V(0, 0, 1);
    const u = d.clone().cross(ax).normalize();
    const w = d.clone().cross(u);
    for (let i = 0; i < rows; i++) {
      const t = (i + 0.5) / rows;
      const c = a.clone().lerp(e, t);
      const r = r0 + (r1 - r0) * t;
      for (let k = 0; k < per; k++) {
        const ang = (k / per) * Math.PI * 2 + i * 0.55;
        const rad = u.clone().multiplyScalar(Math.cos(ang)).add(w.clone().multiplyScalar(Math.sin(ang)));
        const base = c.clone().add(rad.clone().multiplyScalar(r * 0.9));
        const dir = d.clone().multiplyScalar(0.9).add(rad.multiplyScalar(0.5)).add(V(0, -0.35, 0)).normalize();
        b.spike(base, dir, len * (0.8 + R() * 0.4), 0.06, { color: cols[(i + k) % cols.length] });
      }
    }
  }
  function leg(s: number) {
    const H = V(s * 0.9, 2.02, 0.1);
    const K = V(s * 1.0, 1.5, 0.78);
    const Hk = V(s * 0.95, 0.98, 0.2);
    const Ft = V(s * 0.95, G + 0.075, 0.55);
    sph(H, 0.5, RUF, [1, 0.85, 1.1]);
    sph(H.clone().add(V(0, -0.15, 0.2)), 0.38, FCREAM, [1, 0.8, 1]);
    b.capsule(H, K, [0.27, 0.2], RUF);
    sph(K, 0.22, RUF2);
    b.capsule(K, Hk, [0.19, 0.11], RUF2);
    fluff(H, K, 0.27, 0.2, 4, 6, 0.32, [RUF, RUF2, FCREAM, FDARK]);
    fluff(K, Hk, 0.19, 0.12, 3, 5, 0.26, [RUF2, FCREAM, RUF]);
    sph(Hk, 0.12, LEG);
    b.capsule(Hk, Ft, 0.085, LEG);
    const d = Ft.clone().sub(Hk).normalize();
    for (let i = 1; i <= 6; i++) {
      const p = Hk.clone().lerp(Ft, i / 7);
      b.part(new THREE.CylinderGeometry(0.108, 0.108, 0.04, 8), LEGD, { at: p, dir: d });
    }
    b.spike(Hk.clone().add(V(0, -0.15, -0.07)), V(0, -0.3, -1), 0.2, 0.05, { color: CLAW });
    sph(Ft, 0.15, LEG, [1, 0.7, 1]);
    for (const an of [-34, 0, 34]) {
      const dir = V(Math.sin(an * DEG), 0, Math.cos(an * DEG));
      const end = Ft.clone().add(dir.clone().multiplyScalar(0.9));
      b.rod(Ft, end, [0.085, 0.06], LEG);
      sph(Ft.clone().add(dir.clone().multiplyScalar(0.45)), 0.095, LEGD);
      b.spike(end, V(dir.x, -0.4, dir.z), 0.3, 0.06, { color: CLAW });
    }
    const back = V(0, 0, -1);
    const bend = Ft.clone().add(V(0, 0, -0.5));
    b.rod(Ft, bend, [0.075, 0.055], LEG);
    b.spike(bend, V(0, -0.4, -1), 0.26, 0.055, { color: CLAW });
    void back;
  }
  leg(1);
  leg(-1);

  // ---------- platform & porch ----------
  box([0, 2.13, 0], [3.5, 0.25, 3.1], DARKWOOD);
  box([0, 3.05, 0], [2.9, 1.7, 2.5], "#2b1c12");
  box([0, 2.18, 2.0], [1.9, 0.14, 0.9], "#6e4424");

  const fascia = (f: Face, len: number, dvc: number) => {
    fbox(f, 0, dvc, 0.0, len, 0.2, 0.04, TEAL);
    const n = Math.floor(len / 0.38);
    const step = len / n;
    for (let i = 0; i < n; i++) {
      const du = -len / 2 + step / 2 + i * step;
      const zface = Math.abs(f.out[2]) > 0.5;
      const dims = zface ? [0.15, 0.15, 0.04] : [0.04, 0.15, 0.15];
      b.part(new THREE.BoxGeometry(dims[0], dims[1], dims[2]), i % 2 ? RED : GOLD, {
        at: fpt(f, du, dvc, 0.025),
        rotation: zface ? [0, 0, 45] : [45, 0, 0],
      });
    }
  };
  fascia({ o: [0, 0, 1.57], u: [1, 0, 0], out: [0, 0, 1] }, 3.4, 2.14);
  fascia({ o: [0, 0, -1.57], u: [-1, 0, 0], out: [0, 0, -1] }, 3.4, 2.14);
  fascia({ o: [1.76, 0, 0], u: [0, 0, 1], out: [1, 0, 0] }, 3.0, 2.14);
  fascia({ o: [-1.76, 0, 0], u: [0, 0, 1], out: [-1, 0, 0] }, 3.0, 2.14);
  fascia({ o: [0, 0, 2.46], u: [1, 0, 0], out: [0, 0, 1] }, 1.9, 2.14);

  const skull = (x: number, y: number, z: number) => {
    sph([x, y, z], 0.14, BONE, [1, 1.05, 1]);
    box([x, y - 0.12, z + 0.04], [0.12, 0.06, 0.1], BONE);
    for (const s of [1, -1]) {
      sph([x + s * 0.055, y + 0.01, z + 0.11], 0.045, "#1c120c");
      glow(sph([x + s * 0.055, y + 0.01, z + 0.13], 0.028, "#ff8a1c"), 1.6);
    }
    b.spike([x, y - 0.04, z + 0.13], [0, -0.2, 1], 0.05, 0.02, { color: "#1c120c" });
  };
  for (const s of [1, -1]) {
    cylAlong([s * 0.9, 2.62, 2.38], [0, 1, 0], 0.74, 0.06, RED, 6);
    sph([s * 0.9, 2.99, 2.38], 0.08, GOLD);
    skull(s * 0.9, 3.15, 2.38);
    b.rod([s * 0.9, 2.78, 2.38], [s * 0.9, 2.78, 1.5], 0.04, RED);
    for (const z of [1.75, 2.0, 2.2]) cylAlong([s * 0.9, 2.52, z], [0, 1, 0], 0.5, 0.03, TEAL, 6);
  }
  // ladder
  for (const s of [1, -1]) b.rod([s * 0.35, 2.25, 2.4], [s * 0.35, G, 3.25], 0.045, "#7a4c28");
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.7) / 7.6;
    const y = 2.25 + (G - 2.25) * t, z = 2.4 + 0.85 * t;
    cylAlong([0, y, z], [1, 0, 0], 0.7, 0.03, "#9c6c3c", 6);
  }

  // ---------- log walls ----------
  for (let k = 0; k < 8; k++) {
    const y = 2.36 + k * 0.2;
    const c = LOGS[k % 4];
    for (const z of [1.3, -1.3]) cylAlong([0, y, z], [1, 0, 0], 3.5, 0.105, c);
    for (const x of [1.5, -1.5]) cylAlong([x, y, 0], [0, 0, 1], 3.0, 0.105, LOGS[(k + 2) % 4]);
  }
  // end-grain rings at corners
  for (let k = 0; k < 8; k += 1) {
    const y = 2.36 + k * 0.2;
    for (const sx of [1, -1]) for (const z of [1.3, -1.3]) {
      cylAlong([sx * 1.755, y, z], [1, 0, 0], 0.01, 0.075, "#d0a066", 8);
    }
  }

  // ---------- faces ----------
  const front: Face = { o: [0, 0, 1.41], u: [1, 0, 0], out: [0, 0, 1] };
  const sideR: Face = { o: [1.61, 0, 0], u: [0, 0, 1], out: [1, 0, 0] };
  const sideL: Face = { o: [-1.61, 0, 0], u: [0, 0, 1], out: [-1, 0, 0] };
  const back: Face = { o: [0, 0, -1.41], u: [-1, 0, 0], out: [0, 0, -1] };

  function win(f: Face, du: number, dv: number) {
    glow(fbox(f, du, dv, 0.0, 0.5, 0.6, 0.04, GLASS), 1.2);
    fbox(f, du, dv, 0.035, 0.04, 0.6, 0.03, IRON);
    fbox(f, du, dv, 0.035, 0.5, 0.04, 0.03, IRON);
    fbox(f, du - 0.33, dv, 0.03, 0.13, 0.84, 0.07, RED);
    fbox(f, du + 0.33, dv, 0.03, 0.13, 0.84, 0.07, RED);
    fbox(f, du, dv + 0.36, 0.03, 0.8, 0.12, 0.07, RED);
    fbox(f, du, dv - 0.43, 0.05, 0.95, 0.07, 0.1, TEAL);
    crest(f, du, dv + 0.42, 0.03, 0.95, 0.3, TEAL);
    fflower(f, du - 0.33, dv + 0.12, 0.075, 0.07, GOLD, ORANGE, 5);
    fflower(f, du + 0.33, dv + 0.12, 0.075, 0.07, GOLD, ORANGE, 5);
    fflower(f, du - 0.33, dv - 0.2, 0.075, 0.07, GOLD, ORANGE, 5);
    fflower(f, du + 0.33, dv - 0.2, 0.075, 0.07, GOLD, ORANGE, 5);
  }
  win(front, 1.0, 3.0);
  win(front, -1.0, 3.0);
  for (const f of [sideR, sideL]) {
    win(f, 0.7, 3.05);
    win(f, -0.7, 3.05);
  }
  win(back, 0.0, 3.0);

  // door
  fbox(front, 0, 3.0, 0.02, 0.95, 1.4, 0.06, "#7b3a25");
  for (let i = -3; i <= 3; i++) fbox(front, i * 0.13, 3.0, 0.055, 0.012, 1.38, 0.02, "#4a2214");
  fbox(front, -0.56, 3.0, 0.04, 0.14, 1.5, 0.09, RED);
  fbox(front, 0.56, 3.0, 0.04, 0.14, 1.5, 0.09, RED);
  fbox(front, 0, 3.75, 0.04, 1.26, 0.12, 0.09, RED);
  crest(front, 0, 3.8, 0.04, 1.3, 0.42, TEAL);
  fbox(front, 0, 3.5, 0.075, 0.9, 0.06, 0.02, IRON);
  fbox(front, 0, 2.55, 0.075, 0.9, 0.06, 0.02, IRON);
  fflower(front, 0, 3.02, 0.08, 0.3, RED, GOLD, 8);
  fflower(front, 0, 3.02, 0.095, 0.14, GOLD, ORANGE, 6);
  b.part(new THREE.TorusGeometry(0.07, 0.016, 5, 10), IRON, { at: fpt(front, 0.34, 2.85, 0.1), dir: front.out, axis: "z" });
  fbox(front, 0, 2.28, 0.04, 1.0, 0.06, 0.12, "#6e4424");

  // ---------- gables ----------
  for (const zs of [1, -1]) {
    b.extrude(
      [[-1.7, 0], [1.7, 0], [0, 1.42]],
      { at: [0, 3.86, zs * 1.45], x: [1, 0, 0], thickness: 0.12, color: PLANK },
    );
    for (let i = -5; i <= 5; i++) {
      const x = i * 0.3;
      const h = 1.42 * (1 - Math.abs(x) / 1.7) - 0.07;
      if (h > 0.1) box([x, 3.86 + h / 2, zs * 1.535], [0.03, h, 0.03], "#8a6236");
    }
    const cx = 0, cy = 4.4, z = zs * 1.58;
    cylAlong([cx, cy, z], [0, 0, zs], 0.04, 0.3, RED, 12);
    glow(cylAlong([cx, cy, z + zs * 0.03], [0, 0, zs], 0.04, 0.22, GOLD, 12), 0.9);
    cylAlong([cx, cy, z + zs * 0.05], [0, 0, zs], 0.03, 0.1, ORANGE, 8);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.spike([cx + Math.cos(a) * 0.3, cy + Math.sin(a) * 0.3, z], [Math.cos(a), Math.sin(a), 0], i % 2 ? 0.14 : 0.22, 0.05, {
        color: i % 2 ? ORANGE : GOLD,
      });
    }
  }

  // ---------- roof ----------
  for (const s of [1, -1]) {
    const up = V(-s * 1.8, 1.5, 0).normalize();
    const n = V(s * 1.5, 1.8, 0).normalize();
    const eave = V(s * 1.8, 3.9, 0);
    const mid = eave.clone().add(up.clone().multiplyScalar(1.17 - 0.13));
    b.part(new THREE.BoxGeometry(3.7, 2.6, 0.1), DARKWOOD, { at: mid, dir: n, axis: "z", up: [0, 1, 0] });
    for (let k = 0; k < 7; k++) {
      const p = eave.clone().add(up.clone().multiplyScalar(-0.2 + 0.34 * k)).add(n.clone().multiplyScalar(0.07 + 0.008 * k));
      b.extrude(sawOutline(3.7, 18, 0.28, 0), {
        at: [p.x, p.y, -1.85],
        x: [0, 0, 1],
        y: [up.x, up.y, up.z],
        thickness: 0.07,
        color: SHINGLES[(k + (s > 0 ? 0 : 1)) % 3],
      });
    }
    // barge boards
    for (const z of [1.86, -1.86]) {
      const o = eave.clone().add(up.clone().multiplyScalar(-0.15)).add(n.clone().multiplyScalar(-0.04));
      b.extrude(sawOutline(2.55, 10, 0.16, 0.38), {
        at: [o.x, o.y, z],
        x: [up.x, up.y, up.z],
        y: [-n.x, -n.y, -n.z],
        thickness: 0.06,
        color: RED,
      });
      for (let i = 0; i < 10; i++) {
        const p = o.clone().add(up.clone().multiplyScalar(0.1 + i * 0.255)).add(n.clone().multiplyScalar(-0.2));
        b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 6), GOLD, {
          at: [p.x, p.y, z + (z > 0 ? 0.01 : -0.01)],
          dir: [0, 0, 1],
        });
      }
    }
    // moss
    for (const [t, zz] of [[0.5, -0.9], [1.3, 0.7], [1.9, -0.2], [0.9, 1.3]]) {
      const p = eave.clone().add(up.clone().multiplyScalar(t)).add(n.clone().multiplyScalar(0.2));
      sph([p.x, p.y, zz], 0.2, MOSS, [1.4, 0.5, 1]);
    }
  }
  cylAlong([0, 5.43, 0], [0, 0, 1], 3.8, 0.13, "#6e4424");
  // konyok horse heads
  const HORSE = [
    [0, 0], [0.5, 0], [0.55, 0.15], [0.72, 0.2], [0.74, 0.33], [0.58, 0.45], [0.52, 0.62], [0.4, 0.48], [0.3, 0.55], [0.12, 0.4], [0, 0.45],
  ] as [number, number][];
  for (const zs of [1, -1]) {
    b.extrude(HORSE, { at: [0, 5.35, zs * 1.35], x: [0, 0, zs], thickness: 0.11, color: RED });
    for (const x of [0.058, -0.058]) glow(sph([x, 5.68, zs * (1.35 + 0.58)], 0.03, GOLD), 1);
    sph([0, 5.5, zs * 1.55], 0.06, GOLD, [1.2, 1, 1]);
    b.spike([0, 5.4, zs * 1.28], [0, -0.1, -zs], 0.2, 0.05, { color: GOLD });
  }

  // chimney
  box([-0.9, 5.1, -0.5], [0.42, 1.3, 0.42], "#8a8480");
  for (const y of [4.8, 5.15, 5.5]) box([-0.9, y, -0.5], [0.45, 0.05, 0.45], "#4a4542");
  box([-0.9, 5.78, -0.5], [0.56, 0.1, 0.56], IRON);
  [[-0.9, 6.1, -0.5, 0.2], [-0.82, 6.5, -0.62, 0.26], [-0.7, 6.95, -0.78, 0.3]].forEach(([x, y, z, r], i) =>
    sph([x, y, z], r, i % 2 ? "#b9b6b8" : "#cfcccc", [1, 0.9, 1]),
  );

  return b.root;
}
