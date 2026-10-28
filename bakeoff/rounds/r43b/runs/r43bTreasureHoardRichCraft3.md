```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, svg, grain } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "Stylised hextech-flavoured treasure hoard: open blue chest, coin mounds, glowing gems, a jewelled crown and goblets.",
};

const GOLDS = ["#f2c23a", "#e0a82a", "#ffd96a"];
const MOUND = "#9c6a1e";
const GEMS = {
  ruby: "#ff2a4e",
  sapphire: "#2f8bff",
  emerald: "#2cd67a",
  amethyst: "#b455ff",
  citrine: "#ffcf3a",
  aqua: "#3ff0e0",
} as const;
const GEM_KEYS = Object.keys(GEMS) as (keyof typeof GEMS)[];

const EMBLEM = svg(
  `<svg viewBox="0 0 100 64">
  <rect x="1" y="1" width="98" height="62" rx="8" fill="#14213a" stroke="#f2c23a" stroke-width="3"/>
  <polygon points="50,6 78,20 78,44 50,58 22,44 22,20" fill="#1e3f7a" stroke="#ffd96a" stroke-width="3"/>
  <polygon points="50,14 68,24 68,40 50,50 32,40 32,24" fill="#2f8bff" stroke="#9fe8ff" stroke-width="2"/>
  <path d="M50 18 L55 30 L68 32 L58 40 L61 52 L50 45 L39 52 L42 40 L32 32 L45 30Z" fill="#fff3b0" stroke="#e0a82a" stroke-width="1.5"/>
  <circle cx="10" cy="10" r="3" fill="#ffd96a"/><circle cx="90" cy="10" r="3" fill="#ffd96a"/>
  <circle cx="10" cy="54" r="3" fill="#ffd96a"/><circle cx="90" cy="54" r="3" fill="#ffd96a"/>
  </svg>`,
  { size: 256 },
);
const COIN = svg(
  `<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#f2c23a" stroke="#9c6a1e" stroke-width="4"/>
  <circle cx="32" cy="32" r="22" fill="#ffd96a" stroke="#c98d22" stroke-width="2"/>
  <path d="M32 14 L38 28 L52 30 L41 39 L45 53 L32 45 L19 53 L23 39 L12 30 L26 28Z" fill="#e0a82a" stroke="#9c6a1e" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);
const SPARK = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 0 L37 27 L64 32 L37 37 L32 64 L27 37 L0 32 L27 27Z" fill="#ffffff"/>
  <path d="M32 14 L35 29 L50 32 L35 35 L32 50 L29 35 L14 32 L29 29Z" fill="#fff6c0"/></svg>`,
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "hoard" });
  const R = rng(11);

  const GILT = metal("gilt");
  const STEEL = metal("steel");
  const WOOD = grain("#27395a", "#3d5686", { size: 0.02, axis: "x" });

  const Y = new THREE.Vector3(0, 1, 0);
  const coinGeos: Record<string, THREE.BufferGeometry[]> = {};
  const gemGeos: Record<string, THREE.BufferGeometry[]> = {};
  const gemSpots: THREE.Vector3[] = [];
  for (const c of GOLDS) coinGeos[c] = [];
  for (const k of GEM_KEYS) gemGeos[k] = [];

  const mat = (p: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3) =>
    new THREE.Matrix4().compose(p, q, s);

  function addCoin(p: THREE.Vector3, rx: number, ry: number, rz: number, scale = 1) {
    const g = new THREE.CylinderGeometry(0.035, 0.035, 0.007, 9);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
    g.applyMatrix4(mat(p, q, new THREE.Vector3(scale, 1, scale)));
    coinGeos[GOLDS[Math.floor(R() * 3)]].push(g);
  }
  function addGem(p: THREE.Vector3, size: number, key?: keyof typeof GEMS, q?: THREE.Quaternion) {
    const k = key ?? GEM_KEYS[Math.floor(R() * GEM_KEYS.length)];
    const tall = R() < 0.5;
    const g = tall ? new THREE.OctahedronGeometry(1) : new THREE.IcosahedronGeometry(1, 0);
    const qq = q ?? new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 3, R() * 3, R() * 3));
    g.applyMatrix4(mat(p, qq, new THREE.Vector3(size, size * (tall ? 1.4 : 0.9), size)));
    gemGeos[k].push(g.toNonIndexed());
    gemSpots.push(p.clone());
  }

  // ---- heaps of coins ----
  function heap(cx: number, cz: number, rad: number, H: number, n: number, baseY = 0, gems = 6) {
    const prof: [number, number][] = [
      [0, H * 0.92],
      [rad * 0.45, H * 0.75],
      [rad * 0.8, H * 0.32],
      [rad * 0.97, 0.01],
      [rad * 0.9, 0],
      [0, 0],
    ];
    b.lathe(prof, { at: [cx, baseY, cz], segments: 10, color: MOUND });
    const h = (r: number) => baseY + H * 0.92 * (1 - (r / rad) ** 2);
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2;
      const r = rad * Math.sqrt(R()) * 0.95;
      const slope = (r / rad) * 0.7;
      const tx = Math.cos(a) * -slope;
      const tz = Math.sin(a) * slope;
      addCoin(
        new THREE.Vector3(cx + Math.cos(a) * r, h(r) + 0.008, cz + Math.sin(a) * r),
        (R() - 0.5) * 1.2 + tz,
        R() * 6,
        (R() - 0.5) * 1.2 + tx,
      );
    }
    for (let i = 0; i < gems; i++) {
      const a = R() * Math.PI * 2;
      const r = rad * Math.sqrt(R()) * 0.8;
      const s = 0.02 + R() * 0.02;
      addGem(new THREE.Vector3(cx + Math.cos(a) * r, h(r) + s * 0.8, cz + Math.sin(a) * r), s);
    }
    return (r: number) => h(r);
  }

  const hA = heap(0.58, -0.12, 0.44, 0.28, 170, 0, 9);
  heap(-0.52, 0.0, 0.4, 0.23, 150, 0, 8);
  heap(0.12, 0.5, 0.34, 0.15, 90, 0, 5);
  heap(0, -0.27, 0.2, 0.09, 55, 0.3, 5);

  // coin stacks and standing coins
  const stack = (x: number, z: number, n: number) => {
    for (let i = 0; i < n; i++)
      addCoin(new THREE.Vector3(x + (R() - 0.5) * 0.008, 0.004 + i * 0.0075, z + (R() - 0.5) * 0.008), 0, R() * 6, 0);
  };
  stack(-0.12, 0.4, 7);
  stack(-0.04, 0.46, 5);
  stack(-0.2, 0.52, 9);
  stack(0.55, 0.48, 6);

  const standing = [
    [0.38, 0.5, 0.5],
    [-0.28, 0.3, -0.5],
    [0.8, 0.28, 0.3],
  ];
  for (const [x, z, rot] of standing) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, rot, 0, "YXZ"));
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 14), "#e0a82a", {
      at: [x, 0.058, z],
      quat: q,
    });
    const nrm = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    b.part(new THREE.CircleGeometry(0.052, 14), "#ffffff", {
      at: new THREE.Vector3(x, 0.058, z).addScaledVector(nrm, 0.0058),
      dir: nrm.toArray() as [number, number, number],
      axis: "z",
      texture: COIN,
    });
  }

  // ---- chest ----
  const CZ = -0.27;
  b.part(new THREE.BoxGeometry(0.62, 0.32, 0.42), WOOD, { at: [0, 0.16, CZ] });
  b.part(new THREE.BoxGeometry(0.67, 0.045, 0.47), GILT, { at: [0, 0.0225, CZ] });
  b.part(new THREE.BoxGeometry(0.65, 0.03, 0.45), GILT, { at: [0, 0.31, CZ] });
  for (const sx of [-0.2, 0.2])
    b.part(new THREE.BoxGeometry(0.05, 0.32, 0.435), GILT, { at: [sx, 0.16, CZ] });
  const studs: THREE.BufferGeometry[] = [];
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      for (const y of [0.05, 0.28])
        studs.push(new THREE.SphereGeometry(0.02, 6, 4).translate(sx * 0.325, y, CZ + sz * 0.225));
  for (const sx of [-0.2, 0.2, -0.1, 0.1, 0]) studs.push(new THREE.SphereGeometry(0.014, 6, 4).translate(sx, 0.31, CZ + 0.232));
  b.part(mergeGeometries(studs)!, GILT, { at: [0, 0, 0] });

  glow(
    b.part(new THREE.PlaneGeometry(0.22, 0.14), "#ffffff", {
      at: [0, 0.16, CZ + 0.2135],
      dir: [0, 0, 1],
      axis: "z",
      texture: EMBLEM,
    }),
    0.5,
  );
  b.part(new THREE.BoxGeometry(0.24, 0.16, 0.012), "#c98d22", { at: [0, 0.16, CZ + 0.211] });

  // open lid
  const hinge = new THREE.Vector3(0, 0.32, CZ - 0.2);
  const lidBase: [number, number][] = [
    [0, 0], [0, 0.12], [0.05, 0.17], [0.21, 0.2], [0.37, 0.17], [0.42, 0.12], [0.42, 0],
  ];
  const lid = (g: number): [number, number][] =>
    lidBase.map(([u, v]) => [0.21 + (u - 0.21) * (1 + g), 0.06 + (v - 0.06) * (1 + g * 1.5)]);
  const ux: [number, number, number] = [0, 0.966, -0.259];
  const vy: [number, number, number] = [0, -0.259, -0.966];
  b.extrude(lid(0), { at: hinge, x: ux, y: vy, thickness: 0.62, color: WOOD });
  for (const sx of [-0.2, 0.2])
    b.extrude(lid(0.07), {
      at: hinge.clone().add(new THREE.Vector3(sx, 0, 0)),
      x: ux,
      y: vy,
      thickness: 0.05,
      color: GILT,
    });
  // red velvet lining on lid inside (u axis side)
  b.part(new THREE.BoxGeometry(0.54, 0.012, 0.36), "#a31f3a", {
    at: hinge.clone().add(new THREE.Vector3(0, 0.002, 0)).add(new THREE.Vector3(0, 0.966 * 0.21 + 0.0, -0.259 * 0.21)).add(new THREE.Vector3(0, 0.259 * -0.012, 0.966 * 0.014)),
    dir: ux,
  });

  // chest gems on mound
  for (let i = 0; i < 3; i++)
    addGem(new THREE.Vector3(-0.1 + i * 0.1, 0.4, CZ + 0.02), 0.03, GEM_KEYS[i * 2 % 6]);

  // ---- crown ----
  {
    const C = new THREE.Vector3(0.58, hA(0.0) + 0.04, -0.12);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.18, 0.5, -0.12));
    const ax = Y.clone().applyQuaternion(q).toArray() as [number, number, number];
    const place = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(C);
    b.lathe(
      [[0.098, 0], [0.112, 0], [0.119, 0.055], [0.108, 0.062], [0.1, 0.055]],
      { at: C, axis: ax, segments: 12, color: GILT },
    );
    b.lathe([[0, 0.03], [0.095, 0.035], [0.095, 0.065], [0.06, 0.105], [0, 0.115]], {
      at: C,
      axis: ax,
      segments: 12,
      color: "#b3233f",
    });
    const N = 8;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const tall = i % 2 === 0;
      const h = tall ? 0.085 : 0.055;
      const rr = 0.112;
      const px = Math.sin(a) * rr;
      const pz = Math.cos(a) * rr;
      b.part(new THREE.ConeGeometry(0.024, h, 6), GILT, { at: place(px, 0.055 + h / 2 - 0.005, pz), quat: q });
      addGem(place(px * 1.02, 0.06 + h, pz * 1.02), tall ? 0.017 : 0.012, tall ? "ruby" : "aqua", q);
      addGem(place(Math.sin(a + 0.4) * 0.12, 0.028, Math.cos(a + 0.4) * 0.12), 0.013, GEM_KEYS[i % 6], q);
    }
  }

  // ---- goblets ----
  const gobletOutline: [number, number][] = [
    [0, 0], [0.055, 0], [0.055, 0.012], [0.02, 0.03], [0.014, 0.08], [0.026, 0.095], [0.052, 0.115],
    [0.064, 0.17], [0.058, 0.205], [0.05, 0.205], [0.055, 0.17], [0.045, 0.125], [0, 0.115],
  ];
  function goblet(pos: THREE.Vector3, q: THREE.Quaternion, fill: any) {
    const ax = Y.clone().applyQuaternion(q).toArray() as [number, number, number];
    b.lathe(gobletOutline, { at: pos, axis: ax, segments: 10, color: fill });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = new THREE.Vector3(Math.sin(a) * 0.063, 0.15, Math.cos(a) * 0.063).applyQuaternion(q).add(pos);
      addGem(p, 0.012, GEM_KEYS[i], q);
    }
    const kp = new THREE.Vector3(0, 0.055, 0).applyQuaternion(q).add(pos);
    b.part(new THREE.SphereGeometry(0.024, 7, 5), fill, { at: kp });
  }
  goblet(new THREE.Vector3(-0.22, 0, 0.62), new THREE.Quaternion(), GILT);
  goblet(new THREE.Vector3(-0.78, 0, 0.38), new THREE.Quaternion(), STEEL);
  goblet(
    new THREE.Vector3(-0.32, 0.17, 0.14),
    new THREE.Quaternion().setFromUnitVectors(Y, new THREE.Vector3(1, 0.15, 0.4).normalize()),
    GILT,
  );
  // spilled coins from tipped goblet
  for (let i = 0; i < 10; i++)
    addCoin(new THREE.Vector3(-0.1 + i * 0.03, 0.2 - i * 0.012 + R() * 0.01, 0.2 + R() * 0.08), (R() - 0.5) * 0.9, R() * 6, (R() - 0.5) * 0.9);

  // large gems on the floor
  addGem(new THREE.Vector3(0.45, 0.05, 0.62), 0.05, "ruby");
  addGem(new THREE.Vector3(0.62, 0.045, 0.55), 0.04, "sapphire");
  addGem(new THREE.Vector3(-0.55, 0.045, 0.62), 0.045, "emerald");
  addGem(new THREE.Vector3(0.2, 0.04, 0.85), 0.04, "amethyst");

  // ---- flush merged parts ----
  for (const c of GOLDS) if (coinGeos[c].length) b.part(mergeGeometries(coinGeos[c])!, c, { at: [0, 0, 0] });
  for (const k of GEM_KEYS)
    if (gemGeos[k].length) glow(b.part(mergeGeometries(gemGeos[k])!, GEMS[k], { at: [0, 0, 0] }), 0.85);

  // sparkles
  const spots = gemSpots.filter((_, i) => i % 5 === 0).slice(0, 10);
  glow(
    b.cards(
      spots.map((p) => ({ ...(p as any) })).length
        ? spots.map((p) => frameAt(p))
        : [],
      SPARK,
      { size: 0.07, lean: 0, flow: [0, 0, 1], color: "#fff6c0" },
    ) as any,
    1.2,
  );

  function frameAt(p: THREE.Vector3) {
    return { at: p.clone().add(new THREE.Vector3(0, 0.03, 0.03)), axis: new THREE.Vector3(0, 1, 0) } as any;
  }

  return b.root;
}
```