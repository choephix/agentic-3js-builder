```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "1930s desk typewriter in glossy racing green with chrome-rimmed round keys, a fan of type bars, a carriage with return lever, a half-typed sheet and a brass badge.",
};

const GREEN = "#0f4a32";
const DGREEN = "#0a3524";
const BLACK = "#141414";
const CHROME = "#d3dadd";
const CREAM = "#efe6c8";
const BRASS = "#b98d3c";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "typewriter" });
  b.joint("root", { at: [0, 0, 0] });
  b.joint("carriage", { parent: "root", at: [0, 0.235, -0.09], dir: [1, 0, 0] });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const put = (g: THREE.BufferGeometry, color: string, at: number[], bone = "root", rotation?: number[], scale?: number | number[]) =>
    b.part(g, color, { at, bone, rotation, scale: scale as any });

  // ---- body ----
  put(box(0.34, 0.075, 0.36), GREEN, [0, 0.05, 0]);
  put(box(0.33, 0.035, 0.16), DGREEN, [0, 0.095, 0.1]);
  put(box(0.3, 0.042, 0.12), GREEN, [0, 0.1085, -0.1]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(cyl(0.014, 0.016, 0.0125, 10), BLACK, [sx * 0.14, 0.00625, sz * 0.14]);
  // chrome trim + pinstripes
  put(box(0.345, 0.004, 0.004), CHROME, [0, 0.0885, 0.181]);
  put(box(0.345, 0.004, 0.004), CHROME, [0, 0.0145, 0.181]);
  put(box(0.3, 0.003, 0.002), CREAM, [0, 0.072, 0.1815]);
  for (const sx of [-1, 1]) {
    put(box(0.002, 0.004, 0.31), CREAM, [sx * 0.1705, 0.06, 0]);
    put(box(0.002, 0.03, 0.002), CREAM, [sx * 0.1705, 0.05, 0.17]);
  }

  // ---- badge ----
  put(cyl(0.024, 0.024, 0.003, 14), BRASS, [0, 0.045, 0.1815], "root", [90, 0, 0], [1.6, 1, 0.8]);
  put(cyl(0.02, 0.02, 0.004, 14), "#d6ad55", [0, 0.045, 0.1818], "root", [90, 0, 0], [1.6, 1, 0.7]);
  const badgeTex = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><text x="50" y="19" font-family="serif" font-weight="bold" font-size="15" text-anchor="middle" fill="#2a2a2a">VERDE</text><text x="50" y="33" font-family="serif" font-size="9" text-anchor="middle" fill="#2a2a2a">No. 7 · 1934</text></svg>`,
    { size: 256 },
  );
  const bp = new THREE.PlaneGeometry(0.056, 0.022);
  b.part(bp, "#ffffff", { at: [0, 0.045, 0.1842], bone: "root", texture: badgeTex });

  // ---- keyboard deck ----
  const th = 14;
  const rad = (th * Math.PI) / 180;
  const cy = 0.098;
  const cz = 0.1;
  const w = (lx: number, ly: number, lz: number) => [lx, cy + ly * Math.cos(rad) - lz * Math.sin(rad), cz + ly * Math.sin(rad) + lz * Math.cos(rad)];
  put(box(0.345, 0.016, 0.17), GREEN, [0, cy, cz], "root", [th, 0, 0]);
  put(box(0.35, 0.006, 0.006), CHROME, w(0, 0.0, 0.088), "root", [th, 0, 0]);

  const rows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL-", "ZXCVBNM,.?"];
  let cells = "";
  rows.forEach((r, ri) =>
    [...r].forEach((ch, ci) => {
      cells += `<text x="${ci * 10 + 5}" y="${ri * 10 + 7.6}" font-family="Georgia,serif" font-weight="bold" font-size="7" text-anchor="middle" fill="#2a2a2a">${ch}</text>`;
    }),
  );
  const atlas = svg(`<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`, { size: 1024 });

  const offs = [0, 0.013, 0.006, 0.019];
  const lzs = [-0.062, -0.036, -0.01, 0.016];
  rows.forEach((_, ri) => {
    for (let ci = 0; ci < 10; ci++) {
      const lx = (ci - 4.5) * 0.026 + offs[ri] - 0.0095;
      put(cyl(0.0125, 0.0125, 0.01, 10), CHROME, w(lx, 0.013, lzs[ri]), "root", [th, 0, 0]);
      put(cyl(0.0097, 0.0097, 0.004, 10), CREAM, w(lx, 0.02, lzs[ri]), "root", [th, 0, 0]);
      const g = new THREE.PlaneGeometry(0.0135, 0.0135);
      const u0 = ci / 10, u1 = (ci + 1) / 10, v1 = 1 - ri / 4, v0 = 1 - (ri + 1) / 4;
      g.setAttribute("uv", new THREE.Float32BufferAttribute([u0, v1, u1, v1, u0, v0, u1, v0], 2));
      g.rotateX(-Math.PI / 2);
      b.part(g, "#ffffff", { at: w(lx, 0.0222, lzs[ri]), bone: "root", rotation: [th, 0, 0], texture: atlas });
    }
  });
  for (const sx of [-1, 1]) {
    put(box(0.034, 0.01, 0.022), CHROME, w(sx * 0.15, 0.013, lzs[3]), "root", [th, 0, 0]);
    put(box(0.027, 0.004, 0.017), CREAM, w(sx * 0.15, 0.02, lzs[3]), "root", [th, 0, 0]);
  }
  put(box(0.16, 0.008, 0.019), CHROME, w(0, 0.012, 0.056), "root", [th, 0, 0]);
  put(box(0.15, 0.004, 0.013), CREAM, w(0, 0.0175, 0.056), "root", [th, 0, 0]);

  // ---- type bar basket ----
  put(new THREE.TorusGeometry(0.125, 0.004, 5, 28, Math.PI), CHROME, [0, 0.135, -0.01], "root", undefined, [1, 0.5, 1]);
  const S = new THREE.Vector3(0, 0.232, -0.062);
  const N = 25;
  for (let i = 0; i < N; i++) {
    const a = ((8 + (164 * i) / (N - 1)) * Math.PI) / 180;
    const P = new THREE.Vector3(0.125 * Math.cos(a), 0.135 + 0.0625 * Math.sin(a), -0.01);
    b.rod(P, S, 0.0016, { color: "#c4cbcf", sides: 4, caps: "flat", bone: "root" });
    const e = P.clone().lerp(S, 0.9);
    b.part(box(0.004, 0.011, 0.0025), "#8d9599", { at: e, dir: S.clone().sub(P), bone: "root" });
    put(new THREE.SphereGeometry(0.004, 6, 5), CHROME, P.toArray());
  }

  // ribbon spools
  for (const sx of [-1, 1]) {
    put(cyl(0.034, 0.034, 0.008, 14), CHROME, [sx * 0.115, 0.1325, -0.115]);
    put(cyl(0.025, 0.025, 0.012, 12), "#1b1b1b", [sx * 0.115, 0.1355, -0.115]);
    put(cyl(0.006, 0.006, 0.018, 8), CHROME, [sx * 0.115, 0.14, -0.115]);
  }

  // ---- carriage support ----
  for (const sx of [-1, 1]) put(box(0.03, 0.07, 0.09), GREEN, [sx * 0.165, 0.16, -0.09]);
  put(box(0.4, 0.02, 0.075), DGREEN, [0, 0.19, -0.09], "carriage");
  put(box(0.3, 0.008, 0.003), CHROME, [0, 0.19, -0.0545], "carriage");
  for (let i = -14; i <= 14; i++) put(box(0.0008, i % 5 === 0 ? 0.006 : 0.004, 0.0008), BLACK, [i * 0.0105, 0.1925, -0.0535], "carriage");
  for (const sx of [-1, 1]) {
    put(box(0.012, 0.075, 0.08), GREEN, [sx * 0.205, 0.23, -0.09], "carriage");
    put(box(0.014, 0.012, 0.085), CHROME, [sx * 0.205, 0.27, -0.09], "carriage");
  }

  // platen
  put(cyl(0.026, 0.026, 0.4, 14), BLACK, [0, 0.235, -0.09], "carriage", [0, 0, 90]);
  put(cyl(0.005, 0.005, 0.47, 8), CHROME, [0, 0.235, -0.09], "carriage", [0, 0, 90]);
  for (const sx of [-1, 1]) {
    put(cyl(0.021, 0.021, 0.022, 12), BLACK, [sx * 0.245, 0.235, -0.09], "carriage", [0, 0, 90]);
    put(cyl(0.0125, 0.0125, 0.026, 10), CHROME, [sx * 0.247, 0.235, -0.09], "carriage", [0, 0, 90]);
    put(cyl(0.017, 0.017, 0.005, 10), CHROME, [sx * 0.233, 0.235, -0.09], "carriage", [0, 0, 90]);
  }

  // paper bail
  b.rod([-0.19, 0.247, -0.059], [0.19, 0.247, -0.059], 0.0025, { color: CHROME, sides: 6, bone: "carriage" });
  for (const sx of [-1, 1]) b.rod([sx * 0.19, 0.247, -0.059], [sx * 0.205, 0.265, -0.075], 0.0025, { color: CHROME, sides: 6, bone: "carriage" });

  // ---- return lever ----
  const L0 = new THREE.Vector3(0.215, 0.27, -0.09);
  const L1 = new THREE.Vector3(0.232, 0.305, -0.055);
  const L2 = new THREE.Vector3(0.232, 0.31, 0.0);
  b.rod(L0, L1, 0.0035, { color: CHROME, sides: 6, bone: "carriage" });
  b.rod(L1, L2, 0.0035, { color: CHROME, sides: 6, bone: "carriage" });
  put(new THREE.SphereGeometry(0.0085, 8, 6), BLACK, L2.toArray(), "carriage");
  put(new THREE.SphereGeometry(0.006, 6, 5), CHROME, L1.toArray(), "carriage");

  // ---- paper ----
  const tilt = -14;
  const t = (tilt * Math.PI) / 180;
  const pc = [0, 0.34, -0.09];
  put(box(0.21, 0.17, 0.001), "#f2ecda", pc, "carriage", [tilt, 0, 0]);
  const lines = [
    "Dear Mr. Hargrove,",
    "I write to confirm receipt of",
    "your letter of the 14th inst.",
    "The shipment left Rotterdam on",
    "Tuesday and should reach us by",
    "the end of the month, weather",
    "permitting. Kindly advise as to",
    "the matter of the invoice and",
    "believe me, yours very truly,",
  ];
  let txt = "";
  lines.forEach((l, i) => {
    txt += `<text x="14" y="${70 + i * 10.5}" font-family="Courier New,monospace" font-size="7.2" fill="#2b2a2a">${l}</text>`;
  });
  const paperTex = svg(
    `<svg viewBox="0 0 210 170" xmlns="http://www.w3.org/2000/svg"><rect width="210" height="170" fill="#f4efe0"/>${txt}<rect x="150" y="31" width="38" height="2" fill="#d9d2bd"/></svg>`,
    { size: 512 },
  );
  const off = 0.0009;
  b.part(new THREE.PlaneGeometry(0.208, 0.168), "#ffffff", {
    at: [pc[0], pc[1] - off * Math.sin(t), pc[2] + off * Math.cos(t)],
    bone: "carriage",
    rotation: [tilt, 0, 0],
    texture: paperTex,
  });

  return b.root;
}
```